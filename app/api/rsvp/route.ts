import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { InvitationStatus } from '@prisma/client'

const rsvpSchema = z.object({
  invitationSlug: z.string().min(1),
  guestName: z.string().min(1),
  attending: z.boolean(),
  partySize: z.number().min(1).max(10),
  notes: z.string().optional(),
  dietary: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = rsvpSchema.parse(body)

    // Find invitation
    const invitation = await db.invitation.findUnique({
      where: { slug: validated.invitationSlug },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation is published or preview-enabled
    const isPublished = invitation.status === InvitationStatus.PUBLISHED
    const settings = invitation.settingsJson as { previewEnabled?: boolean }
    const canPreview = settings.previewEnabled === true

    if (!isPublished && !canPreview) {
      return NextResponse.json(
        { error: 'Invitation is not available' },
        { status: 403 }
      )
    }

    // Check RSVP settings
    const rsvpSettings = invitation.settingsJson as { rsvpEnabled?: boolean }
    if (rsvpSettings.rsvpEnabled === false) {
      return NextResponse.json(
        { error: 'RSVP is not enabled for this invitation' },
        { status: 403 }
      )
    }

    // Deduplication: Check for existing RSVP in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const existingRSVP = await db.rSVP.findFirst({
      where: {
        invitationId: invitation.id,
        guestName: validated.guestName,
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (existingRSVP) {
      return NextResponse.json({
        ok: true,
        rsvpId: existingRSVP.id,
        message: 'RSVP already submitted',
      })
    }

    // Create RSVP
    const rsvp = await db.rSVP.create({
      data: {
        invitationId: invitation.id,
        guestName: validated.guestName,
        email: validated.email,
        phone: validated.phone,
        attending: validated.attending,
        partySize: validated.partySize,
        notes: validated.notes,
        dietary: validated.dietary,
      },
    })

    return NextResponse.json({
      ok: true,
      rsvpId: rsvp.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('RSVP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
