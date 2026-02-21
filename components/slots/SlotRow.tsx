import { Slot } from '@/lib/supabase'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import { checkBookingEligibility } from '@/lib/booking-rules'
import AlertToggle from './AlertToggle'

interface SlotRowProps {
  slot: Slot
  currentFutureBookings: number
  onBook: (slotId: string) => void
  isAlertActive: boolean
  onToggleAlert: (slotId: string) => void
  isBookedByMe?: boolean
  onCancelClick?: (slotId: string) => void
}

export default function SlotRow({
  slot,
  currentFutureBookings,
  onBook,
  isAlertActive,
  onToggleAlert,
  isBookedByMe = false,
  onCancelClick,
}: SlotRowProps) {
  const eligibility = checkBookingEligibility(slot.start_at, currentFutureBookings)
  const isAvailable = slot.status === 'available'

  return (
    <div
      className="relative flex items-center justify-between py-6 border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50 transition-colors"
      onClick={() => !isBookedByMe && isAvailable && eligibility.canBook && onBook(slot.id)}
    >
      {/* Cancel button for booked slots */}
      {isBookedByMe && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCancelClick?.(slot.id) }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors z-10"
          aria-label="Cancel booking"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex-1 grid grid-cols-4 gap-4">
        {/* Date / time */}
        <div>
          <p className="text-sm font-light text-zinc-900">{formatSlotDate(slot.start_at)}</p>
          <p className="text-sm text-zinc-600 font-light">{formatSlotTime(slot.start_at)}</p>
        </div>

        {/* Party size */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-zinc-600 font-light">
            {slot.party_min === slot.party_max
              ? `${slot.party_min} guests`
              : `${slot.party_min}–${slot.party_max} guests`}
          </p>
          {isBookedByMe && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-light">
              Confirmed
            </span>
          )}
        </div>

        {/* Spacer */}
        <div />

        {/* Action */}
        <div className="flex items-center gap-2 justify-end">
          {isAvailable && eligibility.canBook && !isBookedByMe ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onBook(slot.id) }}
              className="h-9 px-5 text-sm font-light rounded-lg whitespace-nowrap bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Book
            </button>
          ) : !isBookedByMe ? (
            <div onClick={(e) => e.stopPropagation()}>
              <AlertToggle isActive={isAlertActive} onToggle={() => onToggleAlert(slot.id)} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
