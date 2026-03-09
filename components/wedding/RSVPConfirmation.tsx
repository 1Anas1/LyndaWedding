'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RSVPConfirmationProps {
  attendance: string
  coupleName?: string
  weddingDate?: string
  location?: string
}

export function RSVPConfirmation({
  attendance,
  coupleName = 'Lynda & Aymen',
  weddingDate = '2026-04-09',
  location = 'Kobet Nhas',
}: RSVPConfirmationProps) {
  const [showMessage, setShowMessage] = useState(false)
  const [fading, setFading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (attendance === 'no') {
      setShowMessage(true)
      return
    }

    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      if (video.duration - video.currentTime <= 1.5 && !fading) {
        setFading(true)
      }
    }
    const onEnded = () => setShowMessage(true)

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [attendance, fading])

  const openCalendar = () => {
    const dateStr = weddingDate.replace(/-/g, '')
    const nextDay = (() => {
      const d = new Date(weddingDate + 'T12:00:00')
      d.setDate(d.getDate() + 1)
      return d.toISOString().slice(0, 10).replace(/-/g, '')
    })()

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Mariage ' + coupleName)}&dates=${dateStr}T180000/${nextDay}T010000&location=${encodeURIComponent(location)}&details=${encodeURIComponent('Mariage de ' + coupleName)}`
    window.open(url, '_blank')
  }

  if (attendance === 'no') {
    return (
      <section id="rsvp" className="section-padding bg-ivory">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <h2 className="font-script text-4xl md:text-5xl text-sage-dark mb-6">
            Merci
          </h2>
          <p className="text-sage-dark/80 font-body text-lg leading-relaxed">
            Nous sommes désolés que vous ne puissiez pas être des nôtres. Vous
            serez dans nos pensées en ce jour si spécial.
          </p>
          <p className="text-sage-dark/60 font-script text-2xl mt-8">
            — {coupleName}
          </p>
        </motion.div>
      </section>
    )
  }

  return (
    <section
      id="rsvp"
      className="min-h-screen bg-ivory flex items-center justify-center relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {showMessage ? (
          <motion.div
            key="message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-20"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-script text-4xl md:text-5xl lg:text-6xl text-sage-dark mb-8 text-center"
            >
              Merci d&apos;avoir confirmé votre présence
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-6 max-w-2xl text-center"
            >
              <p className="text-sage-dark/90 font-body text-lg md:text-xl leading-relaxed">
                Nous sommes ravis de savoir que vous serez des nôtres en ce jour
                si spécial.
              </p>
              <p className="text-sage-dark/90 font-body text-lg md:text-xl leading-relaxed">
                Merci de faire partie de notre histoire.
              </p>
              <p className="text-sage-dark/80 font-body text-base md:text-lg">
                Nous vous attendons le 09 avril 2026 à {location}.
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-sage-dark/60 font-script text-2xl md:text-3xl mt-10"
            >
              — {coupleName}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="mt-12 flex flex-col items-center gap-6"
            >
              <Button
                onClick={openCalendar}
                variant="outline"
                className="gap-2 border-sage-dark/30 text-sage-dark hover:bg-sage-dark hover:text-white transition-colors"
              >
                <CalendarPlus className="w-5 h-5" />
                Ajouter au calendrier
              </Button>
              <p className="text-sage-dark/50 font-body text-sm max-w-md text-center leading-relaxed">
                Si pour une raison quelconque vous ne pouvez pas assister, merci
                de nous prévenir à l&apos;avance. Vous pouvez nous contacter par
                WhatsApp.
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="video"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ivory"
          >
            <video
              ref={videoRef}
              src="/assets/rsvp-confirmation-DYbKwzwP.webm"
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: fading ? 1 : 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0 bg-ivory pointer-events-none"
              onAnimationComplete={() => {
                if (fading) setTimeout(() => setShowMessage(true), 300)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
