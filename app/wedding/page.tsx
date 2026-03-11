'use client'

import { useState, useEffect, useRef } from 'react'
import { IntroOverlay } from '@/components/wedding/IntroOverlay'
import { HeroSection } from '@/components/wedding/HeroSection'
import { CountdownSection } from '@/components/wedding/CountdownSection'
import { LocationSection } from '@/components/wedding/LocationSection'
import { RSVPForm } from '@/components/wedding/RSVPForm'
import { Footer } from '@/components/wedding/Footer'
import { SectionDivider } from '@/components/wedding/SectionDivider'
import { MuteButton } from '@/components/wedding/MuteButton'

interface WeddingSettings {
  couple_name_1: string
  couple_name_2: string
  wedding_date: string
  hero_subtitle: string
  banquet_location: string
  banquet_address: string | null
  banquet_maps_url: string | null
  banquet_image_url?: string | null
  banquet_start_time?: string
  banquet_end_time?: string
}

interface WeddingData {
  wedding_settings: WeddingSettings
  guestMessageSection?: { label: string } | null
}

const DEFAULTS: WeddingSettings = {
  couple_name_1: 'Lynda',
  couple_name_2: 'Aymen',
  wedding_date: '2026-04-09',
  hero_subtitle: 'Nous nous marions',
  banquet_location: 'Kobet Nhas',
  banquet_address: null,
  banquet_maps_url: null,
}

function useInviteData(initialSlug?: string) {
  const [data, setData] = useState<WeddingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState(initialSlug ?? 'demo-wedding')

  useEffect(() => {
    const s =
      initialSlug ??
      (() => {
        const path = window.location.pathname
        const match = path.match(/^\/i\/([^/]+)/)
        return match?.[1] ?? 'demo-wedding'
      })()

    setSlug(s)

    fetch(`/api/invites/${s}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [initialSlug])

  return { data, loading, slug }
}

interface WeddingPageProps {
  initialSlug?: string
}

export default function WeddingPage({ initialSlug }: WeddingPageProps = {}) {
  const { data, loading, slug } = useInviteData(initialSlug)
  const [showIntro, setShowIntro] = useState(true)
  const [muted, setMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const viewRecordedRef = useRef(false)

  // Record one view when invitation is loaded (once per session)
  useEffect(() => {
    if (loading || !slug || viewRecordedRef.current) return
    viewRecordedRef.current = true
    let sessionId: string | null = null
    if (typeof sessionStorage !== 'undefined') {
      sessionId = sessionStorage.getItem('wedding_view_id')
      if (!sessionId) {
        sessionId = `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
        sessionStorage.setItem('wedding_view_id', sessionId)
      }
    }
    fetch(`/api/invites/${slug}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionId ? { sessionId } : {}),
    }).catch(() => {})
  }, [loading, slug])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0
    audio.play().then(() => {
      let vol = 0
      const fade = setInterval(() => {
        vol += 0.017
        if (vol >= 0.5) {
          audio.volume = 0.5
          clearInterval(fade)
        } else {
          audio.volume = vol
        }
      }, 100)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = () => {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) {
        audio.pause()
      } else if (!muted) {
        audio.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [muted])

  const handleInteraction = () => {
    const audio = audioRef.current
    if (audio?.paused) audio.play().catch(() => {})
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (audio) {
      audio.muted = !audio.muted
      setMuted(!muted)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          Chargement...
        </div>
      </div>
    )
  }

  const ws = data?.wedding_settings ?? DEFAULTS
  const guestMessage = data?.guestMessageSection

  return (
    <>
      <audio ref={audioRef} src="/assets/intro-music-CzqJOUtA.mp3" preload="auto" loop />

      <MuteButton muted={muted} onToggle={toggleMute} />

      {showIntro ? (
        <IntroOverlay
          onEnter={() => setShowIntro(false)}
          onInteraction={handleInteraction}
        />
      ) : (
        <main className="bg-background">
          <HeroSection
            name1={ws.couple_name_1}
            name2={ws.couple_name_2}
            date={ws.wedding_date}
            subtitle={ws.hero_subtitle}
          />

          

          <CountdownSection targetDate={ws.wedding_date} />

          

          <LocationSection
            location={ws.banquet_location}
            address={ws.banquet_address}
            mapsUrl={ws.banquet_maps_url}
            venueImageUrl={ws.banquet_image_url}
            startTime={ws.banquet_start_time ?? '18:00'}
            endTime={ws.banquet_end_time ?? '01:00'}
            weddingDate={ws.wedding_date}
          />

          <SectionDivider />

          <RSVPForm slug={slug} />

          

          <Footer
            name1={ws.couple_name_1}
            name2={ws.couple_name_2}
            date={ws.wedding_date}
          />
        </main>
      )}
    </>
  )
}
