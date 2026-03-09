'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const rsvpSchema = z.object({
  invitationSlug: z.string(),
  guestName: z.string().min(1, 'Name is required'),
  attending: z.boolean(),
  partySize: z.number().min(1).max(10),
  notes: z.string().optional(),
  dietary: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
})

type RSVPFormData = z.infer<typeof rsvpSchema>

const CONFETTI_SRC = '/assets/confetti-CrGrT4ka.gif'
const RSVP_VIDEO_SRC = '/assets/rsvp-confirmation-DYbKwzwP.webm'

function RSVPConfirmation({ attending }: { attending: boolean }) {
  const [showMessage, setShowMessage] = useState(!attending)
  const [showConfetti, setShowConfetti] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!attending) return
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      if (video.duration - video.currentTime <= 1.5 && !showMessage) {
        setShowMessage(true)
      }
    }
    const onEnded = () => setShowMessage(true)

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [attending, showMessage])

  useEffect(() => {
    if (attending) setShowConfetti(true)
  }, [attending])

  if (!attending) {
    return (
      <div className="bg-ivory border border-sage/20 rounded-lg p-8 text-center">
        <h2 className="font-script text-4xl text-sage-dark mb-4">Thank you</h2>
        <p className="text-sage-dark/80 font-body leading-relaxed">
          We&apos;re sorry you can&apos;t join us. You&apos;ll be in our thoughts on our special day.
        </p>
        <p className="text-sage-dark/60 font-script text-2xl mt-6">— With love</p>
      </div>
    )
  }

  return (
    <section className="min-h-[80vh] bg-ivory flex items-center justify-center relative overflow-hidden rounded-lg">
      <AnimatePresence mode="wait">
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-4 pointer-events-none z-10 flex justify-center"
          >
            <img
              src={CONFETTI_SRC}
              alt="Celebration"
              className="w-[300px] md:w-[400px] h-[300px] md:h-[400px] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!showMessage ? (
        <motion.div
          key="video"
          initial={{ opacity: 1 }}
          className="w-full max-w-2xl aspect-video"
        >
          <video
            ref={videoRef}
            src={RSVP_VIDEO_SRC}
            className="w-full h-full object-contain rounded-lg"
            autoPlay
            muted
            playsInline
          />
        </motion.div>
      ) : (
        <motion.div
          key="message"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-2xl px-6 py-12 text-center"
        >
          <h2 className="font-script text-4xl md:text-5xl text-sage-dark mb-6">
            Thank you for your RSVP!
          </h2>
          <p className="text-sage-dark/90 font-body text-lg leading-relaxed mb-4">
            Your response has been recorded. We look forward to celebrating with you!
          </p>
          <p className="text-sage-dark/60 font-script text-2xl mt-8">— With love</p>
        </motion.div>
      )}
    </section>
  )
}

interface RSVPFormProps {
  invitationSlug: string
}

export function RSVPForm({ invitationSlug }: RSVPFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      invitationSlug,
      attending: true,
      partySize: 1,
    },
  })

  const attending = watch('attending')

  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          email: data.email || undefined,
          phone: data.phone || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit RSVP')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <RSVPConfirmation attending={attending} />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="guestName" className="block text-sm font-medium mb-2">
          Your Name *
        </label>
        <input
          id="guestName"
          {...register('guestName')}
          className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.guestName && (
          <p className="mt-1 text-sm text-destructive">
            {errors.guestName.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Will you be attending? *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={attending === true}
              onChange={() => setValue('attending', true)}
              className="mr-2"
            />
            Yes, I&apos;ll be there
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={attending === false}
              onChange={() => setValue('attending', false)}
              className="mr-2"
            />
            Sorry, can&apos;t make it
          </label>
        </div>
      </div>

      {attending && (
        <>
          <div>
            <label htmlFor="partySize" className="block text-sm font-medium mb-2">
              Party Size *
            </label>
            <input
              id="partySize"
              type="number"
              min="1"
              max="10"
              {...register('partySize', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.partySize && (
              <p className="mt-1 text-sm text-destructive">
                {errors.partySize.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="dietary" className="block text-sm font-medium mb-2">
              Dietary Restrictions or Allergies
            </label>
            <textarea
              id="dietary"
              {...register('dietary')}
              rows={3}
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Please let us know about any dietary restrictions or allergies..."
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email (optional)
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          Phone (optional)
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-2">
          Additional Notes
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Any additional information you&apos;d like to share..."
        />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-md p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
      </Button>
    </form>
  )
}
