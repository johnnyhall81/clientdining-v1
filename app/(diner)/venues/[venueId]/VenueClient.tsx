'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Venue, Slot, VenueImage } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { formatFullDateTime } from '@/lib/date-utils'
import SlotRow from '@/components/slots/SlotRow'
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

export default function VenueClient({ venue, slots, galleryImages }: VenueClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  const [alerts, setAlerts] = useState<Set<string>>(new Set())
  const [bookingSlot, setBookingSlot] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())
  const [showPartySizeModal, setShowPartySizeModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellingSlot, setCancellingSlot] = useState<{
    slotId: string
    venueName: string
  } | null>(null)
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null)
  const [showCorporateEventsModal, setShowCorporateEventsModal] = useState(false)

  // Load existing alerts
  useEffect(() => {
    if (!user) {
      setAlerts(new Set())
      return
    }

    const loadAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('slot_alerts')
          .select('slot_id')
          .eq('diner_user_id', user.id)
          .eq('status', 'active')

        if (error) throw error

        setAlerts(new Set((data || []).map((a: any) => a.slot_id)))
      } catch (e) {
        console.error('Error loading alerts:', e)
      }
    }

    loadAlerts()
  }, [user])

  // Load profile for reserved-by display
  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('full_name, avatar_url').eq('user_id', user.id).single().then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  // Load my bookings for the slots on this venue page
  useEffect(() => {
    if (!user) {
      setBookedSlots(new Set())
      return
    }
    if (!slots?.length) return

    const loadMyBookings = async () => {
      try {
        const slotIds = slots.map((s) => s.id)

        const { data, error } = await supabase
          .from('bookings')
          .select('slot_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .in('slot_id', slotIds)

        if (error) throw error
        setBookedSlots(new Set((data || []).map((b: any) => b.slot_id)))
      } catch (e) {
        console.error('Error loading bookings:', e)
      }
    }

    loadMyBookings()
  }, [user, slots])

  const handleBook = async (slotId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

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
        body: JSON.stringify({
          slotId: selectedSlot.id,
          partySize,
          notes,
          guestNames,
        }),
      })








      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message = data?.error || 'Could not create booking'
        setBookingError(message)
        setBookingSlot(null)
        return
      }

      setBookingError(null)

      setBookedSlots((prev) => {
        const next = new Set(prev)
        next.add(selectedSlot.id)
        return next
      })

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
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('slot_id', cancellingSlot.slotId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!booking) {
        console.error('Booking not found')
        return
      }

      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        console.error('Cancel failed:', data?.error || 'Failed to cancel booking')
        setShowCancelModal(false)
        return
      }

      setShowCancelModal(false)
      setCancellingSlot(null)

      setBookedSlots((prev) => {
        const next = new Set(prev)
        next.delete(cancellingSlot.slotId)
        return next
      })

      router.refresh()
    } catch (error) {
      console.error('Cancel error:', error)
    }
  }

  const handleToggleAlert = async (slotId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to update alert')
    }

    const newAlerts = new Set(alerts)
    if (data.active) newAlerts.add(slotId)
    else newAlerts.delete(slotId)
    setAlerts(newAlerts)
  }

  return (
    <div className="min-h-screen bg-zinc-50/30">
      {/* Container with max width */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* White card wrapper */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Gallery — swipeable, hero first then venue_images */}
          <VenueGallery
            heroImage={venue.image_hero}
            galleryImages={galleryImages}
            venueName={venue.name}
          />

          {/* Content padding */}
          <div className="p-8 sm:p-10 lg:p-12">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-light text-zinc-900 mb-4 tracking-tight">{venue.name}</h1>

              <div className="flex items-center gap-3 text-zinc-400 font-light text-sm mb-2">
                <span>{venue.area}</span>
                <span>•</span>
                <span className="capitalize">{venue.venue_type}</span>
              </div>


              {venue.address && (
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-zinc-400 font-light">
                      {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address} London`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-zinc-300 hover:text-zinc-600 transition-colors"
                    >
                      <MapIcon />
                    </a>
                  </div>
                )}






            </div>

            {/* Description and specs */}
            {venue.description && (
              <div className="mb-12 max-w-3xl">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => {
                      const isArray = Array.isArray(children)
                      const first = isArray ? children[0] : null
                      const startsWithStrong =
                        first &&
                        typeof first === 'object' &&
                        // @ts-ignore
                        first?.type?.name === 'strong'

                      // Spec lines in 2-column layout
                      if (startsWithStrong) {
                        const parts = isArray ? children : [children]
                        const rawLabel = parts[0]?.props?.children
                        const label = String(rawLabel || '').replace(/:\s*$/, '')
                        const value = parts.slice(1)

                        return (
                          <div className="grid grid-cols-[140px_1fr] gap-4 text-sm leading-relaxed mb-2">
                            <div className="text-zinc-400 font-light">{label}</div>
                            <div className="text-zinc-600 font-light">{value}</div>
                          </div>
                        )
                      }

                      // Summary paragraph
                      return (
                        <p className="text-sm text-zinc-600 font-light leading-relaxed mb-4">
                          {children}
                        </p>
                      )
                    },
                    strong: ({ children }) => (
                      <strong className="font-light text-zinc-600">{children}</strong>
                    ),
                  }}
                >
                  {venue.description}
                </ReactMarkdown>

                {/* Private hire link */}
                {venue.private_hire_available && (
                  <div className="grid grid-cols-[140px_1fr] gap-4 text-sm leading-relaxed mt-3 pt-3 border-t border-zinc-100">
                    <div className="text-zinc-400 font-light">Private rooms and events</div>
                    <button
                      onClick={() => setShowCorporateEventsModal(true)}
                      className="text-zinc-600 font-light text-left hover:text-zinc-900 transition-colors group"
                    >
                      Enquire <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Available Tables */}
            <div className="pt-8 border-t border-zinc-100">
              <h2 className="text-2xl font-light text-zinc-900 mb-8 tracking-wide">Available Tables</h2>

              {slots.length === 0 ? (
                <p className="text-zinc-500 font-light">No tables available at this time.</p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <SlotRow
                      key={slot.id}
                      slot={slot}
                      onBook={handleBook}
                      isAlertActive={alerts.has(slot.id)}
                      onToggleAlert={handleToggleAlert}
                      isBookedByMe={bookedSlots.has(slot.id)}
                      userName={profile?.full_name || null}
                      avatarUrl={profile?.avatar_url || null}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedSlot && (
        <PartySizeModal
          isOpen={showPartySizeModal}
          onClose={() => {
            setShowPartySizeModal(false)
            setSelectedSlot(null)
            setBookingError(null)
            setBookingSlot(null)
          }}
          onConfirm={confirmBooking}
          minSize={selectedSlot.party_min}
          maxSize={selectedSlot.party_max}
          venueName={venue.name}
          venueImage={venue.image_hero}
          slotTime={formatFullDateTime(selectedSlot.start_at)}
          requiresGuestNames={venue.requires_guest_names}
          error={bookingError}
          isSubmitting={!!bookingSlot}
        />
      )}

      {showCancelModal && cancellingSlot && (
        <CancelBookingModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false)
            setCancellingSlot(null)
          }}
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
