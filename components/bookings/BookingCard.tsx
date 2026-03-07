'use client'

import { Booking, Venue, Slot } from '@/lib/supabase'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import CancelBookingModal from '@/components/modals/CancelBookingModal'

interface BookingCardProps {
  booking: Booking
  venue: Venue
  slot: Slot
  onCancel: (bookingId: string) => void
}

type Tab = 'guests' | 'contact'

export default function BookingCard({ booking, venue, slot, onCancel }: BookingCardProps) {
  const isPast = new Date(slot.start_at) < new Date()
  const isCancelled = booking.status === 'cancelled'
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('guests')

  const calendarUrl = (() => {
    const start = new Date(slot.start_at)
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    const fmt = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
    const details = encodeURIComponent(`Business dinner at ${venue.name}${venue.address ? `\n${venue.address}${venue.postcode ? `, ${venue.postcode}` : ''}` : ''}`)
    const location = encodeURIComponent(`${venue.name}${venue.address ? `, ${venue.address}` : ''}`)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Dinner — ${venue.name}`)}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`
  })()

  const dateStr = formatSlotDate(slot.start_at)
  const timeStr = formatSlotTime(slot.start_at)
  const guestNames = booking.guest_names || []
  const partySize = booking.party_size || 1

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden relative">

      {/* Cancel × */}
      {!isCancelled && !isPast && (
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
          aria-label="Cancel booking"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex flex-col md:flex-row md:items-stretch">

        {/* Image */}
        <Link href={`/venues/${venue.id}`} prefetch={true} className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto bg-zinc-100 overflow-hidden flex-shrink-0 md:rounded-l-lg hover:opacity-90 transition-opacity">
          {venue.image_hero ? (
            <Image src={venue.image_hero} alt={venue.name} fill sizes="(max-width: 768px) 100vw, 40vw" quality={60} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}
          {(venue as any).logo_url && (
            <div className="absolute bottom-3 left-3 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                <img src={(venue as any).logo_url} alt={`${venue.name} logo`} className="h-6 w-auto object-contain" />
              </div>
            </div>
          )}
        </Link>

        {/* Details */}
        <div className="flex-1 px-7 py-6 pr-10 flex flex-col gap-5 h-[340px]">

          {/* Venue name + address */}
          <div className="flex flex-col gap-0.5">
            <Link href={`/venues/${venue.id}`} className="hover:opacity-70 transition-opacity inline-block">
              <h3 className="text-lg font-light text-zinc-900">{venue.name}</h3>
            </Link>
            {venue.address && (
              <p className="text-sm font-light text-zinc-500">
                {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
              </p>
            )}
          </div>

          {/* Booking line */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-light text-zinc-500">
              {timeStr} · {dateStr} · {partySize} {partySize === 1 ? 'guest' : 'guests'}
            </span>
            {!isPast && !isCancelled && (
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer" title="Add to calendar" className="text-zinc-400 hover:text-zinc-500 transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </a>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-col gap-3 flex-1 min-h-0">

            <div className="flex items-center border-b border-zinc-100 flex-shrink-0">
              {(['guests', 'contact'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative mr-5 pb-2.5 text-sm font-light capitalize transition-colors ${
                    activeTab === tab ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {tab === 'guests' ? 'Guests' : 'Contact'}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-zinc-900" />
                  )}
                </button>
              ))}
            </div>

            {/* Guests — pills */}
            {activeTab === 'guests' && (
              <div className="flex flex-wrap gap-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {guestNames.length > 0 ? (
                  guestNames.map((name, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 text-sm font-light text-zinc-500"
                    >
                      {name}
                      {i === 0 && (
                        <span className="text-xs text-zinc-400">Host</span>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-light text-zinc-400">No guest names provided</span>
                )}
              </div>
            )}

            {/* Contact — icon rows */}
            {activeTab === 'contact' && (
              <div className="flex flex-col gap-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {venue.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, ${venue.postcode || ''} London`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 group w-fit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="text-sm font-light text-zinc-500 group-hover:text-zinc-900 transition-colors">
                      {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                    </span>
                  </a>
                )}
                {venue.phone && (
                  <a href={`tel:${venue.phone}`} className="flex items-center gap-2.5 group w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <span className="text-sm font-light text-zinc-500 group-hover:text-zinc-900 transition-colors">{venue.phone}</span>
                  </a>
                )}
                {venue.booking_email && (
                  <a href={`mailto:${venue.booking_email}`} className="flex items-center gap-2.5 group w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span className="text-sm font-light text-zinc-500 group-hover:text-zinc-900 transition-colors">{venue.booking_email}</span>
                  </a>
                )}
                {!venue.address && !venue.phone && !venue.booking_email && (
                  <span className="text-sm font-light text-zinc-400">No contact details on file</span>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      <CancelBookingModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => { setShowCancelModal(false); onCancel(booking.id) }}
        venueName={venue.name}
      />
    </div>
  )
}
