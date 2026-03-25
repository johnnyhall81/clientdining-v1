'use client'


import CancelBookingModal from '@/components/modals/CancelBookingModal'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { formatSlotDate, formatSlotTime, formatFullDateTime } from '@/lib/date-utils'
import Link from 'next/link'
import PartySizeModal from '@/components/modals/PartySizeModal'
import SearchBar, { SearchFilters } from '@/components/search/SearchBar'

interface SearchResult {
  slot: {
    id: string
    start_at: string
    party_min: number
    party_max: number
    slot_tier: 'free' | 'premium'
    status: string
  }
  venue: {
    id: string
    name: string
    area: string
    venue_type: string
    address?: string
    postcode?: string
    image_hero: string | null
    requires_guest_names?: boolean
  }
}

interface Venue {
  id: string
  name: string
  area?: string
  address?: string
  postcode?: string
  image_hero?: string
}

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
)

export default function SearchPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState<Set<string>>(new Set())
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())
  const [bookingIdsBySlot, setBookingIdsBySlot] = useState<Map<string, string>>(new Map())
  const [bookedPartySizes, setBookedPartySizes] = useState<Map<string, number>>(new Map())
  const [venues, setVenues] = useState<Venue[]>([])

  const [showPartySizeModal, setShowPartySizeModal] = useState(false)

