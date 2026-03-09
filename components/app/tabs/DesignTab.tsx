'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface DesignTabProps {
  invitation: {
    id: string
    themeId: string
    theme: {
      id: string
      name: string
      tokensJson: unknown
    }
  }
  onSave: (updates: { contentJson?: unknown; settingsJson?: unknown }) => Promise<void>
}

export function DesignTab({ invitation, onSave }: DesignTabProps) {
  const [selectedThemeId, setSelectedThemeId] = useState(invitation.themeId)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real implementation, we'd update the themeId
      // For now, this is a placeholder
      await onSave({})
      alert('Theme selection will be implemented with theme management')
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Design Theme</h2>
        <p className="text-muted-foreground mb-4">
          Current theme: <strong>{invitation.theme.name}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Theme selection and customization will be available in a future update.
        </p>
      </div>
    </div>
  )
}
