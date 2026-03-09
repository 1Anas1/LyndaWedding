import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CopyInvitationLink } from '@/components/app/CopyInvitationLink'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InvitationMessagesPage(props: PageProps) {
  const user = await requireOwner()
  const { id } = await props.params

  const invitation = await db.invitation.findUnique({
    where: { id },
    include: {
      rsvps: {
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { views: true },
      },
    },
  })

  if (!invitation || invitation.ownerId !== user.id) {
    notFound()
  }

  const content = invitation.contentJson as { hero?: { names?: string[] } }
  const title = invitation.title || content.hero?.names?.join(' & ') || invitation.slug

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/app"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          ← Tableau de bord
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">/{invitation.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyInvitationLink
              slug={invitation.slug}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-muted transition-colors"
            />
            <Link
              href={`/app/invitations/${id}/edit`}
              className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Modifier l&apos;invitation
            </Link>
          </div>
        </div>

        <div className="mb-8 p-6 rounded-xl bg-card border border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-1">
            Vues de l&apos;invitation
          </h2>
          <p className="text-3xl font-bold text-foreground">
            {invitation._count.views}
          </p>
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-foreground">Tous les messages</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {invitation.rsvps.length} message{invitation.rsvps.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ul className="divide-y divide-border">
            {invitation.rsvps.length === 0 ? (
              <li className="px-6 py-12 text-center text-muted-foreground">
                Aucun message pour le moment.
              </li>
            ) : (
              invitation.rsvps.map((r) => (
                <li key={r.id} className="px-6 py-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{r.guestName}</p>
                      {r.email && (
                        <p className="text-sm text-muted-foreground">{r.email}</p>
                      )}
                      <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">
                        {r.notes || '—'}
                      </p>
                    </div>
                    <time className="text-xs text-muted-foreground shrink-0">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  )
}
