import { Hero } from '@/components/public/Hero'
import { EventList } from '@/components/public/EventList'
import { MapCard } from '@/components/public/MapCard'
import { RSVPCTA } from '@/components/public/RSVPCTA'

interface PreviewTabProps {
  invitation: {
    id: string
    slug: string
    contentJson: unknown
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

export function PreviewTab({ invitation }: PreviewTabProps) {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Preview how your invitation will look to guests.
        </p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div style={themeStyles} className="min-h-screen bg-background">
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
      </div>
    </div>
  )
}
