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
    <div className={`bg-white rounded-lg shadow-sm border border-zinc-200 p-4 ${isCancelled ? 'opacity-60' : ''}`}>
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
              quality={90}
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
                <span className="text-xs bg-zinc-900 text-zinc-50 px-2 py-0.5 rounded-full font-light">
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

        {!isCancelled && !isPast && (
          <button
          onClick={() => setShowCancelModal(true)}
          className="h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors"
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
