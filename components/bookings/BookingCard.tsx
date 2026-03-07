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

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
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
  const [noteTab, setNoteTab] = useState<'venue' | 'self'>('venue')

  useEffect(() => {
    setSavedNotes(booking.private_notes || '')
    setNotesEditValue(booking.private_notes || '')
  }, [booking.private_notes])

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
  const hostName = booking.guest_names?.[0] || null
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
        </Link>

        {/* Details */}
        <div className="flex-1 px-7 py-5 pr-12 flex flex-col gap-3">

          {/* Venue block */}
          <div className="flex flex-col gap-0.5">
            <Link href={`/venues/${venue.id}`} className="hover:opacity-70 transition-opacity inline-block">
              <h3 className="text-lg font-light text-zinc-900">{venue.name}</h3>
            </Link>
            {venue.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, ${venue.postcode || ''} London`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 group w-fit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-zinc-400 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-sm font-light text-zinc-400 group-hover:text-zinc-900 transition-colors">
                  {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                </span>
              </a>
            )}
            {(venue.phone || venue.booking_email) && (
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-zinc-400 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {venue.phone && (
                  <a href={`tel:${venue.phone}`} className="text-sm font-light text-zinc-400 hover:text-zinc-900 transition-colors">{venue.phone}</a>
                )}
                {venue.phone && venue.booking_email && <span className="text-zinc-300">·</span>}
                {venue.booking_email && (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-zinc-400 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <a href={`mailto:${venue.booking_email}`} className="text-sm font-light text-zinc-400 hover:text-zinc-900 transition-colors">{venue.booking_email}</a>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Booking line */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-light text-zinc-500">
              {`Party of ${partySize}`}
              {hostName ? ` · ${hostName}` : ''}
              {` · ${dateStr} · ${timeStr}`}
            </span>
            {!isPast && !isCancelled && (
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer" title="Add to calendar" className="text-zinc-400 hover:text-zinc-500 transition-colors flex-shrink-0">
                <CalendarIcon />
              </a>
            )}
          </div>

          {/* Tabbed notes */}
          <div>
            {/* Tab bar */}
            <div className="flex items-center gap-1 border-b border-zinc-100 mb-3">
              {(['venue', 'self'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setNoteTab(tab)}
                  className={`relative px-0 mr-4 py-2 text-sm font-light transition-colors ${
                    noteTab === tab ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {tab === 'venue' ? 'Note to venue' : 'Note to self'}
                  {noteTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-zinc-900" />
                  )}
                </button>
              ))}
            </div>

            {/* Venue note */}
            {noteTab === 'venue' && (
              <div className="relative">
                <div
                  className="text-sm font-light text-zinc-500 break-all overflow-y-scroll"
                  style={{
                    maxHeight: '2.8em',
                    lineHeight: '1.4em',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  } as React.CSSProperties}
                >
                  {booking.notes || <span className="text-zinc-400">No note sent with this booking</span>}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
            )}

            {/* Self note */}
            {noteTab === 'self' && (
              notesEditing ? (
                <div>
                  <textarea
                    value={notesEditValue}
                    onChange={e => setNotesEditValue(e.target.value)}
                    placeholder="Add a note…"
                    rows={3}
                    autoFocus
                    className="w-full text-sm font-light text-zinc-900 placeholder:text-zinc-400 border border-zinc-200 rounded px-3 py-2 bg-zinc-50/40 focus:outline-none focus:ring-1 focus:ring-zinc-200 resize-none"
                  />
                  <div className="flex items-center justify-end gap-3 mt-1.5">
                    <button type="button" onClick={handleCancelEdit} className="text-xs font-light text-zinc-500 hover:text-zinc-900 transition-colors">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={notesSaving}
                      className="text-xs font-light bg-zinc-900 text-white px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {notesSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="relative group cursor-pointer"
                  onClick={() => { setNotesEditValue(savedNotes); setNotesEditing(true) }}
                >
                  <div
                    className="text-sm font-light text-zinc-500 break-all overflow-y-scroll"
                    style={{
                      maxHeight: '2.8em',
                      lineHeight: '1.4em',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    } as React.CSSProperties}
                  >
                    {savedNotes || <span className="text-zinc-400">Add a note…</span>}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  <span className="absolute top-0 right-0 text-zinc-300 group-hover:text-zinc-500 transition-colors">
                    <PencilIcon />
                  </span>
                </div>
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
