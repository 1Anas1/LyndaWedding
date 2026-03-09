'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { DesignTab } from './tabs/DesignTab'
import { ContentTab } from './tabs/ContentTab'
import { EventsTab } from './tabs/EventsTab'
import { RSVPTab } from './tabs/RSVPTab'
import { LinksTab } from './tabs/LinksTab'
import { PreviewTab } from './tabs/PreviewTab'

interface InvitationEditorProps {
  invitation: {
    id: string
    slug: string
    status: string
    title: string | null
    themeId: string
    contentJson: unknown
    settingsJson: unknown
    theme: {
      id: string
      name: string
      tokensJson: unknown
    }
    events: Array<{
      id: string
      name: string
      startsAt: Date
      endsAt: Date | null
      locationName: string | null
      address: string | null
      mapLat: number | null
      mapLng: number | null
      notes: string | null
      imageUrl?: string | null
    }>
  }
}

export function InvitationEditor({ invitation: initialInvitation }: InvitationEditorProps) {
  const router = useRouter()
  const [invitation, setInvitation] = useState(initialInvitation)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleSave = async (updates: {
    contentJson?: unknown
    settingsJson?: unknown
  }) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/invitations/${invitation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      const updated = await response.json()
      setInvitation(updated)
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (invitation.status === 'PUBLISHED') {
      alert('Invitation is already published')
      return
    }

    setIsPublishing(true)
    try {
      const response = await fetch(`/api/invitations/${invitation.id}/publish`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          // Payment required
          router.push(`/app/billing?invitationId=${invitation.id}`)
          return
        }
        throw new Error(data.error || 'Failed to publish')
      }

      // Update local state
      setInvitation((prev) => ({
        ...prev,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }))

      alert('Invitation published successfully!')
      router.refresh()
    } catch (error) {
      console.error('Publish error:', error)
      alert(error instanceof Error ? error.message : 'Failed to publish')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Link
                href="/app"
                className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold">
                {invitation.title || invitation.slug}
              </h1>
              <p className="text-sm text-muted-foreground">
                {invitation.slug}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isSaving && (
                <span className="text-sm text-muted-foreground">Saving...</span>
              )}
              {invitation.status !== 'PUBLISHED' && (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </Button>
              )}
              {invitation.status === 'PUBLISHED' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                  Published
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="rsvp">RSVP</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="mt-6">
            <DesignTab
              invitation={invitation}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <ContentTab
              invitation={invitation}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsTab
              invitation={invitation}
              onSave={handleSave}
              onEventsSaved={(updated) => setInvitation((prev) => ({ ...prev, events: updated.events }))}
            />
          </TabsContent>

          <TabsContent value="rsvp" className="mt-6">
            <RSVPTab
              invitation={invitation}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="links" className="mt-6">
            <LinksTab
              invitation={invitation}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <PreviewTab invitation={invitation} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
