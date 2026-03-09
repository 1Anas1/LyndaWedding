import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/invites/[slug]/view
 * Record a view for the invitation (public, no auth).
 * Call once per page load from the wedding page.
 * Optional body: { sessionId?: string } for deduplication.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const invitation = await db.invitation.findUnique({
      where: { slug },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    let sessionId: string | null = null
    try {
      const body = await request.json().catch(() => ({}))
      sessionId = body.sessionId ?? null
    } catch {
      // ignore
    }

    await db.invitationView.create({
      data: {
        invitationId: invitation.id,
        sessionId,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('View count error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
