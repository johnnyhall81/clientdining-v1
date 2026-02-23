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

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
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

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
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
        <Link href={`/venues/${venue.id}`} prefetch={true} className="relative w-full md:w-2/5 aspect-[4/3] bg-zinc-100 overflow-hidden flex-shrink-0 md:rounded-l-xl hover:opacity-90 transition-opacity">
          {venue.image_venue ? (
            <Image src={venue.image_venue} alt={venue.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw" quality={60} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}
        </Link>

        {/* Details */}
        <div className="flex-1 px-6 py-5 pr-10 flex flex-col gap-4">

          {/* Core info block */}
          <div>
            <Link href={`/venues/${venue.id}`} className="hover:opacity-70 transition-opacity">
              <h3 className="text-lg font-light text-zinc-900 mb-0.5">{venue.name}</h3>
            </Link>
            {venue.address && (
              mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-light text-zinc-500 hover:text-zinc-900 transition-colors block">
                  {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                </a>
              ) : (
                <p className="text-sm font-light text-zinc-500">{venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}</p>
              )
            )}
            <p className="text-sm font-light text-zinc-500 mt-2">{formatFullDateTime(slot.start_at)}</p>
            <p className="text-sm font-light text-zinc-500">{booking.party_size} {booking.party_size === 1 ? 'guest' : 'guests'}</p>
            {((!isPast && !isCancelled) || mapsUrl) && (
              <div className="flex items-center gap-1 mt-1.5">
                {!isPast && !isCancelled && (
                  <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                    Add to calendar
                  </a>
                )}
                {!isPast && !isCancelled && mapsUrl && <span className="text-xs text-zinc-300">·</span>}
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                    Open in Maps
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Restaurant note */}
          {booking.notes && (
            <div>
              <p className="text-xs font-light text-zinc-500 mb-1">
                Restaurant note <span className="text-zinc-400">· Sent with booking</span>
              </p>
              <p className="text-sm font-light text-zinc-500 border border-zinc-100 rounded-md px-3 py-2 bg-zinc-50/50">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Private notes */}
          <div>
            <p className="text-xs font-light text-zinc-500 mb-1">
              Private notes <span className="text-zinc-400">· Visible only to you</span>
            </p>
            {notesEditing ? (
              <div>
                <textarea
                  value={notesEditValue}
                  onChange={e => setNotesEditValue(e.target.value)}
                  placeholder="Add private notes..."
                  rows={3}
                  autoFocus
                  className="w-full text-sm font-light text-zinc-900 placeholder:text-zinc-300 border border-zinc-100 rounded-md px-3 py-2 bg-zinc-50/50 focus:outline-none focus:ring-1 focus:ring-zinc-200 resize-none"
                />
                <div className="flex items-center justify-end gap-3 mt-1.5">
                  <button type="button" onClick={handleCancelEdit} className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={notesSaving}
                    className="text-xs font-light bg-zinc-900 text-white px-3 py-1.5 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50"
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
                <p className="text-sm font-light text-zinc-500 border border-zinc-100 rounded-md px-3 py-2 bg-zinc-50/50 pr-7 min-h-[36px]">
                  {savedNotes || <span className="text-zinc-300">No notes added</span>}
                </p>
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
