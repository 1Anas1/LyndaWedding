'use client'

import { useState } from 'react'
import { IntroOverlay } from './IntroOverlay'
import { IntroMusic } from './IntroMusic'
import { Hero } from '@/components/public/Hero'
import { EventList } from '@/components/public/EventList'
import { MapCard } from '@/components/public/MapCard'
import { RSVPCTA } from '@/components/public/RSVPCTA'

interface FincaInvitationPageProps {
  invitation: {
    slug: string
    contentJson: unknown
    eventDate: Date | null
    theme: {
      tokensJson: unknown
    }
    events: Array<{
      id: string
      name: string
      startsAt: Date
      endsAt: Date | null
      locationName: string | null
      address: string | null
      mapLat: number | null
      mapLng: number | null
      notes: string | null
    }>
  }
}

export function FincaInvitationPage({ invitation }: FincaInvitationPageProps) {
  const [entered, setEntered] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const content = invitation.contentJson as {
    hero?: {
      names?: string[]
      date?: string
      message?: string
    }
  }

  const heroData = content.hero || {}
  const names = heroData.names || ['Couple']
  const date = heroData.date || ''
  const message = heroData.message

  // Apply theme tokens as CSS variables
  const themeTokens = invitation.theme.tokensJson as {
    colors?: Record<string, string>
    fonts?: Record<string, string>
    radius?: string
  }

  const themeStyles: React.CSSProperties & Record<string, string> = {}
  if (themeTokens.colors) {
    Object.entries(themeTokens.colors).forEach(([key, value]) => {
      themeStyles[`--theme-${key}`] = value
    })
  }

  // Find first event with address for map card
  const eventWithAddress = invitation.events.find(
    (e) => e.address && (e.mapLat || e.mapLng || e.address)
  )

  return (
    <>
      {!entered && (
        <IntroOverlay
          onEnter={() => setEntered(true)}
          onInteraction={() => setHasInteracted(true)}
        />
      )}
      {hasInteracted && <IntroMusic startAfterInteraction={false} />}
      {entered && (
        <div style={themeStyles} className="min-h-screen">
          <Hero names={names} date={date} message={message} />
          <EventList events={invitation.events} />
          {eventWithAddress && (
            <MapCard
              address={eventWithAddress.address!}
              locationName={eventWithAddress.locationName}
              mapLat={eventWithAddress.mapLat}
              mapLng={eventWithAddress.mapLng}
            />
          )}
          <RSVPCTA slug={invitation.slug} />
        </div>
      )}
    </>
  )
}
