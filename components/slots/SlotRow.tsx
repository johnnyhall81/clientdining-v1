import { Slot, DinerTier } from '@/lib/supabase'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import {
  checkBookingEligibility,
  getSlotAccessLabel,
  getSlotAccessColor,
} from '@/lib/booking-rules'
import AlertToggle from './AlertToggle'

interface SlotRowProps {
  slot: Slot
  dinerTier: DinerTier
  currentFutureBookings: number
  onBook: (slotId: string) => void
  isAlertActive: boolean
  onToggleAlert: (slotId: string) => void
  isBookedByMe?: boolean
  onCancel?: (slotId: string) => Promise<void> | void
  onUnlock?: () => void
}

export default function SlotRow({
  slot,
  dinerTier,
  currentFutureBookings,
  onBook,
  isAlertActive,
  onToggleAlert,
  isBookedByMe = false,
  onCancel,
  onUnlock,
}: SlotRowProps) {
  const eligibility = checkBookingEligibility(
    slot.start_at,
    slot.slot_tier,
    dinerTier,
    currentFutureBookings
  )

  const isAvailable = slot.status === 'available'

  return (
    <div 
      className="flex items-center justify-between py-4 border-b border-zinc-200 last:border-b-0 cursor-pointer hover:bg-zinc-50 transition-colors"
      onClick={() => !isBookedByMe && isAvailable && eligibility.canBook && onBook(slot.id)}
    >
      <div className="flex-1 grid grid-cols-4 gap-4">
        {/* Date / time */}
        <div>
          <p className="text-sm font-light text-zinc-900">
            {formatSlotDate(slot.start_at)}
          </p>
          <p className="text-sm text-zinc-600 font-light">
            {formatSlotTime(slot.start_at)}
          </p>
        </div>

        {/* Party size */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-zinc-600 font-light">
            {slot.party_min === slot.party_max
              ? `${slot.party_min} guests`
              : `${slot.party_min}-${slot.party_max} guests`}
          </p>
          {isBookedByMe && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-light">
              Confirmed
            </span>
          )}
          {slot.slot_tier === 'premium' && dinerTier === 'premium' && !isBookedByMe && (
            <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-light">
              Premium
            </span>
          )}
        </div>

        {/* Access / status - empty spacer */}
        <div></div>

        {/* Action */}
        <div className="flex items-center gap-2 justify-end">
          {isBookedByMe ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onCancel?.(slot.id)
              }}
              className="h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>

          ) : eligibility.requiresPremium && !eligibility.isWithin24h && onUnlock ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onUnlock()
              }}
              className="h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Unlock
            </button>

          ) : slot.slot_tier === 'premium' && dinerTier === 'premium' && isAvailable && eligibility.canBook ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onBook(slot.id)
              }}
              className="h-9 px-5 text-sm font-light rounded-lg whitespace-nowrap bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Book
            </button>

          ) : isAvailable && eligibility.canBook ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onBook(slot.id)
              }}
              className="h-9 px-5 text-sm font-light rounded-lg whitespace-nowrap bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Book
            </button>

          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <AlertToggle
                isActive={isAlertActive}
                onToggle={() => onToggleAlert(slot.id)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
