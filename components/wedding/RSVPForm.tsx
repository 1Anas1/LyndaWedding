'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RSVPFormProps {
  slug?: string
}

export function RSVPForm({ slug = 'demo-wedding' }: RSVPFormProps) {
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationSlug: slug,
          guestName: 'Invité',
          attending: true,
          partySize: 1,
          notes: message,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError("Impossible d'envoyer votre message. Veuillez réessayer.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="rsvp" className="section-padding bg-ivory">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <img
            src="/assets/rings-illustration-tO3OeALU.png"
            alt="Illustration d'alliances"
            className="w-48 mx-auto mb-6"
          />
          <h2 className="font-script text-4xl md:text-5xl text-sage-dark mb-2">
            Écrivez un mot
          </h2>
          <p className="text-sage-dark/70 font-body tracking-wide">
            Laissez un message pour les mariés
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h3 className="font-script text-3xl text-sage-dark mb-4">
              Merci !
            </h3>
            <p className="text-sage-dark/80 font-body">
              Votre message a bien été envoyé.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-sm border border-sage/30 rounded-lg p-8 space-y-6 shadow-sm"
          >
            <div>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full rounded-md border border-sage/30 bg-ivory px-3 py-2 text-sage-dark placeholder:text-sage-dark/50 focus:border-sage-dark focus:outline-none focus:ring-1 focus:ring-sage-dark"
                placeholder="Laissez un message pour Lynda et Aymen..."
                rows={4}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm font-body">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full gap-2 bg-sage-dark hover:bg-sage-dark/90 text-white font-medium"
              disabled={submitting}
            >
              {submitting ? (
                'Envoi en cours...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </Button>
          </motion.form>
        )}
      </div>
    </section>
  )
}
