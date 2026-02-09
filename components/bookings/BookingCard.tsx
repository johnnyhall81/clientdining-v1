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
    <div className={`bg-white rounded-lg shadow-sm border border-zinc-200 p-4 relative ${isCancelled ? 'opacity-60' : ''}`}>
      {/* Cancel X button for active upcoming bookings */}
      {!isCancelled && !isPast && (
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
          aria-label="Cancel booking"
          title="Cancel booking"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex items-center justify-between gap-4">
        
      <Link 
        href={`/venues/${venue.id}`}
        prefetch={true}
        className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
      >




        <div className="relative w-16 h-16 aspect-square bg-zinc-100 rounded overflow-hidden flex-shrink-0">
          {venue.image_venue ? (
            <Image
              src={venue.image_venue}
              alt={venue.name}
              fill
              sizes="64px"
              quality={50}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-light">
              No image
            </div>
          )}
        </div>
          <div>
            <h3 className="font-light text-lg text-zinc-900 hover:underline">{venue.name}</h3>
            <p className="text-sm text-zinc-600 font-light">{venue.area}</p>
            <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
              <span className="text-zinc-700 font-light">
                {formatFullDateTime(slot.start_at)}
              </span>
              <span className="text-zinc-600 font-light">
                {booking.party_size} {booking.party_size === 1 ? 'guest' : 'guests'}
              </span>
              {isCancelled && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-light">
                  Cancelled
                </span>
              )}
              {!isCancelled && !isPast && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-light">
                  Confirmed
                </span>
              )}
              {!isCancelled && isPast && (
                <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-light">
                  Completed
                </span>
              )}
            </div>
            {booking.notes && (
              <p className="text-sm text-zinc-500 font-light mt-2">Note: {booking.notes}</p>
            )}
          </div>
        </Link>

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
