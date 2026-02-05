'use client'

import { useState, useEffect } from 'react'

interface PartySizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (partySize: number, notes?: string) => void  // ✨ CHANGED: Added notes parameter
  minSize: number
  maxSize: number
  venueName: string
  error?: string | null
}

export default function PartySizeModal({
  isOpen,
  onClose,
  onConfirm,
  minSize,
  maxSize,
  venueName,
  error,
}: PartySizeModalProps) {
  const [partySize, setPartySize] = useState(minSize)
  const [notes, setNotes] = useState('')  // ✨ NEW: State for notes

  useEffect(() => {
    setPartySize(minSize)
    setNotes('')  // ✨ NEW: Reset notes when modal opens
  }, [minSize, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(partySize, notes.trim() || undefined)  // ✨ CHANGED: Pass notes to onConfirm
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-light text-zinc-900 mb-4">
          Complete Your Booking
        </h2>

        <p className="text-sm text-zinc-600 font-light mb-6">
          {venueName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="partySize" className="block text-sm font-light text-zinc-900 mb-2">
              Party size <span className="text-red-500">*</span>
            </label>
            
            <select
              id="partySize"
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light"
              required
            >
              {Array.from({ length: maxSize - minSize + 1 }, (_, i) => minSize + i).map((size) => (
                <option key={size} value={size}>
                  {size} {size === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-zinc-500 font-light">
              We'll confirm suitability with the venue if needed.
            </p>
          </div>

          {/* ✨ NEW: Notes textarea field */}
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
                className="flex-1 h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          )}




        </form>
      </div>
    </div>
  )
}
