import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InvitationStatsPage(props: PageProps) {
  const user = await requireOwner()
  const { id } = await props.params

  const invitation = await db.invitation.findUnique({
    where: { id },
    include: {
      _count: { select: { views: true } },
      rsvps: {
        where: { notes: { not: null } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!invitation) notFound()
  if (invitation.ownerId !== user.id) notFound()

  const content = invitation.contentJson as { hero?: { names?: string[] } }
  const names = content?.hero?.names?.join(' & ') || invitation.title || invitation.slug

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/app"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <Link
            href={`/app/invitations/${id}/edit`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Edit invitation
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Stats & messages</h1>
        <p className="text-muted-foreground mb-8">{names}</p>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Views</h2>
          <p className="text-3xl font-light text-primary">
            {invitation._count.views}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Number of times your invitation has been viewed
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">
            Messages from guests ({invitation.rsvps.length})
          </h2>
          {invitation.rsvps.length === 0 ? (
            <p className="text-muted-foreground">No messages yet.</p>
          ) : (
            <ul className="space-y-4">
              {invitation.rsvps.map((r) => (
                <li
                  key={r.id}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="font-medium">{r.guestName}</span>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {r.notes}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
