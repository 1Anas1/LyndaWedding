'use client'

import { useState, useEffect } from 'react'

interface StatsTabProps {
  invitation: {
    id: string
    slug: string
  }
}

interface Message {
  id: string
  guestName: string
  message: string | null
  createdAt: string
}

interface Stats {
  viewCount: number
  messages: Message[]
}

export function StatsTab({ invitation }: StatsTabProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      try {
        const res = await fetch(`/api/invitations/${invitation.id}/stats`)
        if (!res.ok) throw new Error('Failed to load stats')
        const data = await res.json()
        if (!cancelled) setStats(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error loading stats')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [invitation.id])

  if (loading) {
    return (
      <div className="text-muted-foreground py-8">
        Chargement des statistiques...
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-destructive py-8">
        {error || 'Impossible de charger les statistiques.'}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Vues
          </h3>
          <p className="text-3xl font-bold">{stats.viewCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Nombre de fois que l&apos;invitation a été ouverte
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Messages reçus
          </h3>
          <p className="text-3xl font-bold">{stats.messages.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Mots laissés par vos invités
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Tous les messages</h3>
        {stats.messages.length === 0 ? (
          <p className="text-muted-foreground py-6">
            Aucun message pour le moment.
          </p>
        ) : (
          <ul className="space-y-4">
            {stats.messages.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{m.guestName}</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {m.message ?? '—'}
                    </p>
                  </div>
                  <time
                    className="text-xs text-muted-foreground shrink-0"
                    dateTime={m.createdAt}
                  >
                    {new Date(m.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
