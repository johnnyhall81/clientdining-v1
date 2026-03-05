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

  const guestCount = partySize - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-100">
          <h2 className="text-xl font-light text-zinc-900">Complete your booking</h2>
          <p className="text-sm font-light text-zinc-400 mt-1">{venueName}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-7">

            {/* Party size stepper */}
            <div>
              <label className="block text-sm font-light text-zinc-700 mb-3">
                Party size <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setPartySize(p => Math.max(minSize, p - 1))}
                  disabled={partySize <= minSize}
                  className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-lg leading-none"
                >
                  −
                </button>
                <span className="text-2xl font-light text-zinc-900 w-6 text-center tabular-nums">{partySize}</span>
                <button
                  type="button"
                  onClick={() => setPartySize(p => Math.min(maxSize, p + 1))}
                  disabled={partySize >= maxSize}
                  className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-lg leading-none"
                >
                  +
                </button>

              </div>

            </div>

            {/* Guest names */}
            {requiresGuestNames && guestNames.length > 0 && (
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-light text-zinc-700">
                    Guest names <span className="text-red-400">*</span>
                  </label>
                  <p className="text-xs text-zinc-400 font-light mt-0.5">
                    {guestCount === 1 ? '1 name required' : `${guestCount} names required`} · host not included
                  </p>
                </div>
                <div className="space-y-2.5">
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
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light text-sm text-zinc-900 placeholder:text-zinc-300 transition-all"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Additional notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-light text-zinc-700 mb-3">
                Anything else we should know?
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergies, dietary needs, special occasions..."
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light text-sm text-zinc-900 placeholder:text-zinc-300 resize-none transition-all"
                rows={2}
                maxLength={500}
              />

            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-light">{error}</p>
              </div>
            )}

          </div>

          {/* Buttons */}
          <div className="px-8 pb-8">
            {error ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 text-sm font-light rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-6 text-sm font-light rounded-xl text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={[
                    'flex-1 h-11 text-sm font-light rounded-xl transition-colors',
                    isSubmitting
                      ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800',
                  ].join(' ')}
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm booking'}
                </button>
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  )
}