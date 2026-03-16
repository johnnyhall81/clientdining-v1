'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Venue, Slot, VenueImage } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { formatFullDateTime } from '@/lib/date-utils'
import SlotPicker from '@/components/slots/SlotPicker'
import PartySizeModal from '@/components/modals/PartySizeModal'
import CancelBookingModal from '@/components/modals/CancelBookingModal'
import CorporateEventsModal from '@/components/modals/CorporateEventsModal'
import VenueGallery from '@/components/venues/VenueGallery'

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

interface VenueClientProps {
  venue: Venue
  slots: Slot[]
  galleryImages: VenueImage[]
}

// Parse description markdown into intro paragraph + stat blocks
function parseDescription(description: string): {
  intro: string
  stats: { label: string; value: string }[]
} {
  const lines = description.split('\n').filter(Boolean)
  const introParts: string[] = []
  const stats: { label: string; value: string }[] = []

  for (const line of lines) {
    const statMatch = line.match(/^\*\*([^*]+)\*\*[:\s]+(.+)$/)
    if (statMatch) {
      stats.push({ label: statMatch[1].replace(/:$/, '').trim(), value: statMatch[2].trim() })
    } else if (!line.startsWith('**')) {
      introParts.push(line)
    }
  }

  return { intro: introParts.join(' ').trim(), stats }
}