const [showCancelModal, setShowCancelModal] = useState(false)
const [cancellingSlot, setCancellingSlot] = useState<{
  slotId: string
  venueName: string
} | null>(null)

  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const pathname = usePathname()

  const handleSignIn = async () => {
    const base =
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://clientdining.com'
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: `${base}${pathname}` },
    })
  }


  const [filters, setFilters] = useState<SearchFilters>({
    dateFrom: '',
    dateTo: '',
    area: '',
    partySize: 2,
    venueId: '',
  })

  // Load venues for dropdown
  useEffect(() => {
    const loadVenues = async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (!error && data) {
        setVenues(data)
      }
    }
    loadVenues()
  }, [])

  // Load profile for reserved-by display
  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('full_name, avatar_url').eq('user_id', user.id).single().then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  useEffect(() => {
    handleSearch()
    if (user) {
      loadAlerts()
    } else {
      setAlerts(new Set())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo, filters.area, filters.partySize, filters.venueId, user])

  useEffect(() => {
    if (!user) {
      setBookedSlots(new Set())
      return
    }
    if (!results.length) return

    const loadMyBookings = async () => {
      try {
        const slotIds = results.map((r) => r.slot.id)

        const { data, error } = await supabase
          .from('bookings')
          .select('id, slot_id, party_size')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .in('slot_id', slotIds)

        if (error) throw error

        setBookedSlots(new Set((data || []).map((b: any) => b.slot_id)))
        setBookingIdsBySlot(new Map((data || []).map((b: any) => [b.slot_id, b.id])))
        setBookedPartySizes(new Map((data || []).map((b: any) => [b.slot_id, b.party_size])))
      } catch (e) {
        console.error('Error loading bookings:', e)
      }
    }

    loadMyBookings()
  }, [user, results])

 
  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()

      if (data.alerts) {
        const activeAlertSlotIds = data.alerts
          .filter((a: any) => a.status === 'active' || a.status === 'notified')
          .map((a: any) => a.slot_id)
        setAlerts(new Set(activeAlertSlotIds))
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }









const openCancelModal = (slotId: string, venueName: string) => {
  setCancellingSlot({ slotId, venueName })
  setShowCancelModal(true)
}


const handleCancel = async () => {
  if (!user || !cancellingSlot) return

  const bookingId = bookingIdsBySlot.get(cancellingSlot.slotId)
  if (!bookingId) {
    setBookingError('Booking not found')
    return
  }

  try {
    const response = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message = data?.error || 'Could not cancel booking'
      setBookingError(message)
      setShowCancelModal(false)
      return
    }
    
    setBookingError(null)
    setShowCancelModal(false)
    setCancellingSlot(null)

    // Remove from booked slots and restore slot status in results
    setBookedSlots((prev) => {
      const next = new Set(prev)
      next.delete(cancellingSlot.slotId)
      return next
    })
    setBookingIdsBySlot((prev) => {
      const next = new Map(prev)
      next.delete(cancellingSlot.slotId)
      return next
    })
    setResults((prev) =>
      prev.map((r) =>
        r.slot.id === cancellingSlot.slotId
          ? { ...r, slot: { ...r.slot, status: 'available' } }
          : r
      )
    )
  } catch (e) {
    console.error('Cancel error:', e)
    setBookingError('An error occurred while canceling')
  }
}

  const handleSearch = async () => {
    setLoading(true)

    let query = supabase
      .from('slots')
      .select(
        `
        id,
        start_at,
        party_min,
        party_max,
        slot_tier,
        status,
        venue_id,
        venues!inner (
          id,
          name,
          area,
          address,
          postcode,
          venue_type,
          image_hero,
          requires_guest_names
        )
      `
      )
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(200)

    if (filters.dateFrom) {
      const startOfDay = new Date(filters.dateFrom)
      startOfDay.setHours(0, 0, 0, 0)
      const endDate = filters.dateTo || filters.dateFrom
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      query = query.gte('start_at', startOfDay.toISOString()).lte('start_at', endOfDay.toISOString())
    }

    if (filters.area) {
      query = query.eq('venues.area', filters.area)
    }

    if (filters.partySize) {
      query = query.lte('party_min', filters.partySize).gte('party_max', filters.partySize)
    }


    if (filters.venueId) {
      query = query.eq('venue_id', filters.venueId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Search error:', error)
      setResults([])
    } else {
      const mappedResults = (data || []).map((row: any) => ({
        slot: {
          id: row.id,
          start_at: row.start_at,
          party_min: row.party_min,
          party_max: row.party_max,
          slot_tier: row.slot_tier,
          status: row.status,
        },
        venue: row.venues,
      }))
      setResults(mappedResults)
    }

    setLoading(false)
  }

  const handleBook = async (slotId: string) => {
    if (!user) { setShowSignInModal(true); return }
  
    const result = results.find(r => r.slot.id === slotId)
    if (!result) return
  
    setBookingSlotId(slotId)
    setSelectedSlot({
      ...result.slot,
      venue: result.venue
    })
    setShowPartySizeModal(true)
  }

  
  const confirmBooking = async (partySize: number, notes?: string, guestNames?: string[]) => {
    if (!selectedSlot) return
  
    setIsConfirming(true)
    setBookingError(null)
  
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
        setIsConfirming(false)
        setBookingSlotId(null)
        return
      }

      setShowPartySizeModal(false)
      setBookingError(null)
      setSelectedSlot(null)

      setBookedSlots((prev) => {
        const next = new Set(prev)
        next.add(selectedSlot.id)
        return next
      })
  
      router.push('/bookings')
      router.refresh()
    } catch (error) {
      console.error('Booking error:', error)
      setBookingError('Could not create booking. Please try again.')
    } finally {
      setIsConfirming(false)
      setBookingSlotId(null)
    }
  }



  const handleToggleAlert = async (slotId: string) => {
    if (!user) { setShowSignInModal(true); return }

    // Check if alert exists
    const hasAlert = alerts.has(slotId)

    if (hasAlert) {
      // Unfollow: Update status to 'cancelled'
      const { error } = await supabase
        .from('slot_alerts')
        .update({ status: 'cancelled' })
        .eq('slot_id', slotId)
        .eq('diner_user_id', user.id)

      if (error) {
        throw new Error('Failed to update alert')
      }

      // Remove from local state
      const newAlerts = new Set(alerts)
      newAlerts.delete(slotId)
      setAlerts(newAlerts)
    } else {
      // Follow: Check if a cancelled alert exists first
      const { data: existingAlert } = await supabase
        .from('slot_alerts')
        .select('id, status')
        .eq('slot_id', slotId)
        .eq('diner_user_id', user.id)
        .single()

      if (existingAlert) {
        // Reactivate the cancelled alert
        const { error } = await supabase
          .from('slot_alerts')
          .update({ status: 'active' })
          .eq('id', existingAlert.id)

        if (error) {
          throw new Error('Failed to reactivate alert')
        }
      } else {
        // Create new alert
        const { error } = await supabase
          .from('slot_alerts')
          .insert({
            diner_user_id: user.id,
            slot_id: slotId,
            status: 'active',
          })

        if (error) {
          throw new Error('Failed to create alert')
        }
      }

      // Add to local state
      const newAlerts = new Set(alerts)
      newAlerts.add(slotId)
      setAlerts(newAlerts)
    }
  }



  const isLastMinute = (startAt: string) => {
    const now = new Date()
    const slotTime = new Date(startAt)
    const hoursUntil = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntil <= 24
  }

  return (
    <div className="space-y-6">

      {/* Search bar */}
<div className="sticky top-16 z-20 bg-[#FAF9F7]">
  <SearchBar filters={filters} venues={venues} onChange={setFilters} />
</div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent"></div>
          <p className="mt-4 text-zinc-500 font-light">Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-white" style={{ borderRadius: '6px', border: '1px solid #F0EDE9' }}>
          <p className="text-zinc-500 font-light">No slots found matching your criteria.</p>
          <p className="text-sm text-zinc-400 font-light mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {Object.values(
            results.reduce((acc, r) => {
              const vid = r.venue.id
              if (!acc[vid]) acc[vid] = { venue: r.venue, slots: [] }
              if (acc[vid].slots.length < 10) acc[vid].slots.push(r.slot)
              return acc
            }, {} as Record<string, { venue: SearchResult['venue'], slots: SearchResult['slot'][] }>)
          ).map(({ venue, slots }) => {
            const MAX_VISIBLE = 6
            const visibleSlots = slots.slice(0, MAX_VISIBLE)

            return (
              <div key={venue.id} className="bg-white overflow-hidden" style={{ borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex flex-col md:flex-row">

                  {/* Image — 4:3 on mobile, fixed width on desktop */}
                  <Link href={`/venues/${venue.id}`} prefetch={true} className="relative w-full md:w-48 md:flex-shrink-0 bg-zinc-100 overflow-hidden hover:opacity-90 transition-opacity" style={{ aspectRatio: '4/3' }}>
                    {venue.image_hero ? (
                      <Image src={venue.image_hero} alt={venue.name} fill sizes="(max-width: 768px) 100vw, 192px" quality={70} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-100" />
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 px-6 py-5 flex flex-col justify-between gap-4 min-w-0">

                    {/* Venue info */}
                    <div>
                      <Link href={`/venues/${venue.id}`} prefetch={true} className="hover:opacity-60 transition-opacity">
                        <h3 className="text-base font-light text-zinc-900 tracking-tight mb-0.5">{venue.name}</h3>
                      </Link>
                      {venue.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, London`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-light text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                          {venue.area}{venue.address ? ` · ${venue.address}` : ''}
                        </a>
                      )}
                    </div>

                    {/* Time slots — lighter, less boxy */}
                    <div className="flex flex-wrap gap-1.5">
                      {visibleSlots.map(slot => {
                        const isBookedByMe = bookedSlots.has(slot.id)

                        if (isBookedByMe) {
                          return (
                            <Link href="/bookings" key={slot.id}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-light transition-opacity hover:opacity-80"
                              style={{ backgroundColor: '#F0FAF5', border: '1px solid #C8E6D4', borderRadius: '3px', color: '#2A6B4A' }}>
                              {formatSlotDate(slot.start_at)} · {formatSlotTime(slot.start_at)}
                            </Link>
                          )
                        }

                        if (slot.status === 'booked') {
                          const hasAlert = alerts.has(slot.id)
                          return (
                            <button key={slot.id} onClick={() => handleToggleAlert(slot.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-light text-zinc-400 hover:text-zinc-600 transition-colors"
                              style={{ backgroundColor: 'transparent', border: '1px solid #F0EDE9', borderRadius: '3px' }}>
                              {formatSlotDate(slot.start_at)} · {formatSlotTime(slot.start_at)}
                              {hasAlert && <span className="text-[9px] ml-0.5">🔔</span>}
                            </button>
                          )
                        }

                        return (
                          <button key={slot.id} onClick={() => handleBook(slot.id)}
                            disabled={bookingSlotId === slot.id}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-light text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-40"
                            style={{ border: '1px solid #E4E0DB', borderRadius: '3px' }}>
                            {formatSlotDate(slot.start_at)} · {formatSlotTime(slot.start_at)}
                          </button>
                        )
                      })}

                      {slots.length > MAX_VISIBLE && (
                        <Link href={`/venues/${venue.id}`} prefetch={true}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors"
                          style={{ border: '1px solid #F0EDE9', borderRadius: '3px' }}>
                          +{slots.length - MAX_VISIBLE} more
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}


{selectedSlot && (
  <PartySizeModal
    isOpen={showPartySizeModal}
    onClose={() => {
      setShowPartySizeModal(false)
      setSelectedSlot(null)
      setBookingError(null)
      setBookingSlotId(null)
      setIsConfirming(false)
    }}
    onConfirm={confirmBooking}
    minSize={selectedSlot.party_min}
    maxSize={selectedSlot.party_max}

    venueName={selectedSlot.venue?.name || 'Venue'}
    venueLocation={selectedSlot.venue?.area}
    slotTime={formatFullDateTime(selectedSlot.start_at)}
    hostName={profile?.full_name || undefined}
    requiresGuestNames={selectedSlot.venue?.requires_guest_names}
    error={bookingError}
    isSubmitting={isConfirming}
  />
)}

{/* Cancel Booking Modal */}
{showCancelModal && cancellingSlot && (
  <CancelBookingModal
    isOpen={showCancelModal}
    onClose={() => {
      setShowCancelModal(false)
      setCancellingSlot(null)
      setBookingError(null)
    }}
    onConfirm={handleCancel}
    venueName={cancellingSlot.venueName}
  />
)}



    </div>

      {/* Pre-auth modal */}
      {showSignInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setShowSignInModal(false) }}
        >
          <div className="bg-white w-full max-w-sm shadow-xl overflow-hidden" style={{ borderRadius: '6px' }}>
            <div className="relative px-7 pt-5 pb-4" style={{ borderBottom: '1px solid #F5F3F0' }}>
              <button onClick={() => setShowSignInModal(false)} className="absolute top-4 right-5 text-zinc-400 hover:text-zinc-700 transition-colors" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <p className="text-[9px] tracking-[0.22em] text-zinc-400 uppercase font-light mb-1.5">Members only</p>
              <h2 className="text-xl font-light text-zinc-900 tracking-tight pr-8 leading-snug">Verify to complete this booking</h2>
            </div>
            <div className="px-7 pt-5 pb-6 space-y-5">
              <p className="text-sm font-light text-zinc-500 leading-relaxed">
                ClientDining is free for verified professionals. We use LinkedIn to confirm your role — we don't post to your profile or access your connections.
              </p>
              <button
                onClick={handleSignIn}
                className="w-full h-12 inline-flex items-center justify-center gap-3 text-sm font-light transition-all duration-300"
                style={{ backgroundColor: 'white', color: '#3f3f46', borderRadius: '3px', border: '1px solid #a1a1aa' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#71717a')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#a1a1aa')}
              >
                <svg className="w-4 h-4 flex-shrink-0 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Continue with LinkedIn
              </button>
              <p className="text-xs font-light text-center text-zinc-400">
                New to ClientDining?{' '}
                <a href="/signup" onClick={() => setShowSignInModal(false)} className="text-zinc-600 hover:text-zinc-900 transition-colors underline underline-offset-2">Apply here</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
