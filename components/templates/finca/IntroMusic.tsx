'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface IntroMusicProps {
  startAfterInteraction?: boolean
}

export function IntroMusic({ startAfterInteraction = false }: IntroMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(!startAfterInteraction)

  useEffect(() => {
    if (!hasInteracted || !audioRef.current) return

    const audio = audioRef.current
    audio.volume = 0

    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          let volume = 0
          const interval = setInterval(() => {
            volume += 0.017
            if (volume >= 0.5) {
              audio.volume = 0.5
              clearInterval(interval)
            } else {
              audio.volume = volume
            }
          }, 100)
        })
        .catch(() => {
          // Fail silently
        })
    }
  }, [hasInteracted])

  useEffect(() => {
    if (!hasInteracted) return

    const handleVisibilityChange = () => {
      if (!audioRef.current) return
      if (document.hidden) {
        audioRef.current.pause()
      } else if (!isMuted && !audioRef.current.paused) {
        audioRef.current.play().catch(() => {
          // Fail silently
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isMuted, hasInteracted])

  const handleToggleMute = () => {
    if (!audioRef.current) return
    const newMutedState = !isMuted
    audioRef.current.muted = newMutedState
    setIsMuted(newMutedState)
  }

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  useEffect(() => {
    if (startAfterInteraction && !hasInteracted) {
      const handleFirstInteraction = () => {
        setHasInteracted(true)
        window.removeEventListener('click', handleFirstInteraction)
        window.removeEventListener('touchstart', handleFirstInteraction)
      }

      window.addEventListener('click', handleFirstInteraction, { once: true })
      window.addEventListener('touchstart', handleFirstInteraction, { once: true })

      return () => {
        window.removeEventListener('click', handleFirstInteraction)
        window.removeEventListener('touchstart', handleFirstInteraction)
      }
    }
  }, [startAfterInteraction, hasInteracted])

  return (
    <>
      <audio
        ref={audioRef}
        src="/assets/intro-music-CzqJOUtA.mp3"
        preload="auto"
        loop
      />
      <button
        onClick={handleToggleMute}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-black/20 backdrop-blur-sm p-2 text-white hover:bg-black/30 transition-colors"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>
    </>
  )
}
