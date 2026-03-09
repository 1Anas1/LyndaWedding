'use client'

import { motion } from 'framer-motion'

export function SectionDivider() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex items-center justify-center py-2 bg-ivory"
    >
      <span className="h-px bg-sage-dark/40 w-16 md:w-24" />
      <span className="mx-4 text-sage-dark/50 text-sm">✦</span>
      <span className="h-px bg-sage-dark/40 w-16 md:w-24" />
    </motion.div>
  )
}
