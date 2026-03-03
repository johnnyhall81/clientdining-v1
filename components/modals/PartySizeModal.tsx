'use client'

import { useState, useEffect } from 'react'

interface PartySizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (partySize: number, notes?: string, guestNames?: string[]) => void
  minSize: number
  maxSize: number
  venueName: string
  requiresGuestNames?: boolean
  error?: string | null
  isSubmitting?: boolean
}

export default function PartySizeModal({
  isOpen,
  onClose,
  onConfirm,
  minSize,
  maxSize,
  venueName,
  requiresGuestNames = false,
  error,
  isSubmitting = false,
}: PartySizeModalProps) {
  const [partySize, setPartySize] = useState(minSize)
  const [notes, setNotes] = useState('')
  const [guestNames, setGuestNames] = useState<string[]>([])

  useEffect(() => {
    setPartySize(minSize)
    setNotes('')
    setGuestNames(requiresGuestNames ? Array(minSize - 1).fill('') : [])
  }, [minSize, isOpen])

  useEffect(() => {
    if (requiresGuestNames) {
      setGuestNames(prev => {
        const needed = partySize - 1
        if (prev.length < needed) {
          return [...prev, ...Array(needed - prev.length).fill('')]
        }
        return prev.slice(0, needed)
      })
    }
  }, [partySize, requiresGuestNames])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (requiresGuestNames && guestNames.some(n => !n.trim())) return
    onConfirm(partySize, notes.trim() || undefined, requiresGuestNames ? guestNames : undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-light text-zinc-900 mb-4">
          Complete Your Booking
        </h2>

        <p className="text-sm text-zinc-500 font-light mb-6">
          {venueName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="partySize" className="block text-sm font-light text-zinc-900 mb-2">
              Party size <span className="text-red-500">*</span>
            </label>

            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPartySize(p => Math.max(minSize, p - 1))}
                disabled={partySize <= minSize}
                className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                −
              </button>
              <span className="text-lg font-light text-zinc-900 w-6 text-center">{partySize}</span>
              <button
                type="button"
                onClick={() => setPartySize(p => Math.min(maxSize, p + 1))}
                disabled={partySize >= maxSize}
                className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
              <span className="text-sm font-light text-zinc-400">
                {partySize === 1 ? 'guest' : 'guests'}
              </span>
            </div>

            <p className="mt-2 text-xs text-zinc-500 font-light">
              We will confirm suitability with the venue if needed.
            </p>

          </div>

          {requiresGuestNames && guestNames.length > 0 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-light text-zinc-900 mb-1">
                  Guest names <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-zinc-500 font-light">
                  Required by this venue. Host not included.
                </p>
              </div>
              {guestNames.map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const updated = [...guestNames]
                    updated[i] = e.target.value
                    setGuestNames(updated)
                  }}
                  placeholder={`Guest ${i + 1}`}
                  required
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light text-sm"
                />
              ))}
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-light text-zinc-900 mb-2">
              Is there anything else we should know?
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. dietary requirements, allergies, special occasions..."
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light resize-none"
              rows={3}
              maxLength={500}
            />

            <p className="mt-1 text-xs text-zinc-500 font-light">
              Optional - Let the venue know about allergies, dietary needs, or special occasions.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-light">{error}</p>
            </div>
          )}

          {error ? (
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={[
                  'flex-1 h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap transition-colors',
                  isSubmitting
                    ? 'bg-zinc-600 text-zinc-300 cursor-not-allowed'
                    : 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800',
                ].join(' ')}
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  )
}
