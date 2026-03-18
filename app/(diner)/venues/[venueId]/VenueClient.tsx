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
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<'reserve' | 'menu' | 'location'>('reserve')
  const [menuModalUrl, setMenuModalUrl] = useState<string | null>(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    if (!user) { setIsVerified(null); return }
    supabase.from('profiles').select('is_professionally_verified').eq('user_id', user.id).single()
      .then(({ data }) => setIsVerified(data?.is_professionally_verified ?? false))
  }, [user])

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
    if (isVerified === false) return
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

  const taxonomyParts = [
    venue.area,
    venue.venue_type
  ? venue.venue_type === 'club'
    ? "Private Members' Club"
    : 'Restaurant'
  : null,

  ].filter(Boolean)

  // Full-page SevenRooms widget — skip ClientDining editorial entirely
  if ((venue as any).use_sevenrooms_widget && (venue as any).booking_widget_url) {
    return (
      <div style={{ height: 'calc(100vh - 64px)' }}>
        <iframe
          src={(venue as any).booking_widget_url}
          width="100%"
          height="100%"
          style={{ border: 'none', display: 'block' }}
          title={venue.name}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white overflow-hidden" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>

          {/* Hero */}
          <VenueGallery
            heroImage={venue.image_hero}
            galleryImages={galleryImages}
            venueName={venue.name}
            logoUrl={(venue as any).logo_url || undefined}
          />

          {/* Editorial panel — overlaps hero */}
          <div className="relative -mt-10 mx-3 sm:mx-6 bg-white z-10" style={{ borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="px-7 sm:px-9 pt-7 pb-9">

              {/* Category line */}
              {taxonomyParts.length > 0 && (
                <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-4 font-light">
                  {taxonomyParts.join(' · ')}
                </p>
              )}

              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row lg:gap-14">

                {/* Left: name + intro */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-[2rem] sm:text-[2.4rem] font-light text-zinc-900 tracking-tight leading-[1.1] mb-5">
                    {venue.name}
                  </h1>

                  {parsed?.intro && (
                    <p className="text-sm font-light text-zinc-500 leading-[1.8] max-w-md">
                      {parsed.intro}
                    </p>
                  )}
                </div>

                {/* Right: stats */}
                {parsed?.stats && parsed.stats.length > 0 && (
                  <div className="mt-8 lg:mt-1 lg:w-40 flex-shrink-0">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-8 gap-y-5">
                      {parsed.stats.map((stat) => (
                        <div key={stat.label}>
                          <p className="text-[8px] tracking-[0.2em] text-zinc-400 uppercase mb-1 font-light">{stat.label}</p>
                          <p className="text-[13px] font-light text-zinc-700 leading-snug">{stat.value}</p>
                        </div>
                      ))}
                      {venue.private_hire_available && (
                        <div>
                          <p className="text-[8px] tracking-[0.2em] text-zinc-400 uppercase mb-1 font-light">Private dining</p>
                          <p className="text-[13px] font-light text-zinc-700">Available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking section */}
          <div className="px-7 sm:px-9 lg:px-11 py-11" style={{ backgroundColor: '#F8F6F3' }}>
            {user && isVerified === false ? (
              <div>
                <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-3 font-light">Membership pending</p>
                <p className="text-sm font-light text-zinc-500 leading-relaxed max-w-md">
                  Your application is being reviewed. You will be able to book once your membership has been verified.
                </p>
              </div>
            ) : (venue as any).use_sevenrooms_widget && (venue as any).booking_widget_url ? (
              <div>
                <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-7 font-light">Reserve a table</p>
                <div style={{ overflow: 'hidden', borderRadius: '3px', height: '600px' }}>
                  <iframe
                    src={(venue as any).booking_widget_url}
                    width="100%"
                    height="680"
                    style={{ border: 'none', display: 'block', marginTop: '-80px' }}
                    title={`Book at ${venue.name}`}
                  />
                </div>
              </div>
            ) : !hasSlots && !hasPrivateDining ? (
              <p className="text-sm font-light text-zinc-400">No availability at this time.</p>
            ) : (
              <div className="space-y-12">
                {hasSlots && (
                  <div>
                    <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-7 font-light">Reserve a table</p>
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
                  <div className={hasSlots ? 'pt-10' : ''} style={hasSlots ? { borderTop: '1px solid #E8E4DF' } : {}}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                      <div>
                        <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-3 font-light">Private dining</p>
                        <p className="text-sm font-light text-zinc-500 max-w-xs leading-relaxed">
                          Private dining rooms and corporate event hire. Available on request.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCorporateEventsModal(true)}
                        className="self-start sm:self-center flex-shrink-0 h-10 px-7 text-xs font-light tracking-widest uppercase text-zinc-700 hover:text-zinc-900 hover:bg-white transition-colors"
                        style={{ border: '1px solid #C8C4BF', backgroundColor: 'transparent', borderRadius: '3px' }}
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>



{/* Menu Highlights */}
{(venue as any).menu_highlights && (
  <div className="px-7 sm:px-9 lg:px-11 py-7" style={{ borderTop: '1px solid #F0EDE9' }}>
    <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-4 font-light">Menu Highlights</p>
    <div className="flex flex-col gap-3">
      {/* Cuisine + price */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-light text-zinc-700">{(venue as any).menu_highlights.cuisine_style}</span>
        <span className="text-zinc-300 text-xs">·</span>
        <span className="text-sm font-light text-zinc-500">{(venue as any).menu_highlights.price_range}</span>
      </div>
      {/* Sample dishes */}
      {(venue as any).menu_highlights.sample_dishes?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(venue as any).menu_highlights.sample_dishes.map((dish: string, i: number) => (
            <span key={i} className="text-[11px] font-light text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
              {dish}
            </span>
          ))}
        </div>
      )}
      {/* Dietary options */}
      {(venue as any).menu_highlights.dietary_options?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(venue as any).menu_highlights.dietary_options.map((opt: string, i: number) => (
            <span key={i} className="text-[11px] font-light text-zinc-400 border border-zinc-200 px-2.5 py-1 rounded-full">
              {opt}
            </span>
          ))}
        </div>
      )}
      {/* Note */}
      {(venue as any).menu_highlights.note && (
        <p className="text-[11px] font-light text-zinc-400 italic">{(venue as any).menu_highlights.note}</p>
      )}
      {/* External menu links */}
      {(venue as any).menus?.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
          {(venue as any).menus.map((menu: { label: string; url: string }, i: number) => (
            <a
              key={i}
              href={menu.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-light text-zinc-400 hover:text-zinc-700 transition-colors inline-flex items-center gap-1"
            >
              {menu.label}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-2.5 h-2.5 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  </div>
)}












          {/* Location */}
          {venue.address && (
            <div className="px-7 sm:px-9 lg:px-11 py-7" style={{ borderTop: '1px solid #F0EDE9' }}>
              <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-2.5 font-light">Location</p>
              <div className="flex items-start justify-between gap-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address} London`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-light text-zinc-500 hover:text-zinc-800 transition-colors leading-relaxed"
                >
                  {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                </a>
                <div className="flex items-center gap-4 flex-shrink-0 mt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowMap(v => !v)}
                    className="text-[11px] font-light text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    {showMap ? 'Hide map' : 'View map'}
                  </button>
                </div>
              </div>
              {showMap && (
                <div className="mt-5 overflow-hidden w-full" style={{ height: 220, borderRadius: '4px' }}>
                  <iframe title="Venue map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${venue.name}, ${venue.address}${venue.postcode ? ` ${venue.postcode}` : ''}, London`)}&output=embed&z=15`}
                  />
                </div>
              )}
            </div>
          )}

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
