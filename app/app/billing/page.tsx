import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import { BillingContent } from '@/components/app/BillingContent'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const user = await requireOwner()

  const invitations = await db.invitation.findMany({
    where: { ownerId: user.id },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return <BillingContent invitations={invitations} />
}
