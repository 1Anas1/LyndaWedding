interface Event {
  id: string
  name: string
  startsAt: Date | string
  endsAt: Date | string | null
  locationName: string | null
  address: string | null
  notes: string | null
  imageUrl?: string | null
}

interface EventListProps {
  events: Event[]
}

function getEventImageSrc(url: string | null | undefined): string {
  if (!url || !url.trim()) return ''
  if (url.includes('blob.vercel-storage.com'))
    return `/api/event-image?url=${encodeURIComponent(url)}`
  return url
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) return null

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const formatTime = (date: Date | string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8">Event Details</h2>
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-card border border-border rounded-lg overflow-hidden space-y-0"
          >
            {event.imageUrl && (
              <img
                src={getEventImageSrc(event.imageUrl)}
                alt=""
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6 space-y-3">
            <h3 className="text-2xl font-semibold">{event.name}</h3>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="font-medium">Date & Time:</span>
                <span>{formatDate(event.startsAt)}</span>
                {event.endsAt && (
                  <span> - {formatTime(event.endsAt)}</span>
                )}
              </p>
              {event.locationName && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Location:</span>
                  <span>{event.locationName}</span>
                </p>
              )}
              {event.address && (
                <p className="text-sm">{event.address}</p>
              )}
              {event.notes && (
                <p className="pt-2 border-t border-border italic">{event.notes}</p>
              )}
            </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
