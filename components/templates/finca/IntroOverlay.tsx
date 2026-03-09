'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface IntroOverlayProps {
  onEnter: () => void
  onInteraction?: () => void
}

export function IntroOverlay({ onEnter, onInteraction }: IntroOverlayProps) {
  const [state, setState] = useState<'idle' | 'playing' | 'fading'>('idle')
  const [videoSupported, setVideoSupported] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Check if video format is supported
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const checkSupport = () => {
      // Check if .mov is supported (canPlayType returns '' | 'maybe' | 'probably')
      const movSupported = video.canPlayType('video/quicktime')
      if (!movSupported) {
        setVideoSupported(false)
      }
    }

    checkSupport()
    
    // Also check on error
    const handleError = () => {
      setVideoSupported(false)
    }
    
    video.addEventListener('error', handleError)
    return () => {
      video.removeEventListener('error', handleError)
    }
  }, [])

  const handleClick = () => {
    if (state === 'idle') {
      setState('playing')
      onInteraction?.()
      
      if (videoSupported && videoRef.current) {
        const video = videoRef.current
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Ignore AbortError (happens during hot reload)
            if (error.name === 'AbortError') {
              return
            }
            console.warn('Video play failed, using fallback:', error)
            setVideoSupported(false)
            // Fallback: fade after simulated video duration
            setTimeout(() => {
              setState('fading')
              setTimeout(() => {
                onEnter()
              }, 800)
            }, 3500) // Simulate ~3.5 second video
          })
        }
      } else {
        // No video support - use fallback immediately
        setTimeout(() => {
          setState('fading')
          setTimeout(() => {
            onEnter()
          }, 800)
        }, 3500) // Simulate ~3.5 second video
      }
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current || !videoSupported) return
    const video = videoRef.current
    if (video.duration - video.currentTime <= 0.8 && state === 'playing') {
      setState('fading')
      setTimeout(() => {
        onEnter()
      }, 800)
    }
  }

  const handleVideoError = () => {
    console.warn('Video format not supported, using poster image fallback')
    setVideoSupported(false)
    // If we're already playing, trigger fade after delay
    if (state === 'playing') {
      setTimeout(() => {
        setState('fading')
        setTimeout(() => {
          onEnter()
        }, 800)
      }, 3500)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer"
      onClick={handleClick}
      initial={{ opacity: 1 }}
      animate={{ opacity: state === 'fading' ? 0 : 1 }}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
      }}
      style={{
        backgroundColor: '#f5f0e8',
      }}
    >
      {videoSupported ? (
        <video
          ref={videoRef}
          src="/assets/intro-video-BpkZMtTn.mov"
          poster="/assets/intro-poster-BQrMtd4k.png"
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onError={handleVideoError}
          playsInline
          muted
          preload="auto"
        />
      ) : (
        // Fallback: Show poster image when video isn't supported
        <img
          src="/assets/intro-poster-BQrMtd4k.png"
          alt="Wedding Invitation"
          className="w-full h-full object-cover"
        />
      )}
    </motion.div>
  )
}
