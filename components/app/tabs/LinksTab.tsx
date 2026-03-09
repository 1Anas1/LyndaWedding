'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface LinksTabProps {
  invitation: {
    id: string
    slug: string
    settingsJson: unknown
  }
  onSave: (updates: { contentJson?: unknown; settingsJson?: unknown }) => Promise<void>
}

export function LinksTab({ invitation, onSave }: LinksTabProps) {
  const settings = invitation.settingsJson as {
    registryLinks?: string[]
    livestreamLink?: string
  }

  const [registryLinks, setRegistryLinks] = useState<string[]>(
    settings.registryLinks || []
  )
  const [livestreamLink, setLivestreamLink] = useState(
    settings.livestreamLink || ''
  )
  const [newRegistryLink, setNewRegistryLink] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleAddRegistryLink = () => {
    if (newRegistryLink.trim()) {
      setRegistryLinks([...registryLinks, newRegistryLink.trim()])
      setNewRegistryLink('')
    }
  }

  const handleRemoveRegistryLink = (index: number) => {
    setRegistryLinks(registryLinks.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedSettings = {
        ...settings,
        registryLinks,
        livestreamLink: livestreamLink || undefined,
      }
      await onSave({ settingsJson: updatedSettings })
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/i/${invitation.slug}`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Links & Sharing</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage external links and sharing options.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Public Invitation URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="flex-1 px-4 py-2 border border-input rounded-md bg-muted"
            />
            <Button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(publicUrl)
                }
              }}
              variant="outline"
            >
              Copy
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Registry Links
          </label>
          <div className="space-y-2">
            {registryLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 px-4 py-2 border border-input rounded-md bg-muted"
                />
                <Button
                  onClick={() => handleRemoveRegistryLink(index)}
                  variant="outline"
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="url"
                value={newRegistryLink}
                onChange={(e) => setNewRegistryLink(e.target.value)}
                placeholder="https://example.com/registry"
                className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRegistryLink()
                  }
                }}
              />
              <Button onClick={handleAddRegistryLink} variant="outline">
                Add
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Livestream Link (optional)
          </label>
          <input
            type="url"
            value={livestreamLink}
            onChange={(e) => setLivestreamLink(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
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
