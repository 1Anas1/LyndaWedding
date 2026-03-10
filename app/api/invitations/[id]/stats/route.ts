import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'

/**
 * GET /api/invitations/[id]/stats
 * Returns view count and guest messages for the invitation (owner only).
 */
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireOwner()
    const { id } = await params

    const invitation = await db.invitation.findUnique({
      where: { id },
      include: {
        rsvps: {
          where: { notes: { not: null } },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            guestName: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const viewCount = await db.invitationView.count({
      where: { invitationId: id },
    })

    return NextResponse.json({
      viewCount,
      messages: invitation.rsvps.map((r) => ({
        id: r.id,
        guestName: r.guestName,
        message: r.notes,
        createdAt: r.createdAt,
      })),
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
