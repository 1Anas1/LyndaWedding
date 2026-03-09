import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { InvitationStatus } from '@prisma/client'
import WeddingPage from '@/app/wedding/page'

interface PageProps {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ preview?: string }>
}

export default async function UserInvitationPage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { userId } = params
  const preview = searchParams.preview === '1'

  const invitation = await db.invitation.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' },
  })

  if (!invitation) {
    notFound()
  }

  const isPublished = invitation.status === InvitationStatus.PUBLISHED
  const settings = invitation.settingsJson as { previewEnabled?: boolean }
  const canPreview = preview && settings.previewEnabled === true

  if (!isPublished && !canPreview) {
    notFound()
  }

  return <WeddingPage initialSlug={invitation.slug} />
}
