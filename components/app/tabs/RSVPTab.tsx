'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface RSVPTabProps {
  invitation: {
    id: string
    settingsJson: unknown
  }
  onSave: (updates: { contentJson?: unknown; settingsJson?: unknown }) => Promise<void>
}

export function RSVPTab({ invitation, onSave }: RSVPTabProps) {
  const settings = invitation.settingsJson as {
    rsvpEnabled?: boolean
    requireEmail?: boolean
    requirePhone?: boolean
    allowEdit?: boolean
  }

  const [rsvpEnabled, setRsvpEnabled] = useState(settings.rsvpEnabled ?? true)
  const [requireEmail, setRequireEmail] = useState(settings.requireEmail ?? false)
  const [requirePhone, setRequirePhone] = useState(settings.requirePhone ?? false)
  const [allowEdit, setAllowEdit] = useState(settings.allowEdit ?? false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedSettings = {
        ...settings,
        rsvpEnabled,
        requireEmail,
        requirePhone,
        allowEdit,
      }
      await onSave({ settingsJson: updatedSettings })
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">RSVP Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure RSVP options for your invitation.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="rsvp-enabled"
            checked={rsvpEnabled}
            onChange={(e) => setRsvpEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="rsvp-enabled" className="text-sm font-medium">
            Enable RSVP
          </label>
        </div>

        {rsvpEnabled && (
          <div className="ml-7 space-y-4 border-l-2 border-border pl-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="require-email"
                checked={requireEmail}
                onChange={(e) => setRequireEmail(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="require-email" className="text-sm font-medium">
                Require email address
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="require-phone"
                checked={requirePhone}
                onChange={(e) => setRequirePhone(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="require-phone" className="text-sm font-medium">
                Require phone number
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allow-edit"
                checked={allowEdit}
                onChange={(e) => setAllowEdit(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="allow-edit" className="text-sm font-medium">
                Allow guests to edit their RSVP
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-6 border-t border-border">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
