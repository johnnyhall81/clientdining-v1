'use client'

import { useEffect, useState } from 'react'

type LegacyProps = {
  isActive: boolean
  onToggle: () => Promise<void> | void
}

type ApiProps = {
  isActive: boolean
  slotId: string
  requireLogin?: boolean
  onRequireLogin?: () => void
  onStateChange?: (nextActive: boolean) => void
}

type AlertToggleProps = LegacyProps | ApiProps

function isApiProps(props: AlertToggleProps): props is ApiProps {
  return 'slotId' in props
}

export default function AlertToggle(props: AlertToggleProps) {
  const { isActive } = props
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justActivated, setJustActivated] = useState(false)

  useEffect(() => {
    if (!isActive || !justActivated) return
    const t = setTimeout(() => setJustActivated(false), 2200)
    return () => clearTimeout(t)
  }, [isActive, justActivated])

  const handleClick = async () => {
    setError(null)

    // API-driven mode (used by Search page)
    if (isApiProps(props)) {
      if (props.requireLogin) {
        props.onRequireLogin?.()
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slotId: props.slotId }),
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          setError(data?.error || 'Couldn't update alert')
          return
        }

        const nextActive = Boolean(data?.active)
        props.onStateChange?.(nextActive)

        if (nextActive) setJustActivated(true)
      } catch {
        setError('Couldn't update alert')
      } finally {
        setIsLoading(false)
      }

      return
    }

    // Legacy mode (used elsewhere): parent handles fetch/state
    setIsLoading(true)
    try {
      await props.onToggle()
      setJustActivated(true)
    } catch (e: any) {
      setError(e?.message || 'Couldn't update alert')
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
        title={isActive ? 'Alert is on for this slot' : 'Turn on an alert for this slot'}
        className={[
          'h-10 px-6 text-sm rounded-lg whitespace-nowrap transition-colors font-medium',
          'focus:outline-none focus-visible:outline-none',
          isLoading ? 'cursor-not-allowed opacity-60' : '',

          // Inactive: Follow
          !isActive &&
            'border border-gray-200 text-gray-600 bg-white hover:border-gray-300',

          // Active: Following
          isActive &&
            'border border-gray-300 text-gray-700 bg-gray-50 hover:border-gray-400',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {isLoading ? 'Saving…' : isActive ? '✓ Following' : '+ Follow'}
      </button>

      {error ? (
        <span className="mt-1 text-xs text-red-600">{error}</span>
      ) : isActive && justActivated ? (
        <span className="mt-1 text-xs text-gray-500">We'll email you if it opens.</span>
      ) : null}
    </div>
  )
}