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
  onCancel: (bookingId: string) => void
}

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
  </svg>
)

type Tab = 'booking' | 'guests' | 'notes' | 'contact'

const TABS: { id: Tab; label: string }[] = [
  { id: 'booking', label: 'Booking' },
  { id: 'guests', label: 'Guests' },
  { id: 'notes', label: 'Notes' },
  { id: 'contact', label: 'Contact' },
]

export default function BookingCard({ booking, venue, slot, onCancel }: BookingCardProps) {
  const isPast = new Date(slot.start_at) < new Date()
  const isCancelled = booking.status === 'cancelled'
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('booking')
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
  const additionalGuests = booking.guest_names?.slice(1) || []
  const partySize = booking.party_size || 1

  const rowCls = 'flex flex-col gap-0.5'
  const labelCls = 'text-xs font-light text-zinc-400'
  const valueCls = 'text-sm font-light text-zinc-500'

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
        <div className="flex-1 px-7 py-6 pr-10 flex flex-col gap-4 min-h-[340px]">

          {/* Venue name — always visible */}
          <Link href={`/venues/${venue.id}`} className="hover:opacity-70 transition-opacity inline-block">
            <h3 className="text-lg font-light text-zinc-900">{venue.name}</h3>
          </Link>

          {/* Tab bar */}
          <div className="flex items-center border-b border-zinc-100">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative mr-5 pb-2.5 text-sm font-light transition-colors ${
                  activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-zinc-900" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1">

            {/* Booking */}
            {activeTab === 'booking' && (
              <div className="flex flex-col gap-3">
                <div className={rowCls}>
                  <span className={labelCls}>Venue</span>
                  <span className={valueCls}>{venue.name}</span>
                </div>
                <div className={rowCls}>
                  <span className={labelCls}>Date</span>
                  <span className={valueCls}>{dateStr}</span>
                </div>
                <div className={rowCls}>
                  <span className={labelCls}>Time</span>
                  <div className="flex items-center gap-1.5">
                    <span className={valueCls}>{timeStr}</span>
                    {!isPast && !isCancelled && (
                      <a href={calendarUrl} target="_blank" rel="noopener noreferrer" title="Add to calendar" className="text-zinc-400 hover:text-zinc-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                <div className={rowCls}>
                  <span className={labelCls}>Guests</span>
                  <span className={valueCls}>{partySize} {partySize === 1 ? 'guest' : 'guests'}</span>
                </div>
              </div>
            )}

            {/* Guests */}
            {activeTab === 'guests' && (
              <div className="flex flex-col gap-2">
                {booking.guest_names && booking.guest_names.length > 0 ? (
                  booking.guest_names.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`${valueCls} flex-1`}>{name}</span>
                      {i === 0 && <span className="text-xs font-light text-zinc-400">Host</span>}
                    </div>
                  ))
                ) : (
                  <span className="text-sm font-light text-zinc-400">No guest names provided</span>
                )}
              </div>
            )}

            {/* Notes */}
            {activeTab === 'notes' && (
              <div className="flex flex-col gap-5">

                {/* Note to venue */}
                <div>
                  <p className={`${labelCls} mb-1.5`}>Note to venue</p>
                  <div className="relative">
                    <div
                      ref={venueNoteRef}
                      className={`${valueCls} break-all overflow-y-scroll`}
                      style={{ maxHeight: '7em', lineHeight: '1.4em', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                    >
                      {booking.notes || <span className="text-zinc-400">No note sent with this booking</span>}
                    </div>
                    {venueNoteOverflows && (
                      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Note to self */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <p className={labelCls}>Note to self</p>
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
                        rows={4}
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
                      className="relative cursor-pointer"
                      onClick={() => { setNotesEditValue(savedNotes); setNotesEditing(true) }}
                    >
                      <div
                        ref={selfNoteRef}
                        className={`${valueCls} break-all overflow-y-scroll`}
                        style={{ maxHeight: '7em', lineHeight: '1.4em', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
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
              <div className="flex flex-col gap-3">
                {venue.address && (
                  <div className={rowCls}>
                    <span className={labelCls}>Address</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, ${venue.postcode || ''} London`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${valueCls} hover:text-zinc-900 transition-colors w-fit`}
                    >
                      {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                    </a>
                  </div>
                )}
                {venue.phone && (
                  <div className={rowCls}>
                    <span className={labelCls}>Telephone</span>
                    <a href={`tel:${venue.phone}`} className={`${valueCls} hover:text-zinc-900 transition-colors w-fit`}>{venue.phone}</a>
                  </div>
                )}
                {venue.booking_email && (
                  <div className={rowCls}>
                    <span className={labelCls}>Email</span>
                    <a href={`mailto:${venue.booking_email}`} className={`${valueCls} hover:text-zinc-900 transition-colors w-fit`}>{venue.booking_email}</a>
                  </div>
                )}
                {!venue.phone && !venue.booking_email && !venue.address && (
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
