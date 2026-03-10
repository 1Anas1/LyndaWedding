import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

const updateSchema = z.object({
  contentJson: z.unknown().optional(),
  settingsJson: z.unknown().optional(),
})

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireOwner()
    const { id } = await params
    const body = await request.json()
    const validated = updateSchema.parse(body)

    const invitation = await db.invitation.findUnique({
      where: { id },
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

    const updateData: Prisma.InvitationUpdateInput = {}
    
    if (validated.contentJson !== undefined) {
      updateData.contentJson = validated.contentJson as Prisma.InputJsonValue
    }
    
    if (validated.settingsJson !== undefined) {
      updateData.settingsJson = validated.settingsJson as Prisma.InputJsonValue
    }

    const updated = await db.invitation.update({
      where: { id },
      data: updateData,
      include: {
        theme: true,
        events: {
          orderBy: { startsAt: 'asc' },
        },
        owner: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
