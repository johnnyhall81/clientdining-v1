'use client'

import { useState, useEffect } from 'react'

interface PartySizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (partySize: number) => void
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

  useEffect(() => {
    setPartySize(minSize)
  }, [minSize, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(partySize)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Complete Your Booking
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          {venueName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="partySize" className="block text-sm font-medium text-gray-900 mb-2">
              Party size <span className="text-red-500">*</span>
            </label>
            
            <select
              id="partySize"
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            >
              {Array.from({ length: maxSize - minSize + 1 }, (_, i) => minSize + i).map((size) => (
                <option key={size} value={size}>
                  {size} {size === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-gray-500">
              We'll confirm suitability with the venue if needed.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}