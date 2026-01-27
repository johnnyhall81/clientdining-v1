'use client'

import { useEffect, useState } from 'react'

interface AlertToggleProps {
  isActive: boolean
  onToggle: () => Promise<void> | void
}

export default function AlertToggle({ isActive, onToggle }: AlertToggleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justActivated, setJustActivated] = useState(false)

  // If the parent updates isActive to true, we can show a brief reassurance line
  useEffect(() => {
    if (!isActive) return
    if (!justActivated) return

    const t = setTimeout(() => setJustActivated(false), 2200)
    return () => clearTimeout(t)
  }, [isActive, justActivated])

  const handleClick = async () => {
    setError(null)
    setIsLoading(true)

    try {
      await onToggle()

      // If we just turned an alert on, show a small reassurance line
      // (We can't perfectly know “on vs off” without changing props,
      // but this feels right in practice.)
      setJustActivated(true)
    } catch (e: any) {
      setError(e?.message || 'Could not update alert')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={[
          'text-sm px-3 py-1 rounded-md border transition-colors',
          'focus:outline-none focus-visible:shadow-sm',
          isActive
            ? 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
          isLoading ? 'opacity-60 cursor-not-allowed' : ''
        ].join(' ')}
        title={isActive ? 'Watching this slot' : 'Set an alert for this slot'}
      >
        {isLoading ? '…' : isActive ? '✓ Watching' : 'Alert me'}
      </button>

      {error ? (
        <span className="mt-1 text-xs text-red-600">Couldn’t set alert</span>
      ) : isActive && justActivated ? (
        <span className="mt-1 text-xs text-gray-500">We’ll email you if it opens.</span>
      ) : null}
    </div>
  )
}
