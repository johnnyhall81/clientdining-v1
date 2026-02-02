'use client'

interface CancelBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  venueName?: string
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  venueName,
}: CancelBookingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-light text-zinc-900 mb-3">
          Cancel booking
        </h2>

        <p className="text-zinc-700 font-light mb-2">
          This booking will be released back to the venue.
        </p>

        {venueName && (
          <p className="text-sm text-zinc-500 font-light mb-6">
            {venueName}
          </p>
        )}

        <p className="text-sm text-zinc-500 font-light mb-6">
          You can make a new booking at any time.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition-colors"
          >
            Keep booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Cancel booking
          </button>
        </div>
      </div>
    </div>
  )
}
