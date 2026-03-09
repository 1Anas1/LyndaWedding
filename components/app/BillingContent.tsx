'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Invitation {
  id: string
  slug: string
  title: string | null
  status: string
}

interface BillingContentProps {
  invitations: Invitation[]
}

export function BillingContent({ invitations }: BillingContentProps) {
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const handlePublish = async (invitationId: string) => {
    setPublishingId(invitationId)
    try {
      const response = await fetch(`/api/invitations/${invitationId}/publish`, {
        method: 'POST',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish')
      }
      window.location.reload()
    } catch (error) {
      console.error('Publish error:', error)
      alert(error instanceof Error ? error.message : 'Failed to publish')
    } finally {
      setPublishingId(null)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/app"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Publish invitations</h1>
          <p className="text-muted-foreground">
            Publish your invitations for free. Once published, guests can view them via the invitation link.
          </p>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have any invitations yet.
            </p>
            <Link href="/app/invitations/new" className="inline-block mt-4">
              <Button>Create invitation</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const content = invitation.title || invitation.slug
              const isPublished = invitation.status === 'PUBLISHED'
              const isPublishing = publishingId === invitation.id

              return (
                <div
                  key={invitation.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{content}</h3>
                      <p className="text-sm text-muted-foreground">
                        {invitation.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isPublished ? (
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <>
                          <Link href={`/app/invitations/${invitation.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handlePublish(invitation.id)}
                            disabled={isPublishing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isPublishing ? 'Publishing...' : 'Publish'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
