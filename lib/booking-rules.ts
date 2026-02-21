import { isWithin24Hours } from './date-utils'

export const BOOKING_LIMIT = 10

export interface BookingEligibility {
  canBook: boolean
  reason?: string
  isWithin24h: boolean
}

export function checkBookingEligibility(
  slotStartAt: string,
  currentFutureBookings: number
): BookingEligibility {
  const within24h = isWithin24Hours(slotStartAt)

  if (currentFutureBookings >= BOOKING_LIMIT) {
    return {
      canBook: false,
      reason: `You have reached the maximum of ${BOOKING_LIMIT} future bookings`,
      isWithin24h: within24h,
    }
  }

  return {
    canBook: true,
    isWithin24h: within24h,
  }
}
