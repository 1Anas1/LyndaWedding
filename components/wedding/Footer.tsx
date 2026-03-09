'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface FooterProps {
  name1: string
  name2: string
  date: string
}

function formatDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return new Date(raw + 'T12:00:00').toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }
  return '09 avril 2026'
}

export function Footer({ name1, name2, date }: FooterProps) {
  const formattedDate = formatDate(date)

  return (
    <footer className="py-16 bg-sage-dark text-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Heart className="w-6 h-6 mx-auto mb-4 text-white/70" />
        <p className="font-script text-3xl text-white mb-2">
          {name1} &amp; {name2}
        </p>
        <p className="text-sm text-white/80 font-body tracking-wide">
          {formattedDate}
        </p>
        <p className="text-xs text-white/60 mt-8 font-body">
          Réalisé par The Digital Yes
        </p>
      </motion.div>
    </footer>
  )
}
