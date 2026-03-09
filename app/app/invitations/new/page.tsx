'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'mon-invitation'
}

export default function NewInvitationPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug || slug === slugFromTitle(title)) {
      setSlug(slugFromTitle(value) || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const finalSlug = slug.trim() || slugFromTitle(title) || 'mon-invitation'
    if (!finalSlug) {
      setError('Indiquez un titre ou un lien.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || undefined,
          slug: finalSlug,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création')
        return
      }
      router.push(`/app/invitations/${data.id}/edit`)
      router.refresh()
    } catch {
      setError('Erreur de connexion. Réessayez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewSlug = slug.trim() || slugFromTitle(title) || 'mon-invitation'
  const slugError =
    previewSlug && !/^[a-z0-9-]+$/.test(previewSlug)
      ? 'Lettres minuscules, chiffres et tirets uniquement'
      : null

  return (
    <div className="flex-1">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-border bg-muted/30">
            <h1 className="text-xl font-semibold text-foreground">
              Nouvelle invitation
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Donnez un titre et un lien unique. Vous pourrez tout modifier après.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Titre (optionnel)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Mariage de Marie & Jean"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Lien de l&apos;invitation *
              </label>
              <div className="flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden">
                <span className="pl-3 text-sm text-muted-foreground shrink-0">
                  /i/
                </span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }
                  placeholder="mariage-marie-jean"
                  className="flex-1 min-w-0 border-0 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Lettres minuscules, chiffres et tirets. Ex: mon-mariage-2026
              </p>
              {slugError && (
                <p className="mt-1 text-xs text-destructive">{slugError}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !!slugError}
                className="inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isSubmitting ? 'Création…' : "Créer l'invitation"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/app')}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
