import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const eventSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(200),
  startsAt: z.string().min(1),
  endsAt: z.string().optional().nullable(),
  locationName: z.string().max(300).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  mapLat: z.number().optional().nullable(),
  mapLng: z.number().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().max(2000).optional().nullable().or(z.literal('')),
})

const putSchema = z.object({
  events: z.array(eventSchema),
})

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { db } = await import('@/lib/db')
  const { requireOwner } = await import('@/lib/auth')

  try {
    const user = await requireOwner()
    const { id: invitationId } = await params

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: { events: true },
    })

    if (!invitation || invitation.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { events } = putSchema.parse(body)

    const existingIds = new Set(invitation.events.map((e) => e.id))
    const payloadIds = new Set(events.filter((e) => e.id).map((e) => e.id!))
    const toDelete = invitation.events.filter((e) => !payloadIds.has(e.id))

    for (const e of toDelete) {
      await db.event.delete({ where: { id: e.id } })
    }

    for (const e of events) {
      const startsAt = new Date(e.startsAt)
      const endsAt = e.endsAt ? new Date(e.endsAt) : null
      const imageUrl = e.imageUrl && e.imageUrl.trim() !== '' ? e.imageUrl : null

      if (e.id && existingIds.has(e.id)) {
        await db.event.update({
          where: { id: e.id },
          data: {
            name: e.name,
            startsAt,
            endsAt,
            locationName: e.locationName ?? null,
            address: e.address ?? null,
            mapLat: e.mapLat ?? null,
            mapLng: e.mapLng ?? null,
            notes: e.notes ?? null,
            imageUrl,
          },
        })
      } else {
        await db.event.create({
          data: {
            invitationId,
            name: e.name,
            startsAt,
            endsAt,
            locationName: e.locationName ?? null,
            address: e.address ?? null,
            mapLat: e.mapLat ?? null,
            mapLng: e.mapLng ?? null,
            notes: e.notes ?? null,
            imageUrl,
          },
        })
      }
    }

    const updated = await db.invitation.findUnique({
      where: { id: invitationId },
      include: { events: { orderBy: { startsAt: 'asc' } } },
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: err.errors },
        { status: 400 }
      )
    }
    console.error('Events PUT error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
