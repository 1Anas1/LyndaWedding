interface MapCardProps {
  address: string
  locationName?: string | null
  mapLat?: number | null
  mapLng?: number | null
}

export function MapCard({ address, locationName, mapLat, mapLng }: MapCardProps) {
  const googleMapsUrl = mapLat && mapLng
    ? `https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  const appleMapsUrl = mapLat && mapLng
    ? `https://maps.apple.com/?q=${mapLat},${mapLng}`
    : `https://maps.apple.com/?q=${encodeURIComponent(address)}`

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Location</h2>
          {locationName && (
            <p className="text-lg font-medium">{locationName}</p>
          )}
          <p className="text-muted-foreground">{address}</p>
          <div className="flex flex-wrap gap-3 pt-4">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Open in Google Maps
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Open in Apple Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
