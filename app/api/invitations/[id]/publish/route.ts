import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import { InvitationStatus } from '@prisma/client'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireOwner()
    const { id } = await params

    const invitation = await db.invitation.findUnique({
      where: { id },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    if (invitation.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (invitation.status === InvitationStatus.PUBLISHED) {
      return NextResponse.json(
        { error: 'Invitation is already published' },
        { status: 400 }
      )
    }

    // Publish (free – no payment required)
    const updated = await db.invitation.update({
      where: { id },
      data: {
        status: InvitationStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        theme: true,
        events: {
          orderBy: { startsAt: 'asc' },
        },
        owner: true,
      },
    })

    return NextResponse.json({
      success: true,
      invitation: updated,
    })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
