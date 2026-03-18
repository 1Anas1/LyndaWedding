'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface HeroSectionProps {
  name1: string
  name2: string
  date: string
  subtitle?: string
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

export function HeroSection({ name1, name2, date, subtitle }: HeroSectionProps) {
  const formattedDate = formatDate(date)

  const scrollToRSVP = () => {
    document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ivory">
      <div className="absolute inset-0">
        <video
          src="/assets/intro-video-BSNlV4m4.webm"
          poster="/assets/hero-illustration-DrhagIJw.png"
          className="w-full h-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs md:text-sm tracking-[0.5em] uppercase text-white/80 mb-6 font-body"
        >
          {subtitle || 'Nous nous marions'}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mb-4"
        >
          <span className="font-script text-5xl md:text-7xl lg:text-8xl text-white block leading-tight drop-shadow-lg">
            {name1}
          </span>
          <span className="font-display text-2xl md:text-3xl lg:text-4xl font-light text-gold my-2 md:my-4 block italic drop-shadow-md">
            &amp;
          </span>
          <span className="font-script text-5xl md:text-7xl lg:text-8xl text-white block leading-tight drop-shadow-lg">
            {name2}
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-4 my-6 md:my-8"
        >
          <span className="h-px bg-white/50 w-12 md:w-20" />
          <span className="text-gold text-lg drop-shadow-md">✦</span>
          <span className="h-px bg-white/50 w-12 md:w-20" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-base md:text-lg font-display tracking-wider text-white/90 italic drop-shadow-md"
        >
          {formattedDate}
        </motion.p>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        onClick={scrollToRSVP}
        className="absolute bottom-8 inset-x-0 z-10 flex flex-col items-center gap-2 text-center text-white hover:text-white/80 transition-colors cursor-pointer"
      >
        <span className="text-xs tracking-[0.3em] uppercase font-body">
          Votre présence rendra ce jour plus spécial ❤️
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  )
}
