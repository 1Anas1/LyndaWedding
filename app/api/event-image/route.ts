import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'

export const dynamic = 'force-dynamic'

/**
 * Serves event images from a private Vercel Blob store.
 * Use ?url=<encoded-blob-url> so invitation pages can display uploaded venue images.
 */
export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url')
  if (!urlParam) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  let blobUrl: string
  try {
    blobUrl = decodeURIComponent(urlParam)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  // Only allow Vercel Blob URLs and restrict to /events/ path
  if (
    !blobUrl.includes('blob.vercel-storage.com') ||
    !blobUrl.includes('/events/')
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'Upload non configuré' },
      { status: 503 }
    )
  }

  try {
    const result = await get(blobUrl, {
      access: 'private',
      token,
    })

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob?.contentType ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error('Event image get error:', err)
    return NextResponse.json(
      { error: 'Erreur lors du chargement de l’image' },
      { status: 500 }
    )
  }
}
