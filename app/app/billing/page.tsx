import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import { BillingContent } from '@/components/app/BillingContent'

interface PageProps {
  searchParams: Promise<{ success?: string; canceled?: string; session_id?: string; invitationId?: string }>
}

export default async function BillingPage(props: PageProps) {
  const user = await requireOwner()
  const searchParams = await props.searchParams

  const invitations = await db.invitation.findMany({
    where: { ownerId: user.id },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return <BillingContent invitations={invitations} searchParams={searchParams} />
}
