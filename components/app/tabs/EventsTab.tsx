'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, ChevronDown, ChevronUp, MapPin, Upload, Loader2 } from 'lucide-react'

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type?: string
  name?: string
}

interface EventItem {
  id: string
  name: string
  startsAt: Date
  endsAt: Date | null
  locationName: string | null
  address: string | null
  mapLat: number | null
  mapLng: number | null
  notes: string | null
  imageUrl?: string | null
}

interface EventsTabProps {
  invitation: {
    id: string
    events: EventItem[]
  }
  onSave: (updates: { contentJson?: unknown; settingsJson?: unknown }) => Promise<void>
  onEventsSaved?: (invitation: { events: EventItem[] }) => void
}

function toInputDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = Number.isNaN(d.getTime()) ? new Date() : d
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Use proxy for private Vercel Blob URLs so images load in the editor. */
function getEventImageSrc(url: string | null | undefined): string {
  if (!url || !url.trim()) return ''
  if (url.includes('blob.vercel-storage.com'))
    return `/api/event-image?url=${encodeURIComponent(url)}`
  return url
}

function toDate(value: Date | string): Date {
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? new Date() : d
}

export function EventsTab({ invitation, onSave, onEventsSaved }: EventsTabProps) {
  const [events, setEvents] = useState<EventItem[]>(
    invitation.events.map((e) => ({
      ...e,
      startsAt: toDate(e.startsAt),
      endsAt: e.endsAt ? toDate(e.endsAt) : null,
    }))
  )
  const [expandedId, setExpandedId] = useState<string | null>(events[0]?.id ?? null)
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadTargetEventId, setUploadTargetEventId] = useState<string | null>(null)
  const [locationSearch, setLocationSearch] = useState<{
    eventId: string
    query: string
    results: NominatimResult[]
    loading: boolean
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addEvent = () => {
    const start = new Date()
    start.setHours(18, 0, 0, 0)
    const end = new Date(start)
    end.setHours(23, 0, 0, 0)
    const newEvent: EventItem = {
      id: `new-${Date.now()}`,
      name: 'Nouvel événement',
      startsAt: start,
      endsAt: end,
      locationName: null,
      address: null,
      mapLat: null,
      mapLng: null,
      notes: null,
      imageUrl: null,
    }
    setEvents((prev) => [...prev, newEvent].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()))
    setExpandedId(newEvent.id)
  }

  const updateEvent = (id: string, updates: Partial<EventItem>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    )
  }

  const removeEvent = (id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id)
      if (expandedId === id) setExpandedId(next[0]?.id ?? null)
      return next
    })
  }

  const handleImageUpload = useCallback(
    async (eventId: string, file: File) => {
      setUploadingId(eventId)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload/event-image', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Upload failed')
        }
        const data = await res.json()
        updateEvent(eventId, { imageUrl: data.url })
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Erreur lors de l’upload.')
      } finally {
        setUploadingId(null)
      }
    },
    []
  )

  const searchLocation = useCallback((eventId: string, query: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (!query.trim()) {
      setLocationSearch(null)
      return
    }
    setLocationSearch((prev) => ({
      eventId,
      query,
      results: prev?.eventId === eventId ? prev.results : [],
      loading: true,
    }))
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'LyndaWedding-Invitation/1.0',
            },
          }
        )
        const results: NominatimResult[] = await res.json()
        setLocationSearch((prev) =>
          prev?.eventId === eventId ? { ...prev, results, loading: false } : null
        )
      } catch {
        setLocationSearch((prev) =>
          prev?.eventId === eventId ? { ...prev, results: [], loading: false } : null
        )
      }
    }, 400)
  }, [])

  const selectLocation = useCallback(
    (eventId: string, place: NominatimResult) => {
      updateEvent(eventId, {
        address: place.display_name,
        locationName: place.name || place.display_name.split(',')[0]?.trim() || place.display_name,
        mapLat: Number(place.lat),
        mapLng: Number(place.lon),
      })
      setLocationSearch(null)
    },
    []
  )

  const saveEvents = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/invitations/${invitation.id}/events`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: events.map((e) => ({
            id: e.id.startsWith('new-') ? undefined : e.id,
            name: e.name,
            startsAt: e.startsAt.toISOString(),
            endsAt: e.endsAt ? e.endsAt.toISOString() : null,
            locationName: e.locationName || null,
            address: e.address || null,
            mapLat: e.mapLat ?? null,
            mapLng: e.mapLng ?? null,
            notes: e.notes || null,
            imageUrl: e.imageUrl && e.imageUrl.trim() ? e.imageUrl : null,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      const nextEvents = data.events.map((e: EventItem) => ({
        ...e,
        startsAt: new Date(e.startsAt),
        endsAt: e.endsAt ? new Date(e.endsAt) : null,
      }))
      setEvents(nextEvents)
      onEventsSaved?.({ events: data.events })
    } catch {
      alert('Erreur lors de l’enregistrement des événements.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Événements</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez les lieux, adresses et images de chaque événement (cérémonie, réception, etc.).
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={addEvent} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un événement
          </Button>
          <Button type="button" onClick={saveEvents} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les événements'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <p className="mb-4">Aucun événement pour le moment.</p>
            <Button type="button" variant="outline" onClick={addEvent} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un événement
            </Button>
          </div>
        ) : (
          events.map((event) => {
            const isExpanded = expandedId === event.id
            return (
              <div
                key={event.id}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{event.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {event.locationName || event.address || 'Sans lieu'}
                        {event.startsAt && ` · ${event.startsAt.toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nom de l’événement *</label>
                        <input
                          type="text"
                          value={event.name}
                          onChange={(e) => updateEvent(event.id, { name: e.target.value })}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="ex. Cérémonie"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Image de l’événement</label>
                        {event.imageUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-border bg-muted/30">
                            <img
                              src={getEventImageSrc(event.imageUrl)}
                              alt=""
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              const id = uploadTargetEventId
                              e.target.value = ''
                              setUploadTargetEventId(null)
                              if (f && id) handleImageUpload(id, f)
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={uploadingId === event.id}
                            onClick={() => {
                              setUploadTargetEventId(event.id)
                              fileInputRef.current?.click()
                            }}
                          >
                            {uploadingId === event.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            {uploadingId === event.id ? 'Upload…' : 'Choisir une image'}
                          </Button>
                        </div>
                        <input
                          type="url"
                          value={event.imageUrl ?? ''}
                          onChange={(e) => updateEvent(event.id, { imageUrl: e.target.value || null })}
                          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Ou coller une URL d’image"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Date et heure de début *</label>
                        <input
                          type="datetime-local"
                          value={toInputDateTime(event.startsAt)}
                          onChange={(e) => updateEvent(event.id, { startsAt: new Date(e.target.value) })}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Date et heure de fin</label>
                        <input
                          type="datetime-local"
                          value={event.endsAt ? toInputDateTime(event.endsAt) : ''}
                          onChange={(e) =>
                            updateEvent(event.id, {
                              endsAt: e.target.value ? new Date(e.target.value) : null,
                            })
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Rechercher un lieu sur la carte
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="ex. Kobet Nhas, Paris, Salle des fêtes..."
                        onChange={(e) => searchLocation(event.id, e.target.value)}
                      />
                      {locationSearch?.eventId === event.id && (
                        <div className="mt-1 rounded-md border border-border bg-card shadow-lg overflow-hidden">
                          {locationSearch.loading ? (
                            <div className="px-3 py-4 text-sm text-muted-foreground flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Recherche...
                            </div>
                          ) : locationSearch.results.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-muted-foreground">
                              Aucun résultat. Essayez un autre lieu.
                            </div>
                          ) : (
                            <ul className="max-h-48 overflow-auto">
                              {locationSearch.results.map((place) => (
                                <li key={place.place_id}>
                                  <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                                    onClick={() => selectLocation(event.id, place)}
                                  >
                                    {place.display_name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Lieu / Nom du lieu</label>
                      <input
                        type="text"
                        value={event.locationName ?? ''}
                        onChange={(e) => updateEvent(event.id, { locationName: e.target.value || null })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="ex. Kobet Nhas, Salle des fêtes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Adresse complète</label>
                      <input
                        type="text"
                        value={event.address ?? ''}
                        onChange={(e) => updateEvent(event.id, { address: e.target.value || null })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Rempli automatiquement par la recherche ou saisie manuelle"
                      />
                    </div>

                    {event.mapLat != null && event.mapLng != null && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Aperçu sur la carte</label>
                        <div className="rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                          <iframe
                            title="Carte"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.mapLng - 0.02}%2C${event.mapLat - 0.01}%2C${event.mapLng + 0.02}%2C${event.mapLat + 0.01}&layer=mapnik&marker=${event.mapLat}%2C${event.mapLng}`}
                            className="w-full h-full min-h-[200px] border-0"
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Coordonnées : {event.mapLat.toFixed(5)}, {event.mapLng.toFixed(5)}
                        </p>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Latitude (carte)</label>
                        <input
                          type="number"
                          step="any"
                          value={event.mapLat ?? ''}
                          onChange={(e) =>
                            updateEvent(event.id, {
                              mapLat: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="ex. 48.8566"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Longitude (carte)</label>
                        <input
                          type="number"
                          step="any"
                          value={event.mapLng ?? ''}
                          onChange={(e) =>
                            updateEvent(event.id, {
                              mapLng: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="ex. 2.3522"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
                      <textarea
                        value={event.notes ?? ''}
                        onChange={(e) => updateEvent(event.id, { notes: e.target.value || null })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                        placeholder="Tenue, accès, parking..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer l’événement
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
