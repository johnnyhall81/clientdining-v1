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
    <div className={`bg-white border border-zinc-200 relative ${isCancelled ? 'opacity-50' : ''}`}>
      {/* Cancel button */}
      {!isCancelled && !isPast && (
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-zinc-600 transition-colors"
          aria-label="Cancel booking"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <Link
        href={`/venues/${venue.id}`}
        prefetch={true}
        className="flex flex-col md:flex-row hover:opacity-90 transition-opacity"
      >
        {/* Wide landscape image — left half */}
        <div className="relative w-full md:w-2/5 aspect-[4/3] bg-zinc-100 overflow-hidden flex-shrink-0">
          {venue.image_venue ? (
            <Image
              src={venue.image_venue}
              alt={venue.name}
              fill
              sizes="40vw"
              quality={60}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}
        </div>

        {/* Details — right side */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-3">
              <h3 className="font-light text-xl text-zinc-900">{venue.name}</h3>
            </div>
            <p className="text-sm text-zinc-500 font-light">{venue.area}</p>
            <p className="text-sm text-zinc-500 font-light pt-2">{formatFullDateTime(slot.start_at)}</p>
            <p className="text-sm text-zinc-500 font-light">
              {booking.party_size} {booking.party_size === 1 ? 'guest' : 'guests'}
            </p>
            {booking.notes && (
              <p className="text-sm text-zinc-400 font-light italic pt-1">{booking.notes}</p>
            )}
          </div>


        </div>
      </Link>

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
