'use client'

import { useState, useEffect } from 'react'

interface PartySizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (partySize: number, notes?: string, guestNames?: string[]) => void
  minSize: number
  maxSize: number
  venueName: string
  venueLocation?: string
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
  venueLocation,
  slotTime,
  hostName,
  requiresGuestNames = false,
  error,
  isSubmitting = false,
}: PartySizeModalProps) {
  const [partySize, setPartySize] = useState(minSize)
  const [notes, setNotes] = useState('')
  const [hostField, setHostField] = useState(
    hostName ? hostName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : ''
  )
  const [guestNames, setGuestNames] = useState<string[]>(Array(Math.max(0, minSize - 1)).fill(''))
  const [nameError, setNameError] = useState(false)

  useEffect(() => {
    setPartySize(minSize)
    setNotes('')
    setHostField(hostName ? hostName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : '')
    setGuestNames(Array(Math.max(0, minSize - 1)).fill(''))
    setNameError(false)
  }, [minSize, isOpen, hostName])

  useEffect(() => {
    setGuestNames(prev => {
      const needed = Math.max(0, partySize - 1)
      if (prev.length < needed) return [...prev, ...Array(needed - prev.length).fill('')]
      return prev.slice(0, needed)
    })
  }, [partySize])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (requiresGuestNames && guestNames.some(n => !n.trim())) {
      setNameError(true)
      return
    }
    setNameError(false)
    const allNames = hostField.trim()
      ? [hostField.trim(), ...guestNames.filter(n => n.trim())]
      : undefined
    onConfirm(partySize, notes.trim() || undefined, allNames)
  }

  const inputClass = "w-full pb-2 bg-transparent border-b border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300 font-light focus:outline-none focus:border-zinc-500 transition-colors"
  const labelClass = "text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-light"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-sm shadow-xl overflow-hidden" style={{ borderRadius: '6px' }}>
        <form onSubmit={handleSubmit}>

          {/* Header */}
          <div className="relative px-7 pt-7 pb-6" style={{ borderBottom: '1px solid #F0EDE9' }}>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-zinc-300 hover:text-zinc-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h2 className="text-2xl font-light text-zinc-900 tracking-tight pr-8 leading-tight">{venueName}</h2>
            {venueLocation && (
              <p className="text-[11px] tracking-[0.15em] text-zinc-400 uppercase mt-2 font-light">{venueLocation}</p>
            )}
            {slotTime && <p className="text-sm font-light text-zinc-500 mt-2">{slotTime}</p>}
            <p className="text-sm font-light text-zinc-400 mt-0.5">Party of {partySize}</p>
          </div>

          <div className="px-7 py-7 space-y-8">

            {/* Party stepper */}
            <div>
              <p className={`${labelClass} mb-4`}>Party</p>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setPartySize(p => Math.max(minSize, p - 1))}
                  disabled={partySize <= minSize}
                  className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                >−</button>
                <span className="text-2xl font-light text-zinc-900 tabular-nums w-6 text-center">{partySize}</span>
                <button
                  type="button"
                  onClick={() => setPartySize(p => Math.min(maxSize, p + 1))}
                  disabled={partySize >= maxSize}
                  className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                >+</button>
              </div>
            </div>

            {/* Names */}
            <div className="space-y-4">
              <p className={labelClass}>Names</p>
              <div className="relative">
                <input
                  type="text"
                  value={hostField}
                  onChange={e => setHostField(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                />
                <span className="absolute right-0 top-0 text-[9px] tracking-[0.15em] text-zinc-300 uppercase font-light">Host</span>
              </div>
              {guestNames.map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={e => {
                    const updated = [...guestNames]
                    updated[i] = e.target.value
                    setGuestNames(updated)
                    if (nameError) setNameError(false)
                  }}
                  placeholder={requiresGuestNames ? `Guest ${i + 1}` : `Guest ${i + 1} (optional)`}
                  className={`${inputClass} ${nameError && !name.trim() ? 'border-red-300' : ''}`}
                />
              ))}
              {nameError && (
                <p className="text-xs font-light text-red-400">Please add all guest names to continue.</p>
              )}
            </div>

            {/* Requests */}
            <div>
              <p className={`${labelClass} mb-4`}>Requests</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Dietary requirements, allergies, celebrations…"
                className="w-full bg-transparent border-b border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300 font-light resize-none focus:outline-none focus:border-zinc-500 transition-colors pb-2"
                rows={2}
                maxLength={500}
              />
            </div>

            {error && (
              <p className="text-xs font-light text-red-400">{error}</p>
            )}

          </div>

          {/* CTA */}
          <div className="px-7 pb-7">
            {error ? (
              <button type="button" onClick={onClose}
                className="w-full h-11 text-xs font-light tracking-widest uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
                style={{ border: '1px solid #E4E4E7', borderRadius: '3px' }}>
                Close
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-xs font-light tracking-widest uppercase transition-colors"
                  style={{
                    backgroundColor: isSubmitting ? '#F4F4F5' : '#18181B',
                    color: isSubmitting ? '#A1A1AA' : '#FFFFFF',
                    borderRadius: '3px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Confirming…' : 'Confirm table'}
                </button>
                <p className="text-[10px] tracking-[0.1em] text-zinc-300 text-center mt-3 uppercase font-light">Instant confirmation</p>
              </>
            )}
          </div>

        </form>
      </div>
    </div>
  )
}
