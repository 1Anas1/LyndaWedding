import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import Link from 'next/link'
import {
  Eye,
  MessageCircle,
  Calendar,
  ExternalLink,
  BarChart2,
  Pencil,
  Heart,
  Plus,
} from 'lucide-react'
import { CopyInvitationLink } from '@/components/app/CopyInvitationLink'

export default async function OwnerDashboard() {
  const user = await requireOwner()

  const invitations = await db.invitation.findMany({
    where: { ownerId: user.id },
    include: {
      theme: true,
      rsvps: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          guestName: true,
          notes: true,
          attending: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          rsvps: true,
          events: true,
          views: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Mes invitations
            </h1>
            <p className="mt-1 text-muted-foreground">
              Bonjour {user.name || user.email}, voici vos invitations et leurs statistiques.
            </p>
          </div>
          <Link
            href="/app/invitations/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Créer une invitation
          </Link>
        </div>

        {invitations.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Heart className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              Aucune invitation
            </h2>
            <p className="mt-2 max-w-sm mx-auto text-sm text-muted-foreground">
              Vous n&apos;avez pas encore d&apos;invitation. Créez-en une pour commencer.
            </p>
            <Link
              href="/app/invitations/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Créer ma première invitation
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {invitations.map((invitation) => {
              const content = invitation.contentJson as {
                hero?: { names?: string[] }
              }
              const names = content.hero?.names || ['Sans titre']
              const title = invitation.title || names.join(' & ')
              const baseUrl =
                process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              const shareUrl = `${baseUrl}/i/${invitation.slug}`

              return (
                <article
                  key={invitation.id}
                  className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          /{invitation.slug}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${
                          invitation.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {invitation.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {invitation._count.views} vues
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" />
                        {invitation._count.rsvps} messages
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {invitation._count.events} événements
                      </span>
                    </div>

                    {invitation.rsvps.length > 0 && (
                      <div className="mt-auto pt-4 border-t border-border space-y-2">
                        <p className="text-xs font-medium text-foreground">
                          Derniers messages
                        </p>
                        {invitation.rsvps.slice(0, 2).map((r) => (
                          <p
                            key={r.id}
                            className="text-xs text-muted-foreground line-clamp-2"
                          >
                            <span className="font-medium text-foreground">
                              {r.guestName}:
                            </span>{' '}
                            {r.notes || '—'}
                          </p>
                        ))}
                        {invitation.rsvps.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{invitation.rsvps.length - 2} autre
                            {invitation.rsvps.length > 3 ? 's' : ''}…
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 bg-muted/30 border-t border-border flex flex-wrap items-center gap-2">
                    <Link
                      href={`/app/invitations/${invitation.id}/messages`}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground bg-background border border-border hover:bg-muted transition-colors"
                    >
                      <BarChart2 className="h-4 w-4" />
                      Stats & messages
                    </Link>
                    <Link
                      href={`/app/invitations/${invitation.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                      Modifier
                    </Link>
                    <CopyInvitationLink
                      slug={invitation.slug}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    />
                    {invitation.status === 'PUBLISHED' && (
                      <a
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Voir l&apos;invitation
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
