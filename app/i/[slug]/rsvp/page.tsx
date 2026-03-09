import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { InvitationStatus } from '@prisma/client'
import { RSVPForm } from '@/components/public/RSVPForm'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export default async function RSVPPage(props: PageProps) {
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

  // Check if invitation is accessible
  const isPublished = invitation.status === InvitationStatus.PUBLISHED
  const settings = invitation.settingsJson as { previewEnabled?: boolean }
  const canPreview = preview && settings.previewEnabled === true

  if (!isPublished && !canPreview) {
    notFound()
  }

  const settingsData = invitation.settingsJson as {
    rsvpEnabled?: boolean
  }

  if (settingsData.rsvpEnabled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">RSVP Not Available</h1>
          <p className="text-muted-foreground">
            RSVP is not enabled for this invitation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">RSVP</h1>
        <RSVPForm invitationSlug={slug} />
      </div>
    </div>
  )
}
