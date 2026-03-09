'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface IntroOverlayProps {
  onEnter: () => void
  onInteraction?: () => void
}

export function IntroOverlay({ onEnter, onInteraction }: IntroOverlayProps) {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'fading'>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleClick = () => {
    if (phase !== 'idle') return
    const video = videoRef.current
    if (video) {
      video.playbackRate = 0.85
      video.play()
    }
    setPhase('playing')
    onInteraction?.()
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    if (video.duration - video.currentTime <= 1.2 && phase === 'playing') {
      setPhase('fading')
      setTimeout(() => onEnter(), 1200)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer"
      onClick={handleClick}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'fading' ? 0 : 1 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      style={{ backgroundColor: '#f5f0e8' }}
    >
      <video
        ref={videoRef}
        poster="/assets/intro1.png"
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        playsInline
        muted
        preload="auto"
      >
        <source src="/assets/Video_Edit.mp4" type="video/mp4" />
      </video>
    </motion.div>
  )
}
