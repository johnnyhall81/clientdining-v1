'use client'

import { useState } from 'react'

interface ShareButtonProps {
  /** Absolute or root-relative URL to share */
  url: string
  /** Title passed to navigator.share */
  title: string
  /** Tailwind classes for the outer <button> */
  className?: string
  /** Variant controls icon colour and optional backdrop */
  variant?: 'overlay' | 'bare'
}

export default function ShareButton({
  url,
  title,
  className = '',
  variant = 'bare',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const fullUrl = url.startsWith('http')
      ? url
      : `${window.location.origin}${url}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl })
      } catch {
        // User cancelled — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // clipboard unavailable — silent fail
      }
    }
  }

  const overlayClasses =
    'w-8 h-8 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm hover:bg-black/35 transition-colors'

  const bareClasses =
    'w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors'

  return (
    <button
      onClick={handleShare}
      className={`${variant === 'overlay' ? overlayClasses : bareClasses} ${className}`}
      aria-label={copied ? 'Link copied' : 'Share'}
    >
      {copied ? (
        // Checkmark — brief confirmation
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke={variant === 'overlay' ? 'white' : 'currentColor'}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        // Share icon — box with arrow
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke={variant === 'overlay' ? 'white' : 'currentColor'}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  )
}
