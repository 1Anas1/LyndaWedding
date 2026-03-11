'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Calendar } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DEFAULT_VENUE_IMAGE = '/assets/finca-biniagual-tpK1hn9e.webp'

/** Use proxy for private Vercel Blob URLs so images load. */
function getVenueImageSrc(url: string | null | undefined): string {
  if (!url || url.trim() === '') return DEFAULT_VENUE_IMAGE
  if (url.includes('blob.vercel-storage.com'))
    return `/api/event-image?url=${encodeURIComponent(url)}`
  return url
}

interface LocationSectionProps {
  location?: string
  address?: string | null
  mapsUrl?: string | null
  venueImageUrl?: string | null
  startTime?: string
  endTime?: string
  weddingDate?: string
}

function buildCalendarUrl(
  title: string,
  startTime: string,
  location: string,
  date: string
): string {
  const start = new Date(`${date}T${startTime}:00`)
  const end = new Date(start.getTime() + 8 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(location)}`
}

function buildMapsEmbedUrl(location: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`
}

export function LocationSection({
  location = 'Jardin de réception',
  address,
  mapsUrl,
  venueImageUrl,
  startTime = '18:00',
  endTime = '01:00',
  weddingDate = '2026-04-09',
}: LocationSectionProps) {
  const imageSrc = getVenueImageSrc(venueImageUrl)
  const locationName = location || 'Jardin de réception'
  const calendarUrl = buildCalendarUrl(
    `Mariage Lynda & Aymen`,
    startTime,
    locationName,
    weddingDate
  )

  return (
    <section className="section-padding bg-ivory">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <img
            src="/assets/champagne-illustration-CplOg0Lb.png"
            alt="Illustration de coupes de champagne"
            className="w-64 mx-auto mb-6"
          />
          <h2 className="font-script text-4xl md:text-5xl text-sage-dark mb-2">
            Détails du jour
          </h2>
          <p className="text-sage-dark/70 font-body tracking-wide">
            Tout ce que vous devez savoir
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm border border-sage/30 p-8 md:p-12 rounded-lg shadow-sm text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-sage/30 flex items-center justify-center">
            <MapPin className="w-7 h-7 text-sage-dark" />
          </div>

          <h3 className="font-display text-2xl text-sage-dark mb-4">Lieu</h3>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2">
              <span className="font-display text-xl text-sage-dark">
                {locationName}
              </span>
            </div>

            {address && (
              <p className="text-sm text-sage-dark/70 font-body">{address}</p>
            )}

            <div className="flex items-center justify-center gap-2 mt-4 text-sage-dark/70">
              <Clock className="w-4 h-4" />
              <span className="font-body">
                De {startTime.replace(':00', '')}h à {endTime.replace(':00', '')}h
              </span>
            </div>
          </div>

          <div className="mb-6 rounded-lg overflow-hidden border border-sage/30 relative group">
            <img
              src={imageSrc}
              alt={venueImageUrl ? 'Photo du lieu' : 'Vue du lieu'}
              className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sage-dark/40 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="mb-6 rounded-lg overflow-hidden border border-sage/30">
            <iframe
              src={buildMapsEmbedUrl(locationName)}
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Carte de ${locationName}`}
              className="sepia-[0.15] hover:sepia-0 transition-all duration-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'gap-2 border-sage-dark/40 text-sage-dark hover:bg-sage-dark hover:text-white'
                )}
              >
                <MapPin className="w-4 h-4" />
                Ouvrir dans Maps
              </a>
            )}
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'gap-2 border-sage-dark/40 text-sage-dark hover:bg-sage-dark hover:text-white'
              )}
            >
              <Calendar className="w-4 h-4" />
              Ajouter au calendrier
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
