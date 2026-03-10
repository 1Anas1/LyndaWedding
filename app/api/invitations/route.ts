import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug: lettres minuscules, chiffres et tirets uniquement'),
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await requireOwner()
    const body = await request.json()
    const validated = createSchema.parse(body)

    const existing = await db.invitation.findUnique({
      where: { slug: validated.slug },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Une invitation avec ce lien existe déjà. Choisissez un autre lien.' },
        { status: 400 }
      )
    }

    const theme = await db.theme.findFirst({
      where: { isActive: true },
    })
    if (!theme) {
      return NextResponse.json(
        { error: 'Aucun thème disponible. Exécutez le seed.' },
        { status: 500 }
      )
    }

    const defaultContent = {
      hero: {
        names: ['Prénom 1', 'Prénom 2'],
        date: '',
        message: '',
      },
      sections: { story: { enabled: true, content: '' }, countdown: { enabled: true }, registry: { enabled: false } },
      faqs: [],
      guestMessageSection: { enabled: true, label: 'Écrivez un mot' },
      accommodations: [],
    }

    const defaultSettings = {
      rsvpEnabled: true,
      previewEnabled: true,
      allowEdit: false,
      requireEmail: false,
      requirePhone: false,
    }

    const invitation = await db.invitation.create({
      data: {
        ownerId: user.id,
        slug: validated.slug,
        title: validated.title || null,
        themeId: theme.id,
        contentJson: defaultContent,
        settingsJson: defaultSettings,
      },
      include: {
        theme: true,
        events: true,
      },
    })

    return NextResponse.json(invitation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create invitation error:', error)
    return NextResponse.json(
      { error: 'Impossible de créer l\'invitation' },
      { status: 500 }
    )
  }
}
