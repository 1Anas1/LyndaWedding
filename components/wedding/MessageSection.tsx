'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

interface MessageSectionProps {
  label?: string
}

export function MessageSection({ label }: MessageSectionProps) {
  return (
    <section className="section-padding bg-ivory">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <MessageCircle className="w-8 h-8 mx-auto mb-4 text-sage-dark" />
          <h2 className="font-script text-4xl md:text-5xl text-sage-dark">
            {label || 'Écrivez un mot'}
          </h2>
          <p className="text-sage-dark/70 font-body mt-4">
            Laissez un message pour les mariés dans le formulaire de confirmation ci-dessous.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
