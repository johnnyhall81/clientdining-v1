'use client'

import { Booking, Venue, Slot } from '@/lib/supabase'
import { formatFullDateTime } from '@/lib/date-utils'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef } from 'react'
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
  const [notesEditing, setNotesEditing] = useState(false)
  const [privateNotes, setPrivateNotes] = useState(booking.private_notes || '')
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
      setPrivateNotes(notesEditValue)
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

  const noteBoxStyle = "w-full text-sm font-light text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5"

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden relative">
      {!isCancelled && !isPast && (
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-zinc-500 transition-colors"
          aria-label="Cancel booking"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Image — left */}
        <Link href={`/venues/${venue.id}`} prefetch={true} className="relative w-full md:w-2/5 aspect-[4/3] bg-zinc-100 overflow-hidden flex-shrink-0 md:rounded-l-xl hover:opacity-90 transition-opacity">
          {venue.image_venue ? (
            <Image src={venue.image_venue} alt={venue.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw" quality={60} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}
        </Link>

        {/* Details — right */}
        <div className="flex-1 p-6 space-y-4 pr-10">

          {/* Core info */}
          <div className="space-y-1">
            <Link href={`/venues/${venue.id}`} className="hover:opacity-70 transition-opacity">
              <h3 className="font-light text-xl text-zinc-900">{venue.name}</h3>
            </Link>
            {venue.address && (
              mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 font-light hover:text-zinc-700 transition-colors block">
                  {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                </a>
              ) : (
                <p className="text-sm text-zinc-400 font-light">{venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}</p>
              )
            )}
            <p className="text-base text-zinc-500 font-light pt-1">{formatFullDateTime(slot.start_at)}</p>
            <p className="text-base text-zinc-500 font-light">
              {booking.party_size} {booking.party_size === 1 ? 'guest' : 'guests'}
            </p>
          </div>

          {/* Utility links */}
          <div className="flex items-center gap-4">
            {!isPast && !isCancelled && (
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-light text-zinc-400 hover:text-zinc-900 transition-colors">
                Add to calendar
              </a>
            )}
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-light text-zinc-400 hover:text-zinc-900 transition-colors">
                Open in Maps
              </a>
            )}
          </div>

          {/* Restaurant note */}
          {booking.notes && (
            <div className="space-y-1.5">
              <div>
                <p className="text-xs font-normal text-zinc-500 tracking-wide uppercase">Restaurant note</p>
                <p className="text-xs font-light text-zinc-400">Sent with your booking</p>
              </div>
              <p className={noteBoxStyle}>{booking.notes}</p>
            </div>
          )}

          {/* Private notes */}
          <div className="space-y-1.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-normal text-zinc-500 tracking-wide uppercase">Private notes</p>
                <p className="text-xs font-light text-zinc-400">Visible only to you</p>
              </div>
              {!notesEditing && (
                <button
                  type="button"
                  onClick={() => { setNotesEditValue(savedNotes); setNotesEditing(true) }}
                  className="text-xs font-light text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  {savedNotes ? 'Edit' : 'Add'}
                </button>
              )}
            </div>

            {notesEditing ? (
              <div className="space-y-2">
                <textarea
                  value={notesEditValue}
                  onChange={e => setNotesEditValue(e.target.value)}
                  placeholder="Add private notes..."
                  rows={3}
                  autoFocus
                  className="w-full text-sm font-light text-zinc-700 placeholder:text-zinc-300 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-300 resize-none"
                />
                <div className="flex items-center justify-end gap-3">
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
              savedNotes ? (
                <p className={noteBoxStyle}>{savedNotes}</p>
              ) : (
                <p className="text-sm font-light text-zinc-300 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5">No notes added</p>
              )
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
