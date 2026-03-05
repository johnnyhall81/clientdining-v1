'use client'


import CancelBookingModal from '@/components/modals/CancelBookingModal'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import Link from 'next/link'
import AlertToggle from '@/components/slots/AlertToggle'
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
          .select('id, slot_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .in('slot_id', slotIds)

        if (error) throw error

        setBookedSlots(new Set((data || []).map((b: any) => b.slot_id)))
        setBookingIdsBySlot(new Map((data || []).map((b: any) => [b.slot_id, b.id])))
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
          image_hero
        )
      `
      )
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(50)

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
    if (!user) {
      router.push('/login')
      return
    }
  
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
    if (!user) {
      router.push('/login')
      return
    }

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
      <div>
        <h1 className="text-4xl font-light text-zinc-900 mb-2">Search</h1>
        
      </div>

      {/* Search bar */}
      <SearchBar filters={filters} venues={venues} onChange={setFilters} />

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent"></div>
          <p className="mt-4 text-zinc-500 font-light">Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
          <p className="text-zinc-500 font-light">No slots found matching your criteria.</p>
          <p className="text-sm text-zinc-500 font-light mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map(({ slot, venue }) => {
            const hasAlert = alerts.has(slot.id)
            const isBookedByMe = bookedSlots.has(slot.id)

            return (
              <div
                key={slot.id}
                className="bg-white border border-zinc-200 rounded-lg overflow-hidden relative"
              >
                {/* Cancel X for booked slots */}
                {isBookedByMe && (
                  <button
                    type="button"
                    onClick={() => openCancelModal(slot.id, venue.name)}
                    className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-zinc-500 transition-colors"
                    aria-label="Cancel booking"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                <div className="flex flex-col md:flex-row">
                  {/* Large image — left */}
                  <Link href={`/venues/${venue.id}`} prefetch={true} className="relative w-full md:w-2/5 aspect-[4/3] bg-zinc-100 overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity rounded-l-lg">
                    {venue.image_hero ? (
                      <Image
                        src={venue.image_hero}
                        alt={venue.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                        quality={60}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-100" />
                    )}
                  </Link>

                  {/* Details — right */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="space-y-1 pr-6">
                      <Link href={`/venues/${venue.id}`} prefetch={true} className="hover:opacity-80 transition-opacity">
                        <h3 className="text-lg font-light text-zinc-900">{venue.name}</h3>
                      </Link>
                      {venue.address && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-light text-zinc-500">
                            {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
                          </span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address} London`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Maps"
                            onClick={e => e.stopPropagation()}
                            className="text-zinc-300 hover:text-zinc-600 transition-colors flex-shrink-0"
                          >
                            <MapIcon />
                          </a>
                        </div>
                      )}
                      
                      <p className="text-sm font-light text-zinc-500 pt-1">
                        {formatSlotDate(slot.start_at)} · {formatSlotTime(slot.start_at)} · {slot.party_min === slot.party_max ? `${slot.party_min} guests` : `${slot.party_min}–${slot.party_max} guests`}
                      </p>









                    </div>

                    <div className="pt-6 flex items-center justify-end">
                      <div>
                        {slot.status === 'available' && !isBookedByMe ? (
                          <button
                            onClick={() => handleBook(slot.id)}
                            disabled={bookingSlotId === slot.id}
                            className={[
                              'h-9 px-5 text-sm font-light border border-zinc-300 rounded-lg whitespace-nowrap transition-colors',
                              bookingSlotId === slot.id
                                ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed'
                                : 'bg-white text-zinc-900 hover:bg-zinc-50',
                            ].join(' ')}
                          >
                            {bookingSlotId === slot.id ? 'Booking...' : 'Book'}
                          </button>
                        ) : isBookedByMe ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-light tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                              Confirmed
                            </span>
                            <div className="flex items-center gap-1.5">
                              {profile?.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.full_name || ''}
                                  className="w-4 h-4 rounded-full object-cover opacity-70"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-zinc-300 flex items-center justify-center">
                                  <span className="text-[8px] font-medium text-zinc-600">
                                    {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs font-light text-zinc-400">
                                Reserved for {profile?.full_name?.split(' ')[0] || 'You'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <AlertToggle isActive={hasAlert} onToggle={() => handleToggleAlert(slot.id)} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}


{!loading && results.length > 0 && (
  <div className="pt-2 text-sm text-zinc-500 font-light">
    Not seeing the right table?{" "}
    <a
      onClick={(e) => {
        e.preventDefault()
        const subject = encodeURIComponent('Table enquiry via ClientDining')
        const body = encodeURIComponent(
          `Venue:\nPreferred date:\nTime window:\nParty size:\nOccasion (optional):\nNotes (optional):\n`
        )
        window.open(
          `mailto:support@clientdining.com?subject=${subject}&body=${body}`,
          '_blank'
        )
      }}
      className="text-zinc-700 hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
    >
      Ask us to check.
    </a>
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
  )
}
