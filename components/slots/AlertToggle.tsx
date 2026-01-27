'use client'

import { useState } from 'react'

interface AlertToggleProps {
  isActive: boolean
  onToggle: () => Promise<void> | void
}

export default function AlertToggle({ isActive, onToggle }: AlertToggleProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      title={isActive ? 'Alert is on for this slot' : 'Turn on an alert for this slot'}
      className={[
        // consistent sizing with Book/Cancel
        'h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
        'focus:outline-none focus-visible:outline-none',
        isLoading ? 'cursor-not-allowed opacity-60' : '',
        isActive
          ? 'border border-orange-500 text-orange-600 bg-white hover:bg-orange-50'
          : 'border border-blue-600 text-blue-600 bg-white hover:bg-blue-50',
      ].join(' ')}
    >
      {isLoading ? 'Saving…' : isActive ? '✓ Following' : '+ Follow'}
    </button>
  )
}
