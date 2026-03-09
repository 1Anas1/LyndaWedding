import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import { InvitationStatus, PaymentStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireOwner()
    const { id } = await params

    const invitation = await db.invitation.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Verify invitation belongs to current user
    if (invitation.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if already published
    if (invitation.status === InvitationStatus.PUBLISHED) {
      return NextResponse.json(
        { error: 'Invitation is already published' },
        { status: 400 }
      )
    }

    // Check for paid payment
    const paidPayment = invitation.payments.find(
      (p) => p.status === PaymentStatus.PAID
    )

    if (!paidPayment) {
      return NextResponse.json(
        {
          error: 'Payment required',
          message: 'Please complete payment before publishing your invitation.',
        },
        { status: 402 } // 402 Payment Required
      )
    }

    // Publish the invitation
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
