'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CountdownSectionProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const LABELS = [
  { key: 'days', label: 'Jours' },
  { key: 'hours', label: 'Heures' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Secondes' },
] as const

export function CountdownSection({ targetDate }: CountdownSectionProps) {
  const normalizedDate = /^\d{4}-\d{2}-\d{2}/.test(targetDate) ? targetDate : '2026-04-09'

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  })

  useEffect(() => {
    const calculate = () => {
      const target = normalizedDate.includes('T')
        ? new Date(normalizedDate)
        : new Date(`${normalizedDate}T12:00:00`)

      if (Number.isNaN(target.getTime())) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      target.setHours(18, 0, 0, 0)
      const diff = target.getTime() - Date.now()

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [normalizedDate])

  return (
    <section id="countdown" className="section-padding bg-countdown">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-script text-4xl md:text-5xl text-white mb-2"
        >
          Compte à rebours
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/70 text-lg font-body tracking-wide mb-12"
        >
          Pour le jour le plus spécial de nos vies
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {LABELS.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-sm p-6 md:p-8 border border-white/20 rounded-lg"
            >
              <span className="block font-display text-4xl md:text-6xl font-light text-white">
                {String(timeLeft[item.key]).padStart(2, '0')}
              </span>
              <span className="block mt-2 text-xs tracking-[0.2em] uppercase text-white/70 font-body">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
