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
  slot: Slot | null
  bookerName?: string
  onCancel: (bookingId: string) => void
}

type Tab = 'guests' | 'contact' | 'venuenote' | 'mynotes'

export default function BookingCard({ booking, venue, slot, bookerName, onCancel }: BookingCardProps) {
  // For SevenRooms bookings, slot is null — use booked_at or created_at as fallback
  const isSevenRooms = (booking as any).booking_source === 'sevenrooms'
  const isOpenTable = (booking as any).booking_source === 'opentable'
  const isCancelled = booking.status === 'cancelled'
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('guests')
  const [notesEditValue, setNotesEditValue] = useState(booking.private_notes || '')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesEditing, setNotesEditing] = useState(false)
  const [dateEditing, setDateEditing] = useState(false)
  const [dateValue, setDateValue] = useState('')
  const [dateSaving, setDateSaving] = useState(false)
  const [localBookedAt, setLocalBookedAt] = useState<string | null>((booking as any).booked_at || null)
  const [sizeEditing, setSizeEditing] = useState(false)
  const [sizeValue, setSizeValue] = useState('')
  const [sizeSaving, setSizeSaving] = useState(false)
  const [localPartySize, setLocalPartySize] = useState<number | null>(booking.party_size || null)

  const bookingDate = slot?.start_at || localBookedAt || null
  const isPast = bookingDate ? new Date(bookingDate) < new Date() : false

  useEffect(() => {
    setNotesEditValue(booking.private_notes || '')
  }, [booking.private_notes])

  const handleSaveNotes = async () => {
    setNotesSaving(true)
    try {
      await fetch(`/api/bookings/${booking.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ private_notes: notesEditValue }),
      })
      setNotesEditing(false)
    } catch {
      // fail silently
    } finally {
      setNotesSaving(false)
    }
  }

  const handleSaveDate = async () => {
    if (!dateValue) return
    setDateSaving(true)
    try {
      await fetch(`/api/bookings/${booking.id}/date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booked_at: new Date(dateValue).toISOString() }),
      })
      setLocalBookedAt(new Date(dateValue).toISOString())
      setDateEditing(false)
    } catch {
      // fail silently
    } finally {
      setDateSaving(false)
    }
  }

  const handleSaveSize = async () => {
    const size = parseInt(sizeValue)
    if (!size || size < 1) return
    setSizeSaving(true)
    try {
      await fetch(`/api/bookings/${booking.id}/date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ party_size: size }),
      })
      setLocalPartySize(size)
      setSizeEditing(false)
    } catch {
      // fail silently
    } finally {
      setSizeSaving(false)
    }
  }

  const calendarUrl = (() => {
    if (!slot) return null
    const start = new Date(slot.start_at)
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    const fmt = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
    const details = encodeURIComponent(`Business dinner at ${venue.name}${venue.address ? `\n${venue.address}${venue.postcode ? `, ${venue.postcode}` : ''}` : ''}`)
    const location = encodeURIComponent(`${venue.name}${venue.address ? `, ${venue.address}` : ''}`)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Dinner — ${venue.name}`)}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`
  })()

  const dateStr = bookingDate ? (slot ? formatSlotDate(slot.start_at) : formatSlotDate(bookingDate)) : null
  const timeStr = slot ? formatSlotTime(slot.start_at) : null
  const guestNames = booking.guest_names || []
  const partySize = localPartySize
  const hostDisplayName = guestNames[0] || bookerName
  const namedGuests = guestNames.length > 0 ? guestNames : null
  const remainder = namedGuests && partySize ? partySize - guestNames.length : partySize ? partySize - 1 : 0

  const tabLabel = (tab: Tab) => tab === 'guests' ? 'Guests' : tab === 'contact' ? 'Contact' : tab === 'venuenote' ? 'Sent to venue' : 'My notes'

  return (
    <div className="bg-white overflow-hidden relative" style={{ borderRadius: '6px', border: '1px solid #F0EDE9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

      {/* Cancel × — hidden for SevenRooms bookings, contact venue directly */}
      {!isCancelled && !isPast && !isSevenRooms && !isOpenTable && (
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-zinc-600 transition-colors"
          aria-label="Cancel booking"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex flex-col md:flex-row md:items-stretch">

        {/* Image */}
        <Link href={`/venues/${venue.id}`} prefetch={true} className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto bg-zinc-100 overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity">
          {venue.image_hero ? (
            <Image src={venue.image_hero} alt={venue.name} fill sizes="(max-width: 768px) 100vw, 40vw" quality={60} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}
        </Link>

        {/* Details */}
        <div className="flex-1 p-7 pr-10 flex flex-col gap-5 md:h-[320px]">

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href={`/venues/${venue.id}`} prefetch={true}>
                <h3 className="text-lg font-light text-zinc-900 hover:opacity-60 transition-opacity tracking-tight">{venue.name}</h3>
              </Link>
              {isSevenRooms && (
                <span className="text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-light px-1.5 py-0.5" style={{ border: '1px solid #E4E0DB', borderRadius: '2px' }}>
                  Logged
                </span>
              )}
            </div>
            {venue.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, ${venue.postcode || ''} London`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-light text-zinc-400 hover:text-zinc-700 transition-colors block"
              >
                {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
              </a>
            )}
            {isSevenRooms && (
              <p className="text-xs font-light text-zinc-400 leading-relaxed" style={{ maxWidth: '380px' }}>
                Booked directly with the venue — edits below are your personal record only.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-0.5">

              {/* Date — editable for SevenRooms bookings */}
              {isSevenRooms ? (
                dateEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateValue}
                      onChange={e => setDateValue(e.target.value)}
                      autoFocus
                      className="text-sm font-light text-zinc-600 border-b border-zinc-300 focus:border-zinc-700 bg-transparent focus:outline-none transition-colors"
                    />
                    <button onClick={handleSaveDate} disabled={dateSaving || !dateValue}
                      className="text-xs font-light text-white px-3 py-1 disabled:opacity-50"
                      style={{ backgroundColor: '#18181B', borderRadius: '3px' }}>
                      {dateSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => { setDateEditing(false); setDateValue('') }}
                      className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setDateEditing(true); setDateValue('') }}
                    className="text-sm font-light text-zinc-500 hover:text-zinc-700 transition-colors">
                    {dateStr ?? <span className="text-zinc-300 italic">Add date</span>}
                    {dateStr && <span className="ml-1 text-zinc-300 text-xs">✎</span>}
                  </button>
                )
              ) : (
                <span className="text-sm font-light text-zinc-500">
                  {dateStr}{timeStr ? ` · ${timeStr}` : ''}
                </span>
              )}

              {/* Party size — editable for SevenRooms bookings */}
              {isSevenRooms && (
                sizeEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={sizeValue}
                      onChange={e => setSizeValue(e.target.value)}
                      autoFocus
                      placeholder="Guests"
                      className="w-20 text-sm font-light text-zinc-600 border-b border-zinc-300 focus:border-zinc-700 bg-transparent focus:outline-none transition-colors"
                    />
                    <button onClick={handleSaveSize} disabled={sizeSaving || !sizeValue}
                      className="text-xs font-light text-white px-3 py-1 disabled:opacity-50"
                      style={{ backgroundColor: '#18181B', borderRadius: '3px' }}>
                      {sizeSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => { setSizeEditing(false); setSizeValue('') }}
                      className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setSizeEditing(true); setSizeValue(partySize?.toString() ?? '') }}
                    className="text-sm font-light text-zinc-500 hover:text-zinc-700 transition-colors">
                    {partySize ? `· Party of ${partySize}` : <span className="text-zinc-300 italic">· Add guests</span>}
                    {partySize && <span className="ml-1 text-zinc-300 text-xs">✎</span>}
                  </button>
                )
              )}

              {!isSevenRooms && partySize && (
                <span className="text-sm font-light text-zinc-500">· Party of {partySize}</span>
              )}
              {!isPast && !isCancelled && calendarUrl && (
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" title="Add to calendar" className="text-zinc-300 hover:text-zinc-500 transition-colors flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col gap-4 flex-1 min-h-0 md:overflow-hidden">
            <div className="flex items-center overflow-x-auto flex-shrink-0" style={{ borderBottom: '1px solid #F0EDE9', scrollbarWidth: 'none' }}>
              {(['guests', 'venuenote', 'contact', 'mynotes'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative mr-5 pb-2.5 text-xs font-light whitespace-nowrap transition-colors tracking-wide ${
                    activeTab === tab ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {tabLabel(tab)}
                  {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-px bg-zinc-900" />}
                </button>
              ))}
            </div>

            {/* Guests */}
            {activeTab === 'guests' && (
              <div className="flex flex-wrap gap-2 flex-1 min-h-0 overflow-y-auto content-start" style={{ scrollbarWidth: 'none' }}>
                {namedGuests ? (
                  <>
                    {namedGuests.map((name, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-light text-zinc-600" style={{ border: '1px solid #E8E4DF', borderRadius: '3px' }}>
                        {name}
                        {i === 0 && <span className="text-[9px] tracking-[0.15em] text-zinc-400 uppercase">Host</span>}
                      </span>
                    ))}
                    {remainder > 0 && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-light text-zinc-400" style={{ border: '1px solid #E8E4DF', borderRadius: '3px' }}>
                        +{remainder}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-light text-zinc-600" style={{ border: '1px solid #E8E4DF', borderRadius: '3px' }}>
                      {hostDisplayName}
                      <span className="text-[9px] tracking-[0.15em] text-zinc-400 uppercase">Host</span>
                    </span>
                    {remainder > 0 && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-light text-zinc-400" style={{ border: '1px solid #E8E4DF', borderRadius: '3px' }}>
                        +{remainder}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Sent to venue */}
            {activeTab === 'venuenote' && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <p className="text-sm font-light text-zinc-500 whitespace-pre-wrap [overflow-wrap:anywhere] leading-relaxed">
                  {booking.notes || (
                    <span className="text-zinc-400">No note was sent with this booking. For dietary requirements or special requests, please contact the venue directly.</span>
                  )}
                </p>
              </div>
            )}

            {/* My notes */}
            {activeTab === 'mynotes' && (
              <div className="flex flex-col flex-1 min-h-0">
                {notesEditing ? (
                  <>
                    <textarea
                      value={notesEditValue}
                      onChange={e => setNotesEditValue(e.target.value)}
                      placeholder="Add a private note…"
                      autoFocus
                      className="w-full text-sm font-light text-zinc-600 placeholder:text-zinc-300 border-b border-zinc-200 pb-2 bg-transparent focus:outline-none focus:border-zinc-500 resize-none transition-colors min-h-[80px] flex-1"
                    />
                    <div className="flex justify-end gap-4 pt-3 flex-shrink-0">
                      <button type="button" onClick={() => { setNotesEditValue(booking.private_notes || ''); setNotesEditing(false) }}
                        className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                        Cancel
                      </button>
                      <button type="button" onClick={handleSaveNotes} disabled={notesSaving}
                        className="text-xs font-light text-white px-4 py-1.5 transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#18181B', borderRadius: '3px' }}>
                        {notesSaving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="overflow-y-auto flex-1">
                      <p className="text-sm font-light text-zinc-500 whitespace-pre-wrap [overflow-wrap:anywhere] leading-relaxed">
                        {notesEditValue || <span className="text-zinc-300">Add a private note — only visible to you</span>}
                      </p>
                    </div>
                    <div className="flex justify-end pt-3 flex-shrink-0">
                      <button type="button" onClick={() => setNotesEditing(true)}
                        className="text-xs font-light text-zinc-500 hover:text-zinc-900 transition-colors px-4 py-1.5"
                        style={{ border: '1px solid #E8E4DF', borderRadius: '3px' }}>
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Contact */}
            {activeTab === 'contact' && (
              <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {(venue.phone || venue.booking_email) ? (
                  <>
                    {venue.phone && (
                      <a href={`tel:${venue.phone}`} className="text-sm font-light text-zinc-500 hover:text-zinc-900 transition-colors w-fit">
                        {venue.phone}
                      </a>
                    )}
                    {venue.booking_email && (
                      <a href={`mailto:${venue.booking_email}`} className="text-sm font-light text-zinc-500 hover:text-zinc-900 transition-colors w-fit">
                        {venue.booking_email}
                      </a>
                    )}
                    <p className="text-sm font-light text-zinc-400 pt-1">For changes to your booking please contact the venue directly.</p>
                  </>
                ) : (
                  <p className="text-sm font-light text-zinc-400">No contact details on file.</p>
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
