'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Venue, Slot, VenueImage } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { formatFullDateTime } from '@/lib/date-utils'
import SlotPicker from '@/components/slots/SlotPicker'
import PartySizeModal from '@/components/modals/PartySizeModal'
import CancelBookingModal from '@/components/modals/CancelBookingModal'
import CorporateEventsModal from '@/components/modals/CorporateEventsModal'
import VenueGallery from '@/components/venues/VenueGallery'

interface VenueClientProps {
  venue: Venue
  slots: Slot[]
  galleryImages: VenueImage[]
}

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
    } else {
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
  const [bookedPartySizes, setBookedPartySizes] = useState<Map<string, number>>(new Map())
  const [showPartySizeModal, setShowPartySizeModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellingSlot, setCancellingSlot] = useState<{ slotId: string; venueName: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null)
  const [showCorporateEventsModal, setShowCorporateEventsModal] = useState(false)
  const [showMap, setShowMap] = useState(false)

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

  const handleCancel = async () => {
    if (!user || !cancellingSlot) return
    try {
      const { data: booking } = await supabase.from('bookings').select('id').eq('slot_id', cancellingSlot.slotId).eq('user_id', user.id).eq('status', 'active').single()
      if (!booking) return
      const response = await fetch('/api/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.id }) })
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

  // Build taxonomy string
  const taxonomy = [
    venue.area,
    venue.venue_type ? venue.venue_type.charAt(0).toUpperCase() + venue.venue_type.slice(1) : null,
    venue.private_hire_available ? 'Private hire & events' : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Hero — taller, cinematic */}
          <div className="relative">
            <VenueGallery
              heroImage={venue.image_hero}
              galleryImages={galleryImages}
              venueName={venue.name}
              logoUrl={(venue as any).logo_url || undefined}
            />
          </div>

          {/* Editorial panel — overlaps hero via negative margin */}
          <div className="relative -mt-12 mx-4 sm:mx-8 bg-white rounded-2xl shadow-sm px-8 sm:px-10 py-8 mb-0 z-10">

            {/* Taxonomy line */}
            {taxonomy && (
              <p className="text-[11px] tracking-[0.15em] text-zinc-400 uppercase mb-3 font-light">
                {taxonomy}
              </p>
            )}

            {/* Two-column: left = name + address + intro, right = stats */}
            <div className="flex flex-col lg:flex-row lg:gap-16">

              {/* Left */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-light text-zinc-900 tracking-tight mb-3">
                  {venue.name}
                </h1>

                {venue.address && (
                  <div className="flex items-center gap-2 mb-5">
                    <p className="text-sm font-light text-zinc-400">
                      {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address} London`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-300 hover:text-zinc-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowMap(v => !v)}
                      className="text-[11px] font-light text-zinc-300 hover:text-zinc-500 transition-colors"
                    >
                      {showMap ? 'Hide map' : 'Map'}
                    </button>
                  </div>
                )}

                {parsed?.intro && (
                  <p className="text-[15px] font-light text-zinc-600 leading-relaxed max-w-xl">
                    {parsed.intro}
                  </p>
                )}
              </div>

              {/* Right — stats */}
              {parsed?.stats && parsed.stats.length > 0 && (
                <div className="mt-8 lg:mt-0 lg:w-48 flex-shrink-0 flex flex-col gap-5 lg:pt-1">
                  {parsed.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[10px] tracking-[0.12em] text-zinc-400 uppercase mb-1 font-light">{stat.label}</p>
                      <p className="text-sm font-light text-zinc-700">{stat.value}</p>
                    </div>
                  ))}
                  {venue.private_hire_available && (
                    <button
                      onClick={() => setShowCorporateEventsModal(true)}
                      className="text-[11px] font-light text-zinc-400 hover:text-zinc-700 transition-colors text-left mt-1 underline underline-offset-4 decoration-zinc-200"
                    >
                      Private hire available
                    </button>
                  )}
                </div>
              )}
            </div>

            {showMap && venue.address && (
              <div className="rounded-xl overflow-hidden border border-zinc-100 w-full mt-6" style={{ height: 220 }}>
                <iframe title="Venue map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${venue.name}, ${venue.address}${venue.postcode ? ` ${venue.postcode}` : ''}, London`)}&output=embed&z=15`}
                />
              </div>
            )}
          </div>

          {/* Booking section */}
          <div className="px-8 sm:px-10 lg:px-12 py-10">
            {!hasSlots && !hasPrivateDining ? (
              <p className="text-sm font-light text-zinc-400">No availability at this time.</p>
            ) : (
              <div className="space-y-10">
                {hasSlots && (
                  <div>
                    <p className="text-[11px] tracking-[0.15em] text-zinc-400 uppercase mb-6 font-light">Available tables</p>
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
                  <div className={hasSlots ? 'border-t border-zinc-100 pt-8' : ''}>
                    <p className="text-[11px] tracking-[0.15em] text-zinc-400 uppercase mb-2 font-light">Private dining</p>
                    <p className="text-sm font-light text-zinc-400 mb-5">
                      {hasSlots ? 'For hosted dinners and private rooms. Available on request.' : 'This venue is available for private dining and hosted occasions.'}
                    </p>
                    <button
                      onClick={() => setShowCorporateEventsModal(true)}
                      className="h-11 px-6 text-sm font-light border border-zinc-200 rounded-xl bg-white hover:bg-zinc-50 transition-colors text-zinc-900"
                    >
                      Enquire about private dining
                    </button>
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
