'use client'

import { useState, useEffect } from 'react'

interface PartySizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (partySize: number, notes?: string, guestNames?: string[]) => void
  minSize: number
  maxSize: number
  venueName: string
  slotTime?: string
  hostName?: string
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
  slotTime,
  hostName,
  requiresGuestNames = false,
  error,
  isSubmitting = false,
}: PartySizeModalProps) {
  const [partySize, setPartySize] = useState(minSize)
  const [notes, setNotes] = useState('')
  const [hostField, setHostField] = useState(hostName || '')
  const [guestNames, setGuestNames] = useState<string[]>([])
  const [showGuestNames, setShowGuestNames] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    setPartySize(minSize)
    setNotes('')
    setHostField(hostName || '')
    setGuestNames(requiresGuestNames ? Array(Math.max(0, minSize - 1)).fill('') : [])
    setShowGuestNames(false)
    setShowNotes(false)
  }, [minSize, isOpen, hostName])

  useEffect(() => {
    if (requiresGuestNames || showGuestNames) {
      setGuestNames(prev => {
        const needed = Math.max(0, partySize - 1)
        if (prev.length < needed) return [...prev, ...Array(needed - prev.length).fill('')]
        return prev.slice(0, needed)
      })
    }
  }, [partySize, requiresGuestNames, showGuestNames])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (requiresGuestNames && guestNames.some(n => !n.trim())) return
    const allNames = (requiresGuestNames || showGuestNames)
      ? [hostField, ...guestNames]
      : undefined
    onConfirm(partySize, notes.trim() || undefined, allNames)
  }

  const handleToggleGuestNames = () => {
    if (!showGuestNames) {
      setGuestNames(Array(Math.max(0, partySize - 1)).fill(''))
    }
    setShowGuestNames(v => !v)
  }

  const showingNames = requiresGuestNames || showGuestNames

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-600 transition-colors z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <form onSubmit={handleSubmit}>

          {/* Reservation card header */}
          <div className="px-7 pt-7 pb-6 border-b border-zinc-100">
            <h2 className="text-[22px] font-semibold text-zinc-900 tracking-tight">{venueName}</h2>
            {slotTime && (
              <p className="text-sm font-medium text-zinc-500 mt-1">{slotTime}</p>
            )}
            <p className="text-sm font-medium text-zinc-400 mt-0.5">Table for {partySize}</p>
          </div>

          <div className="px-7 py-6 space-y-5">

            {/* Guest stepper */}
            <div>
              <p className="text-[13px] font-medium text-zinc-400 mb-3">Guests</p>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setPartySize(p => Math.max(minSize, p - 1))}
                  disabled={partySize <= minSize}
                  className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-lg"
                >
                  −
                </button>
                <span className="text-2xl font-light text-zinc-900 tabular-nums w-6 text-center">{partySize}</span>
                <button
                  type="button"
                  onClick={() => setPartySize(p => Math.min(maxSize, p + 1))}
                  disabled={partySize >= maxSize}
                  className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Guest names — progressive */}
            <div>
              {!requiresGuestNames && (
                <button
                  type="button"
                  onClick={handleToggleGuestNames}
                  className="text-[13px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showGuestNames ? 'Remove guest names' : 'Add guest names'}
                </button>
              )}

              {showingNames && (
                <div
                  className="space-y-2 mt-3"
                  style={{ animation: 'slideDown 120ms ease-out' }}
                >
                  <style>{`
                    @keyframes slideDown {
                      from { opacity: 0; transform: translateY(-6px); }
                      to   { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>

                  {/* Host field — always first, editable */}
                  <div className="relative">
                    <input
                      type="text"
                      value={hostField}
                      onChange={e => setHostField(e.target.value)}
                      placeholder="Host name"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[15px] text-zinc-900 placeholder:text-zinc-300 font-light focus:outline-none focus:ring-1 focus:ring-zinc-300 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-zinc-300 uppercase tracking-wide">
                      Host
                    </span>
                  </div>

                  {/* Additional guests */}
                  {guestNames.map((name, i) => (
                    <input
                      key={i}
                      type="text"
                      value={name}
                      onChange={e => {
                        const updated = [...guestNames]
                        updated[i] = e.target.value
                        setGuestNames(updated)
                      }}
                      placeholder={`Guest ${i + 1}`}
                      required={requiresGuestNames}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[15px] text-zinc-900 placeholder:text-zinc-300 font-light focus:outline-none focus:ring-1 focus:ring-zinc-300 transition-all"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Special requests — progressive */}
            <div>
              {!showNotes ? (
                <button
                  type="button"
                  onClick={() => setShowNotes(true)}
                  className="text-[13px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Add request
                </button>
              ) : (
                <div style={{ animation: 'slideDown 120ms ease-out' }}>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Dietary requirements, allergies, celebrations…"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[15px] text-zinc-900 placeholder:text-zinc-300 font-light resize-none focus:outline-none focus:ring-1 focus:ring-zinc-300 transition-all"
                    rows={2}
                    maxLength={500}
                    autoFocus
                  />
                </div>
              )}
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
                className="w-full h-12 text-sm font-light rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={[
                    'w-full h-12 text-sm font-medium rounded-xl transition-colors',
                    isSubmitting
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
                  ].join(' ')}
                >
                  {isSubmitting ? 'Confirming…' : 'Confirm table'}
                </button>
                <p className="text-[12px] text-zinc-300 text-center mt-3">
                  Instant confirmation
                </p>
              </>
            )}
          </div>

        </form>
      </div>
    </div>
  )
}
