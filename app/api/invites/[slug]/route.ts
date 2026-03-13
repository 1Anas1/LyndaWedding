import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { formatTimeInAppTz, getCountdownTargetISO } from '@/lib/timezone'

/**
 * GET /api/invites/[slug]
 * Returns invitation data for the static clone frontend.
 * Public endpoint - no auth required.
 */
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const invitation = await db.invitation.findUnique({
      where: { slug },
      include: {
        events: {
          orderBy: { startsAt: 'asc' },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    const content = invitation.contentJson as Record<string, unknown>
    const settings = invitation.settingsJson as Record<string, unknown>
    const hero = (content?.hero as Record<string, unknown>) || {}
    const sections = (content?.sections as Record<string, unknown>) || {}
    const heroNames = (hero.names as string[]) || ['Lynda', 'Aymen']
    const heroDate = (hero.date as string) || '9 avril 2026'
    const heroMessage = (hero.message as string) || ''

    // Format wedding_date as YYYY-MM-DD for countdown/calendar
    const eventDate = invitation.eventDate
    let weddingDate = eventDate?.toISOString().slice(0, 10)
    if (!weddingDate) {
      const m = heroDate.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
      weddingDate = m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : '2026-04-09'
    }

    // First event for location details and times
    const firstEvent = invitation.events[0]
    const lastEvent = invitation.events[invitation.events.length - 1]
    const locationName = firstEvent?.locationName || 'Garden Venue'
    const address = firstEvent?.address || null
    const mapLat = firstEvent?.mapLat
    const mapLng = firstEvent?.mapLng
    const mapsUrl =
      address || (mapLat != null && mapLng != null)
        ? `https://www.google.com/maps?q=${encodeURIComponent(
            address || `${mapLat},${mapLng}`
          )}&output=embed`
        : null

    const banquetStartTime =
      firstEvent?.startsAt != null ? formatTimeInAppTz(firstEvent.startsAt) : '18:00'
    const banquetEndTime =
      lastEvent?.endsAt != null
        ? formatTimeInAppTz(lastEvent.endsAt)
        : firstEvent?.endsAt != null
          ? formatTimeInAppTz(firstEvent.endsAt)
          : '01:00'

    // Build timeline from events (or use contentJson.timeline if present)
    const timelineFromContent = (content?.timeline as Array<Record<string, unknown>>) || []
    const timelineFromEvents =
      invitation.events.length > 0
        ? invitation.events.map((ev) => ({
            time: formatTimeInAppTz(ev.startsAt),
            title: ev.name,
            description: ev.notes || '',
          }))
        : []

    const timeline =
      timelineFromContent.length > 0
        ? timelineFromContent.map((t) => ({
            time: String(t.time || ''),
            title: String(t.title || ''),
            description: String(t.description || ''),
          }))
        : timelineFromEvents.length > 0
          ? timelineFromEvents
          : [
              { time: '17:00', title: "Arrivée", description: "Réception et accueil" },
              { time: '18:00', title: "Cérémonie", description: "Le moment le plus spécial" },
              { time: '19:00', title: "Réception", description: "Dîner et célébration" },
            ]

    // FAQs and accommodations from contentJson
    const faqs = ((content?.faqs as Array<Record<string, unknown>>) || []).map(
      (f, i) => ({
        id: String(f.id ?? `faq-${i}`),
        question: String(f.question ?? ''),
        answer: String(f.answer ?? ''),
        sort_order: Number(f.sort_order ?? i),
      })
    )

    const guestMessageSection =
      (content?.guestMessageSection as Record<string, unknown>) || null

    const accommodations = (
      (content?.accommodations as Array<Record<string, unknown>>) || []
    ).map((a, i) => ({
      id: String(a.id ?? `acc-${i}`),
      name: String(a.name ?? ''),
      description: (a.description as string) || null,
      price_range: (a.price_range as string) || null,
      distance: (a.distance as string) || null,
      link: (a.link as string) || null,
      sort_order: Number(a.sort_order ?? i),
    }))

    // Ensure wedding_date is always YYYY-MM-DD for countdown
    const finalWeddingDate = /^\d{4}-\d{2}-\d{2}$/.test(weddingDate) ? weddingDate : '2026-04-09'

    const weddingSettings = {
      couple_name_1: heroNames[0] || 'Lynda',
      couple_name_2: heroNames[1] || 'Aymen',
      wedding_date: finalWeddingDate,
      hero_subtitle: (hero.subtitle as string) || 'Nous nous marions',
      banquet_location: locationName,
      banquet_address: address,
      banquet_maps_url: mapsUrl,
      banquet_image_url: firstEvent?.imageUrl ?? null,
      banquet_start_time: banquetStartTime,
      banquet_end_time: banquetEndTime,
      hero_message: heroMessage,
    }

    const countdownTargetISO = getCountdownTargetISO(finalWeddingDate, 18)

    return NextResponse.json({
      wedding_settings: weddingSettings,
      countdown_target_iso: countdownTargetISO,
      events: timeline,
      faqs,
      guestMessageSection: guestMessageSection?.enabled
        ? { label: String(guestMessageSection?.label ?? 'Écrivez un mot') }
        : null,
      accommodations,
      settings: {
        rsvpEnabled: settings?.rsvpEnabled ?? true,
        previewEnabled: settings?.previewEnabled ?? true,
      },
    })
  } catch (error) {
    console.error('GET /api/invites/[slug]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
