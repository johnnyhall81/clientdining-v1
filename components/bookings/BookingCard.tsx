'use client'

import { Booking, Venue, Slot } from '@/lib/supabase'
import { formatFullDateTime } from '@/lib/date-utils'

interface BookingCardProps {
  booking: Booking
  venue: Venue
  slot: Slot
  onCancel: (bookingId: string) => void
}

export default function BookingCard({ booking, venue, slot, onCancel }: BookingCardProps) {
  const isPast = new Date(slot.start_at) < new Date()
  const isCancelled = booking.status === 'cancelled'
  
  return (
    <div className={`card ${isCancelled ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{venue.name}</h3>
          <p className="text-sm text-gray-600">{venue.area}</p>
        </div>
        {isCancelled && (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Cancelled
          </span>
        )}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">📅</span>
          <span className="text-gray-900">{formatFullDateTime(slot.start_at)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">👥</span>
          <span className="text-gray-900">{booking.party_size} guests</span>
        </div>
        
        {booking.notes && (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-gray-600">📝</span>
            <span className="text-gray-700">{booking.notes}</span>
          </div>
        )}
      </div>
      
      {!isCancelled && !isPast && (
        <button
          onClick={() => onCancel(booking.id)}
          className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          Cancel Booking
        </button>
      )}
    </div>
  )
}
