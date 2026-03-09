import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { put } from '@vercel/blob'
import { validateEventImageFile } from '@/lib/upload'

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
      access: 'public',
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: 'Erreur lors de l’upload' },
      { status: 500 }
    )
  }
}