export default function VenueClient({ venue, slots, galleryImages }: VenueClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  const [alerts, setAlerts] = useState<Set<string>>(new Set())
  const [bookingSlot, setBookingSlot] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())
  const [showMap, setShowMap] = useState(false)
  const [bookedPartySizes, setBookedPartySizes] = useState<Map<string, number>>(new Map())
  const [showPartySizeModal, setShowPartySizeModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellingSlot, setCancellingSlot] = useState<{ slotId: string; venueName: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null)
  const [showCorporateEventsModal, setShowCorporateEventsModal] = useState(false)

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    if (!user) { setAlerts(new Set()); return }
    supabase.from('slot_alerts').select('slot_id').eq('diner_user_id', user.id).eq('status', 'active')
      .then(({ data }) => { if (data) setAlerts(new Set(data.map((a: any) => a.slot_id))) })
  }, [user])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('full_name, avatar_url').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  useEffect(() => {
    if (!user) { setBookedSlots(new Set()); return }
    if (!slots?.length) return
    const slotIds = slots.map((s) => s.id)
    supabase.from('bookings').select('slot_id, party_size').eq('user_id', user.id).eq('status', 'active').in('slot_id', slotIds)
      .then(({ data }) => {
        if (data) {
          setBookedSlots(new Set(data.map((b: any) => b.slot_id)))
          setBookedPartySizes(new Map(data.map((b: any) => [b.slot_id, b.party_size])))
        }
      })
  }, [user, slots])

  const handleBook = (slotId: string) => {
    if (!user) { router.push('/login'); return }
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return
    setSelectedSlot(slot)
    setShowPartySizeModal(true)
  }

  const confirmBooking = async (partySize: number, notes?: string, guestNames?: string[]) => {
    if (!selectedSlot) return
    setShowPartySizeModal(false)
    setBookingSlot(selectedSlot.id)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot.id, partySize, notes, guestNames }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) { setBookingError(data?.error || 'Could not create booking'); setBookingSlot(null); return }
      setBookingError(null)
      setBookedSlots((prev) => { const next = new Set(prev); next.add(selectedSlot.id); return next })
      router.push('/bookings')
      router.refresh()
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setBookingSlot(null)
      setSelectedSlot(null)
    }
  }

  const openCancelModal = (slotId: string) => {
    setCancellingSlot({ slotId, venueName: venue.name })
    setShowCancelModal(true)
  }

  const handleCancel = async () => {
    if (!user || !cancellingSlot) return
    try {
      const { data: booking } = await supabase.from('bookings').select('id').eq('slot_id', cancellingSlot.slotId).eq('user_id', user.id).eq('status', 'active').single()
      if (!booking) return
      const response = await fetch('/api/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.id }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) { setShowCancelModal(false); return }
      setShowCancelModal(false)
      setCancellingSlot(null)
      setBookedSlots((prev) => { const next = new Set(prev); next.delete(cancellingSlot.slotId); return next })
      router.refresh()
    } catch (error) { console.error('Cancel error:', error) }
  }

  const handleToggleAlert = async (slotId: string) => {
    if (!user) { router.push('/login'); return }
    const response = await fetch('/api/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slotId }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.error || 'Failed to update alert')
    const newAlerts = new Set(alerts)
    if (data.active) newAlerts.add(slotId)
    else newAlerts.delete(slotId)
    setAlerts(newAlerts)
  }

  const parsed = venue.description ? parseDescription(venue.description) : null
  const hasSlots = slots && slots.length > 0
  const hasPrivateDining = venue.private_hire_available

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Gallery */}
          <VenueGallery
            heroImage={venue.image_hero}
            galleryImages={galleryImages}
            venueName={venue.name}
            logoUrl={(venue as any).logo_url || undefined}
          />

          {/* Editorial header */}
          <div className="px-8 sm:px-10 lg:px-12 pt-10 pb-8 border-b border-zinc-100">

            {/* Venue name */}
            <h1 className="text-4xl sm:text-5xl font-light text-zinc-900 tracking-tight mb-3">{venue.name}</h1>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {venue.area && (
                <span className="text-xs font-light text-zinc-500 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50">
                  {venue.area}
                </span>
              )}
              {venue.venue_type && (
                <span className="text-xs font-light text-zinc-500 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 capitalize">
                  {venue.venue_type}
                </span>
              )}
              {venue.private_hire_available && (
                <button
                  onClick={() => setShowCorporateEventsModal(true)}
                  className="text-xs font-light text-zinc-500 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors"
                >
                  Private hire & events
                </button>
              )}
            </div>

            {/* Address */}
            {venue.address && (
              <div className="flex items-center gap-2 mb-6">
                <p className="text-sm font-light text-zinc-400">
                  {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address} London`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-zinc-400 hover:text-zinc-500 transition-colors"
                >
                  <MapIcon />
                </a>
                <button
                  type="button"
                  onClick={() => setShowMap(v => !v)}
                  className="text-xs font-light text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showMap ? 'Hide map' : 'Show map'}
                </button>
              </div>
            )}

            {showMap && venue.address && (
              <div className="rounded-xl overflow-hidden border border-zinc-100 w-full mb-6" style={{ height: 240 }}>
                <iframe title="Venue map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${venue.name}, ${venue.address}${venue.postcode ? ` ${venue.postcode}` : ''}, London`)}&output=embed&z=15`}
                />
              </div>
            )}

            {/* Intro — editorial deck style */}
            {parsed?.intro && (
              <p className="text-base font-light text-zinc-700 leading-relaxed max-w-2xl mb-8">
                {parsed.intro}
              </p>
            )}

            {/* Stat row */}
            {parsed?.stats && parsed.stats.length > 0 && (
              <div className="flex flex-wrap gap-8">
                {parsed.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-[10px] font-light text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-sm font-light text-zinc-700">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking section — distinct container */}
          <div className="bg-zinc-50/60 px-8 sm:px-10 lg:px-12 py-10">
            {!hasSlots && !hasPrivateDining ? (
              <p className="text-sm font-light text-zinc-400">No availability at this time.</p>
            ) : (
              <div className="space-y-10">
                {hasSlots && (
                  <div>
                    <h2 className="text-lg font-light text-zinc-900 tracking-tight mb-6">Book a table</h2>
                    <SlotPicker
                      slots={slots}
                      onBook={handleBook}
                      isAlertActive={(id) => alerts.has(id)}
                      onToggleAlert={handleToggleAlert}
                      bookedSlots={bookedSlots}
                      bookedPartySizes={bookedPartySizes}
                    />
                  </div>
                )}

                {hasPrivateDining && (
                  <div className={hasSlots ? 'border-t border-zinc-200 pt-8' : ''}>
                    <h2 className="text-lg font-light text-zinc-900 tracking-tight mb-1">Private dining</h2>
                    <p className="text-sm font-light text-zinc-400 mb-5">
                      {hasSlots ? 'For hosted dinners and private rooms. Available on request.' : 'This venue is available for private dining and hosted occasions.'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => setShowCorporateEventsModal(true)}
                        className="flex flex-col items-center justify-center h-16 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-all text-center px-2"
                      >
                        <span className="text-base font-light text-zinc-900">Private dining</span>
                        <span className="text-[11px] font-light text-zinc-500 mt-0.5">Enquire</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {selectedSlot && (
        <PartySizeModal
          isOpen={showPartySizeModal}
          onClose={() => { setShowPartySizeModal(false); setSelectedSlot(null); setBookingError(null); setBookingSlot(null) }}
          onConfirm={confirmBooking}
          minSize={selectedSlot.party_min}
          maxSize={selectedSlot.party_max}
          venueName={venue.name}
          venueLocation={venue.area}
          slotTime={formatFullDateTime(selectedSlot.start_at)}
          hostName={profile?.full_name || undefined}
          requiresGuestNames={venue.requires_guest_names}
          error={bookingError}
          isSubmitting={!!bookingSlot}
        />
      )}

      {showCancelModal && cancellingSlot && (
        <CancelBookingModal
          isOpen={showCancelModal}
          onClose={() => { setShowCancelModal(false); setCancellingSlot(null) }}
          onConfirm={handleCancel}
          venueName={cancellingSlot.venueName}
        />
      )}

      <CorporateEventsModal
        isOpen={showCorporateEventsModal}
        onClose={() => setShowCorporateEventsModal(false)}
        venueName={venue.name}
        venueId={venue.id}
      />
    </div>
  )
}
