import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { put } from '@vercel/blob'
import { validateEventImageFile } from '@/lib/upload'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await requireOwner()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    const validation = validateEventImageFile(file)
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is not set')
      return NextResponse.json(
        { error: 'Upload non configuré (BLOB_READ_WRITE_TOKEN manquant)' },
        { status: 500 }
      )
    }

    const ext = file.name.replace(/^.*\./, '') || 'jpg'
    const pathname = `events/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`

    const blob = await put(pathname, file, {
      access: 'private',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Upload error:', message, err)

    // Helpful messages for known Blob/config issues (no secrets exposed)
    if (/private store|public access on a private/i.test(message)) {
      return NextResponse.json(
        {
          error:
            'Store Blob en mode privé : l’upload utilise bien "private". Si l’erreur persiste, redéployez.',
        },
        { status: 500 }
      )
    }
    if (
      /token|unauthorized|401|forbidden|403|blob.*config|store/i.test(message)
    ) {
      return NextResponse.json(
        {
          error:
            'Configuration Blob invalide. Vérifiez BLOB_READ_WRITE_TOKEN dans les variables d’environnement Vercel (Storage → Blob).',
        },
        { status: 500 }
      )
    }
    if (/size|too large|413/i.test(message)) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 4 Mo)' },
        { status: 413 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l’upload' },
      { status: 500 }
    )
  }
}
