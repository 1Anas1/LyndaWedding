'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <main className="flex-1 flex items-center justify-center min-h-[50vh] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-xl font-semibold text-foreground">
          Erreur lors du chargement
        </h1>
        <p className="text-sm text-muted-foreground">
          Le tableau de bord n&apos;a pas pu se charger. Vérifiez que la base de
          données est configurée (DATABASE_URL sur Vercel) et que les
          migrations ont été appliquées.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Retour à la connexion</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
