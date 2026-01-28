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
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-1 grid grid-cols-4 gap-4">
        {/* Date / time */}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formatSlotDate(slot.start_at)}
          </p>
          <p className="text-sm text-gray-600">
            {formatSlotTime(slot.start_at)}
          </p>
        </div>

        {/* Party size */}
        <div>
          <p className="text-sm text-gray-600">
            {slot.party_min === slot.party_max
              ? `${slot.party_min} guests`
              : `${slot.party_min}-${slot.party_max} guests`}
          </p>
        </div>

        {/* Access / status */}
        <div>
          {isBookedByMe && (
            <span className="text-xs font-medium text-green-700">Confirmed</span>
          )}
        </div>

        {/* Action */}
        <div className="flex items-center gap-2 justify-end">
          {isBookedByMe ? (
            <button
              type="button"
              onClick={() => onCancel?.(slot.id)}
              className="h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-white border border-red-500 text-red-600 hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>

          ) : eligibility.requiresPremium && !eligibility.isWithin24h && onUnlock ? (
            <button
              type="button"
              onClick={onUnlock}
              className="h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-white border border-amber-600 text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Unlock
            </button>
          ) : isAvailable && eligibility.canBook ? (
            <button
              type="button"
              onClick={() => onBook(slot.id)}
              className="h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Book
            </button>

          ) : (
            <AlertToggle
              isActive={isAlertActive}
              onToggle={() => onToggleAlert(slot.id)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
