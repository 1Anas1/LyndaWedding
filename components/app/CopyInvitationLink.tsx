'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyInvitationLinkProps {
  slug: string
  className?: string
  children?: React.ReactNode
}

export function CopyInvitationLink({ slug, className = '', children }: CopyInvitationLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/i/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [slug])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      title="Copier le lien de l'invitation"
    >
      {children ?? (
        <>
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copier le lien
            </>
          )}
        </>
      )}
    </button>
  )
}
