'use client'

import { Slot, DinerTier } from '@/lib/supabase'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import { checkBookingEligibility, getSlotAccessLabel, getSlotAccessColor } from '@/lib/booking-rules'
import BookButton from './BookButton'
import AlertToggle from './AlertToggle'

interface SlotRowProps {
  slot: Slot
  dinerTier: DinerTier
  currentFutureBookings: number
  onBook: (slotId: string) => void
  isAlertActive: boolean
  onToggleAlert: (slotId: string) => void
}

export default function SlotRow({
  slot,
  dinerTier,
  currentFutureBookings,
  onBook,
  isAlertActive,
  onToggleAlert
}: SlotRowProps) {
  const eligibility = checkBookingEligibility(
    slot.start_at,
    slot.slot_tier,
    dinerTier,
    currentFutureBookings
  )
  
  const isBooked = slot.status === 'booked'
  const isReserved = slot.reserved_for_user_id !== null
  
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-1 grid grid-cols-4 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formatSlotDate(slot.start_at)}
          </p>
          <p className="text-sm text-gray-600">
            {formatSlotTime(slot.start_at)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">
            {slot.party_min === slot.party_max 
              ? `${slot.party_min} guests`
              : `${slot.party_min}-${slot.party_max} guests`
            }
          </p>
        </div>
        
        <div>
          <span className={`text-xs font-medium ${getSlotAccessColor(slot.slot_tier)}`}>
            {getSlotAccessLabel(slot.slot_tier)}
          </span>
          {eligibility.isWithin24h && (
            <span className="ml-2 text-xs font-medium text-blue-600">
              Last minute
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 justify-end">
          {isBooked ? (
            <span className="text-sm text-gray-500">Unavailable</span>
          ) : isReserved ? (
            <span className="text-sm text-orange-600">Reserved</span>
          ) : eligibility.canBook ? (
            <BookButton onBook={() => onBook(slot.id)} />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {eligibility.requiresPremium ? '🔒 Premium' : 'Unavailable'}
              </span>
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
