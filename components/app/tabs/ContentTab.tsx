'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ContentTabProps {
  invitation: {
    id: string
    contentJson: unknown
  }
  onSave: (updates: { contentJson?: unknown; settingsJson?: unknown }) => Promise<void>
}

export function ContentTab({ invitation, onSave }: ContentTabProps) {
  const content = invitation.contentJson as {
    hero?: {
      names?: string[]
      date?: string
      message?: string
    }
    sections?: {
      story?: {
        enabled?: boolean
        content?: string
      }
      countdown?: {
        enabled?: boolean
      }
      registry?: {
        enabled?: boolean
      }
    }
  }

  const [names, setNames] = useState<string[]>(content.hero?.names || ['', ''])
  const [date, setDate] = useState(content.hero?.date || '')
  const [message, setMessage] = useState(content.hero?.message || '')
  const [storyEnabled, setStoryEnabled] = useState(content.sections?.story?.enabled ?? false)
  const [storyContent, setStoryContent] = useState(content.sections?.story?.content || '')
  const [countdownEnabled, setCountdownEnabled] = useState(content.sections?.countdown?.enabled ?? false)
  const [registryEnabled, setRegistryEnabled] = useState(content.sections?.registry?.enabled ?? false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedContent = {
        hero: {
          names,
          date,
          message,
        },
        sections: {
          story: {
            enabled: storyEnabled,
            content: storyContent,
          },
          countdown: {
            enabled: countdownEnabled,
          },
          registry: {
            enabled: registryEnabled,
          },
        },
      }
      await onSave({ contentJson: updatedContent })
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Content</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Edit the main content of your invitation.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Couple Names *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={names[0] || ''}
              onChange={(e) => setNames([e.target.value, names[1] || ''])}
              placeholder="First name"
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="text"
              value={names[1] || ''}
              onChange={(e) => setNames([names[0] || '', e.target.value])}
              placeholder="Second name"
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Date *
          </label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="e.g., June 15, 2025"
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Welcome Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="We are delighted to invite you..."
            rows={4}
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold mb-4">Sections</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="story-enabled"
                checked={storyEnabled}
                onChange={(e) => setStoryEnabled(e.target.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="story-enabled" className="block text-sm font-medium mb-2">
                  Our Story
                </label>
                {storyEnabled && (
                  <textarea
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    placeholder="Tell your story..."
                    rows={4}
                    className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="countdown-enabled"
                checked={countdownEnabled}
                onChange={(e) => setCountdownEnabled(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="countdown-enabled" className="text-sm font-medium">
                Countdown Timer
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="registry-enabled"
                checked={registryEnabled}
                onChange={(e) => setRegistryEnabled(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="registry-enabled" className="text-sm font-medium">
                Registry Section
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-border">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
