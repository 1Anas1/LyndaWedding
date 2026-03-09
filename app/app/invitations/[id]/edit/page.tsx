import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { InvitationEditor } from '@/components/app/InvitationEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditInvitationPage(props: PageProps) {
  const user = await requireOwner()
  const params = await props.params
  const { id } = params

  const invitation = await db.invitation.findUnique({
    where: { id },
    include: {
      theme: true,
      events: {
        orderBy: { startsAt: 'asc' },
      },
      owner: true,
    },
  })

  if (!invitation) {
    notFound()
  }

  // Verify invitation belongs to current user
  if (invitation.ownerId !== user.id) {
    notFound()
  }

  return <InvitationEditor invitation={invitation} />
}
