'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PartySizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (partySize: number, notes?: string, guestNames?: string[]) => void
  minSize: number
  maxSize: number
  venueName: string
  venueImage?: string
  slotTime?: string
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
  venueImage,
  slotTime,
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

        {/* Venue hero banner */}
        {venueImage && (
          <div className="relative h-24 w-full overflow-hidden">
            <Image
              src={venueImage}
              alt={venueName}
              fill
              className="object-cover"
              sizes="448px"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        {/* Header */}
        <div className="relative px-7 pt-7 pb-6 border-b border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-300 hover:text-zinc-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <h2 className="text-xl font-medium text-zinc-900 tracking-tight">{venueName}</h2>
          {slotTime && (
            <p className="text-sm font-light text-zinc-500 mt-1">{slotTime}</p>
          )}
          <p className="text-xs font-light text-zinc-400 mt-3">Confirm your table</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-7 py-7 space-y-6">

            {/* Party size */}
            <div>
              <label className="block text-sm font-light text-zinc-500 mb-3">
                Your party
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
                <div className="text-center">
                  <span className="text-2xl font-light text-zinc-900 tabular-nums">{partySize}</span>
                  <span className="text-sm font-light text-zinc-400 ml-2">guests</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPartySize(p => Math.min(maxSize, p + 1))}
                  disabled={partySize >= maxSize}
                  className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-lg leading-none"
                >
                  +
                </button>
              </div>
              <p className="text-xs font-light text-zinc-300 mt-2">Including you</p>
            </div>

            {/* Guest names */}
            {requiresGuestNames && guestNames.length > 0 && (
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-light text-zinc-500">
                    Who's joining you?
                  </label>
                  <p className="text-xs text-zinc-400 font-light mt-0.5">
                    Add the names of your guests
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
                      className="w-full px-4 py-2.5 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light text-sm text-zinc-900 placeholder:text-zinc-300 transition-all bg-zinc-50"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Special requests */}
            <div>
              <label htmlFor="notes" className="block text-sm font-light text-zinc-500 mb-3">
                Special requests
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dietary requirements, allergies, celebrations…"
                className="w-full px-4 py-3 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light text-sm text-zinc-900 placeholder:text-zinc-300 resize-none transition-all bg-zinc-50"
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

          {/* CTA */}
          <div className="px-7 pb-7">
            {error ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 text-sm font-light rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={[
                    'w-full h-12 text-sm font-light rounded-xl transition-colors',
                    isSubmitting
                      ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800',
                  ].join(' ')}
                >
                  {isSubmitting ? 'Confirming…' : 'Confirm table'}
                </button>
                <p className="text-xs font-light text-zinc-300 text-center mt-3">
                  You'll receive confirmation immediately
                </p>
              </>
            )}
          </div>

        </form>
      </div>
    </div>
  )
}
