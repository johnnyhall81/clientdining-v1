'use client'

interface CancelBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  venueName?: string
}

export default function CancelBookingModal({ isOpen, onClose, onConfirm, venueName }: CancelBookingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-sm p-7 shadow-xl" style={{ borderRadius: '6px' }}>
        <h2 className="text-xl font-light text-zinc-900 mb-1">Cancel booking</h2>
        {venueName && <p className="text-sm font-light text-zinc-400 mb-5">{venueName}</p>}
        <p className="text-sm font-light text-zinc-500 mb-1">This booking will be released back to the venue.</p>
        <p className="text-sm font-light text-zinc-400 mb-8">You can make a new booking at any time.</p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 h-10 text-xs font-light tracking-widest uppercase bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
            style={{ borderRadius: '3px' }}>
            Keep booking
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 h-10 text-xs font-light tracking-widest uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
            style={{ border: '1px solid #E4E4E7', borderRadius: '3px', backgroundColor: 'transparent' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
