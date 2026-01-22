import { DinerTier, SlotTier } from './supabase'
import { isWithin24Hours } from './date-utils'

export const BOOKING_LIMITS = {
  free: 3,
  premium: 10
} as const

export interface BookingEligibility {
  canBook: boolean
  reason?: string
  isWithin24h: boolean
  requiresPremium: boolean
}

export function checkBookingEligibility(
  slotStartAt: string,
  slotTier: SlotTier,
  dinerTier: DinerTier,
  currentFutureBookings: number
): BookingEligibility {
  const within24h = isWithin24Hours(slotStartAt)
  
  // 24-hour cutover rule - overrides everything
  if (within24h) {
    return {
      canBook: true,
      isWithin24h: true,
      requiresPremium: false
    }
  }
  
  // Check tier eligibility (only for >24h bookings)
  if (slotTier === 'premium' && dinerTier === 'free') {
    return {
      canBook: false,
      reason: 'Premium subscription required for this slot',
      isWithin24h: false,
      requiresPremium: true
    }
  }
  
  // Check booking cap (only for >24h bookings)
  const limit = BOOKING_LIMITS[dinerTier]
  if (currentFutureBookings >= limit) {
    return {
      canBook: false,
      reason: `You have reached your booking limit (${limit} future bookings)`,
      isWithin24h: false,
      requiresPremium: dinerTier === 'free'
    }
  }
  
  return {
    canBook: true,
    isWithin24h: false,
    requiresPremium: false
  }
}

export function getSlotAccessLabel(slotTier: SlotTier): string {
  return slotTier === 'premium' ? 'Premium' : 'Free'
}

export function getSlotAccessColor(slotTier: SlotTier): string {
  return slotTier === 'premium' ? 'text-amber-600' : 'text-green-600'
}
