import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { InvitationStatus } from '@prisma/client'
import WeddingPage from '@/app/wedding/page'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export default async function InvitationPage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { slug } = params
  const preview = searchParams.preview === '1'

  const invitation = await db.invitation.findUnique({
    where: { slug },
  })

  if (!invitation) {
    notFound()
  }

  // Show invitation if published, or if preview allowed (draft with ?preview=1 or previewEnabled)
  const isPublished = invitation.status === InvitationStatus.PUBLISHED
  const settings = invitation.settingsJson as { previewEnabled?: boolean }
  const canPreview = settings.previewEnabled === true
  const allowed = isPublished || canPreview || preview

  if (!allowed) {
    notFound()
  }

  return <WeddingPage initialSlug={invitation.slug} />
}
