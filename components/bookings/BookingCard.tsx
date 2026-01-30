'use client'

import { Booking, Venue, Slot } from '@/lib/supabase'
import { formatFullDateTime } from '@/lib/date-utils'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import CancelBookingModal from '@/components/modals/CancelBookingModal'

interface BookingCardProps {
  booking: Booking
  venue: Venue
  slot: Slot
  onCancel: (bookingId: string) => void
}

export default function BookingCard({ booking, venue, slot, onCancel }: BookingCardProps) {
  const isPast = new Date(slot.start_at) < new Date()
  const isCancelled = booking.status === 'cancelled'
  const [showCancelModal, setShowCancelModal] = useState(false)
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${isCancelled ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <Link 
          href={`/venues/${venue.id}`} 
          className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
        >
        <div className="relative w-16 h-16 aspect-square bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {venue.image_venue ? (
            <Image
              src={venue.image_venue}
              alt={venue.name}
              fill
              sizes="64px"
              quality={90}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No image
            </div>
          )}
        </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 hover:underline">{venue.name}</h3>
            <p className="text-sm text-gray-600">{venue.area}</p>
            <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
              <span className="text-gray-700">
                {formatFullDateTime(slot.start_at)}
              </span>
              <span className="text-gray-600">
                {booking.party_size} {booking.party_size === 1 ? 'guest' : 'guests'}
              </span>
              {isCancelled && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                  Cancelled
                </span>
              )}
              {!isCancelled && !isPast && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Confirmed
                </span>
              )}
              {!isCancelled && isPast && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                  Completed
                </span>
              )}
            </div>
            {booking.notes && (
              <p className="text-sm text-gray-500 mt-2">Note: {booking.notes}</p>
            )}
          </div>
        </Link>

        {!isCancelled && !isPast && (
          <button
          onClick={() => setShowCancelModal(true)}
          className="h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
       )}
       </div>
 
       <CancelBookingModal
         isOpen={showCancelModal}
         onClose={() => setShowCancelModal(false)}
         onConfirm={() => {
           setShowCancelModal(false)
           onCancel(booking.id)
         }}
         venueName={venue.name}
       />
     </div>
   )
 }