'use client'

import { Booking, Venue, Slot } from '@/lib/supabase'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react'
import CancelBookingModal from '@/components/modals/CancelBookingModal'

interface BookingCardProps {
  booking: Booking
  venue: Venue
  slot: Slot
  bookerName?: string
  onCancel: (bookingId: string) => void
}

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
)

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
  </svg>
)

type Tab = 'guests' | 'notes' | 'contact'

export default function BookingCard({ booking, venue, slot, bookerName, onCancel }: BookingCardProps) {
  const isPast = new Date(slot.start_at) < new Date()
  const isCancelled = booking.status === 'cancelled'
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('guests')
  const [notesEditing, setNotesEditing] = useState(false)
  const [savedNotes, setSavedNotes] = useState(booking.private_notes || '')
  const [notesEditValue, setNotesEditValue] = useState(booking.private_notes || '')
  const [notesSaving, setNotesSaving] = useState(false)
  const [venueNoteOverflows, setVenueNoteOverflows] = useState(false)
  const [selfNoteOverflows, setSelfNoteOverflows] = useState(false)
  const venueNoteRef = useRef<HTMLDivElement>(null)
  const selfNoteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSavedNotes(booking.private_notes || '')
    setNotesEditValue(booking.private_notes || '')
  }, [booking.private_notes])

  useEffect(() => {
    if (venueNoteRef.current) {
      setVenueNoteOverflows(venueNoteRef.current.scrollHeight > venueNoteRef.current.clientHeight)
    }
  }, [booking.notes, activeTab])

  useEffect(() => {
    if (selfNoteRef.current) {
      setSelfNoteOverflows(selfNoteRef.current.scrollHeight > selfNoteRef.current.clientHeight)
    }
  }, [savedNotes, activeTab])

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
  // Host is first named guest, falling back to booker profile name
  const hostDisplayName = guestNames[0] || bookerName || 'Host'
  const namedGuests = guestNames.length > 0 ? guestNames : null
  const remainder = partySize - guestNames.length

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
        <div className="flex-1 p-6 pr-10 flex flex-col gap-4 h-[340px]">

          {/* Venue name + address — matches alerts card */}
          <div className="space-y-0.5">
            <Link href={`/venues/${venue.id}`} prefetch={true}>
              <h3 className="text-lg font-light text-zinc-900 hover:opacity-70 transition-opacity">{venue.name}</h3>
            </Link>
            {venue.address && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-light text-zinc-500">
                  {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, ${venue.postcode || ''} London`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Maps"
                  className="text-zinc-400 hover:text-zinc-500 transition-colors flex-shrink-0"
                >
                  <MapIcon />
                </a>
              </div>
            )}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-sm font-light text-zinc-500">
                {dateStr} · {timeStr} · {partySize} {partySize === 1 ? 'guest' : 'guests'}
              </span>
              {!isPast && !isCancelled && (
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" title="Add to calendar" className="text-zinc-400 hover:text-zinc-500 transition-colors flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col gap-3 flex-1 min-h-0">

            <div className="flex items-center border-b border-zinc-100 flex-shrink-0">
              {(['guests', 'notes', 'contact'] as Tab[]).map(tab => (
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
                {namedGuests ? (
                  <>
                    {namedGuests.map((name, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 text-sm font-light text-zinc-500"
                      >
                        {name}
                        {i === 0 && <span className="text-xs text-zinc-400">Host</span>}
                      </span>
                    ))}
                    {remainder > 0 && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-zinc-200 text-sm font-light text-zinc-400">
                        +{remainder}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 text-sm font-light text-zinc-500">
                      {hostDisplayName}
                      <span className="text-xs text-zinc-400">Host</span>
                    </span>
                    {remainder > 0 && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-zinc-200 text-sm font-light text-zinc-400">
                        +{remainder}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Notes */}
            {activeTab === 'notes' && (
              <div className="flex flex-col gap-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

                {/* Sent to venue */}
                <div>
                  <p className="text-xs font-light text-zinc-400 mb-1.5">Sent to venue</p>
                  <div className="relative">
                    <div
                      ref={venueNoteRef}
                      className="text-sm font-light text-zinc-500 break-words overflow-y-scroll"
                      style={{ maxHeight: '5.6em', lineHeight: '1.4em', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                    >
                      {booking.notes || <span className="text-zinc-400">No note sent with this booking</span>}
                    </div>
                    {venueNoteOverflows && (
                      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Internal note */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <p className="text-xs font-light text-zinc-400">Internal note</p>
                    {!notesEditing && (
                      <button type="button" onClick={() => { setNotesEditValue(savedNotes); setNotesEditing(true) }} className="text-zinc-300 hover:text-zinc-500 transition-colors">
                        <PencilIcon />
                      </button>
                    )}
                  </div>
                  {notesEditing ? (
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
                    <div className="relative cursor-pointer" onClick={() => { setNotesEditValue(savedNotes); setNotesEditing(true) }}>
                      <div
                        ref={selfNoteRef}
                        className="text-sm font-light text-zinc-500 break-words overflow-y-scroll"
                        style={{ maxHeight: '5.6em', lineHeight: '1.4em', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                      >
                        {savedNotes || <span className="text-zinc-400">Add a note…</span>}
                      </div>
                      {selfNoteOverflows && (
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Contact */}
            {activeTab === 'contact' && (
              <div className="flex flex-col gap-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {(venue.phone || venue.booking_email) ? (
                  <>
                    <p className="text-sm font-light text-zinc-400">For changes to your booking please contact the venue on</p>
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
                  </>
                ) : (
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
