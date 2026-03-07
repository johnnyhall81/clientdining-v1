'use client'

import { Booking, Venue, Slot } from '@/lib/supabase'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import CancelBookingModal from '@/components/modals/CancelBookingModal'
import { useEffect } from 'react'



interface BookingCardProps {
  booking: Booking
  venue: Venue
  slot: Slot
  onCancel: (bookingId: string) => void
}

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
  </svg>
)

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
)

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

export default function BookingCard({ booking, venue, slot, onCancel }: BookingCardProps) {
  const isPast = new Date(slot.start_at) < new Date()
  const isCancelled = booking.status === 'cancelled'
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [notesEditing, setNotesEditing] = useState(false)
  const [savedNotes, setSavedNotes] = useState(booking.private_notes || '')
  const [notesEditValue, setNotesEditValue] = useState(booking.private_notes || '')
  const [notesSaving, setNotesSaving] = useState(false)


useEffect(() => {
  setSavedNotes(booking.private_notes || '')
  setNotesEditValue(booking.private_notes || '')
}, [booking.private_notes])


  const mapsUrl = venue.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, ${venue.postcode || ''} London`)}`
    : null

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

  const handleSaveNotes = async () => {
    setNotesSaving(true)
    try {
      await fetch(`/api/bookings/${booking.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ private_notes: notesEditValue }),
      })
      setSavedNotes(notesEditValue)
      setNotesEditing(false)
    } catch {
      // fail silently
    } finally {
      setNotesSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setNotesEditValue(savedNotes)
    setNotesEditing(false)
  }

  const dateStr = formatSlotDate(slot.start_at)
  const timeStr = formatSlotTime(slot.start_at)
  const guestStr = `${booking.party_size} ${booking.party_size === 1 ? 'guest' : 'guests'}`

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden relative">
      {!isCancelled && !isPast && (
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-zinc-500 transition-colors"
          aria-label="Cancel booking"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <Link href={`/venues/${venue.id}`} prefetch={true} className="relative w-full md:w-2/5 aspect-[4/3] bg-zinc-100 overflow-hidden flex-shrink-0 md:rounded-l-lg hover:opacity-90 transition-opacity">
          {venue.image_hero ? (
            <Image src={venue.image_hero} alt={venue.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw" quality={60} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}
        </Link>

        {/* Details */}
        <div className="flex-1 px-7 py-5 pr-12 flex flex-col gap-4">

          {/* Core info */}
          <div>
            <Link href={`/venues/${venue.id}`} className="hover:opacity-70 transition-opacity">
              <h3 className="text-lg font-light text-zinc-900 mb-2">{venue.name}</h3>
            </Link>

            {/* Address + map icon */}
            {venue.address && (
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-light text-zinc-400">
                  {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                </span>
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" title="Open in Maps" className="text-zinc-300 hover:text-zinc-500 transition-colors flex-shrink-0">
                    <MapIcon />
                  </a>
                )}
              </div>
            )}

            {/* Date · time · guests + calendar icon */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-light text-zinc-500">
                {dateStr} · {timeStr} · {guestStr}
              </span>
              {!isPast && !isCancelled && (
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" title="Add to calendar" className="text-zinc-300 hover:text-zinc-500 transition-colors flex-shrink-0">
                  <CalendarIcon />
                </a>
              )}
            </div>
          </div>

          {/* Restaurant note */}
          {booking.notes && (
            <div>
              <p className="text-xs font-light text-zinc-400 mb-1">
                Restaurant note <span className="text-zinc-300">· Sent with booking</span>
              </p>
              <p className="text-sm font-light text-zinc-500 border border-zinc-100 rounded px-3 py-2 bg-zinc-50/40">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Guest names */}
          {booking.guest_names && booking.guest_names.length > 0 && (
            <div>
              <p className="text-xs font-light text-zinc-400 mb-2">
                Guests <span className="text-zinc-300">· Sent with booking</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {booking.guest_names.map((name, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-light text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-full"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Private notes */}
          <div>
            <p className="text-xs font-light text-zinc-400 mb-1">
              Private notes <span className="text-zinc-300">· Visible only to you</span>
            </p>
            {notesEditing ? (
              <div>
                <textarea
                  value={notesEditValue}
                  onChange={e => setNotesEditValue(e.target.value)}
                  placeholder="Add private notes..."
                  rows={3}
                  autoFocus
                  className="w-full text-sm font-light text-zinc-900 placeholder:text-zinc-300 border border-zinc-200 rounded px-3 py-2 bg-zinc-50/40 focus:outline-none focus:ring-1 focus:ring-zinc-200 resize-none"
                />
                <div className="flex items-center justify-end gap-3 mt-1.5">
                  <button type="button" onClick={handleCancelEdit} className="text-xs font-light text-zinc-400 hover:text-zinc-900 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={notesSaving}
                    className="text-xs font-light bg-zinc-900 text-white px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    {notesSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="relative group cursor-pointer"
                onClick={() => { setNotesEditValue(savedNotes); setNotesEditing(true) }}
              >
                <div className="border border-zinc-100 rounded bg-zinc-50/40 pr-7 min-h-[36px] max-h-40 overflow-y-auto">
                  <p className="text-sm whitespace-pre-line font-light text-zinc-500 px-3 py-2">
                    {savedNotes || <span className="text-zinc-300">No notes added</span>}
                  </p>
                </div>
                <span className="absolute top-2.5 right-2.5 text-zinc-300 group-hover:text-zinc-500 transition-colors">
                  <PencilIcon />
                </span>
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
