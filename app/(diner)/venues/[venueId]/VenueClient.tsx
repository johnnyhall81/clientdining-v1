'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Venue, Slot } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import SlotRow from '@/components/slots/SlotRow'
import PremiumUnlockModal from '@/components/modals/PremiumUnlockModal'
import PartySizeModal from '@/components/modals/PartySizeModal'

interface VenueClientProps {
  venue: Venue
  slots: Slot[]
}

export default function VenueClient({ venue, slots }: VenueClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  const [alerts, setAlerts] = useState<Set<string>>(new Set())
  const [bookingSlot, setBookingSlot] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showPartySizeModal, setShowPartySizeModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [dinerTier, setDinerTier] = useState<'free' | 'premium'>('free')
  const [futureBookingsCount, setFutureBookingsCount] = useState(0)

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

  // Load user tier
  useEffect(() => {
    const loadUserTier = async () => {
      if (!user) {
        setDinerTier('free')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('diner_tier')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setDinerTier(data.diner_tier)
      }
    }
    loadUserTier()
  }, [user])

  // Load future bookings count
  useEffect(() => {
    const loadFutureBookingsCount = async () => {
      if (!user) {
        setFutureBookingsCount(0)
        return
      }

      const nowIso = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('slot_start_at', nowIso)

      if (!error && data) {
        setFutureBookingsCount(data.length || 0)
      }
    }
    loadFutureBookingsCount()
  }, [user, bookedSlots]) // Recount when bookings change

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

        const nowIso = new Date().toISOString()

        const { data, error } = await supabase
        .from('bookings')
        .select('slot_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .in('slot_id', slotIds)
        
      

        if (error) throw error
        console.log('Venue bookings rows:', data)
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
  
    const slot = slots.find(s => s.id === slotId)
    if (!slot) return
  
    setSelectedSlot(slot)
    setShowPartySizeModal(true)
  }
  
  const confirmBooking = async (partySize: number) => {
    if (!selectedSlot) return
  
    setShowPartySizeModal(false)
    setBookingSlot(selectedSlot.id)
  
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slotId: selectedSlot.id,
          partySize 
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








  const handleCancel = async (slotId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        console.error('Cancel failed:', data?.error || 'Failed to cancel booking')
        return
      }

      setBookedSlots((prev) => {
        const next = new Set(prev)
        next.delete(slotId)
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
      // Throw so AlertToggle can show inline error (no popups)
      throw new Error(data?.error || 'Failed to update alert')
    }

    const newAlerts = new Set(alerts)
    if (data.active) newAlerts.add(slotId)
    else newAlerts.delete(slotId)
    setAlerts(newAlerts)
  }

  return (
    <div className="space-y-8">
      <div className="relative bg-gray-200 rounded-lg aspect-[21/9] overflow-hidden">
        
      <Image
        src={venue.image_food || venue.image_venue || '/placeholder-venue.jpg'}
        alt={venue.name}
        fill
        priority
        quality={75}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        className="object-cover"
      />


      </div>

      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{venue.name}</h1>
            <div className="flex items-center gap-4 text-gray-600 mb-2">
              <span>{venue.area}</span>
              <span>•</span>
              <span className="capitalize">{venue.venue_type}</span>
            </div>
            {venue.address && (
              <p className="text-sm text-gray-600">
                📍 {venue.address}{venue.postcode ? `, ${venue.postcode}` : ''}
              </p>
            )}
          </div>
        </div>

        <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-medium text-gray-900">
                  {children}
                </strong>
              ),
            }}
          >
            {text}
          </ReactMarkdown>


      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Tables</h2>

        {slots.length === 0 ? (
          <p className="text-gray-500">No tables available at this time.</p>
        ) : (
          <div>
            {slots.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                dinerTier={dinerTier}
                currentFutureBookings={futureBookingsCount}
                onBook={handleBook}
                isAlertActive={alerts.has(slot.id)}
                onToggleAlert={handleToggleAlert}
                isBookedByMe={bookedSlots.has(slot.id)}
                onCancel={handleCancel}
                onUnlock={() => setShowPremiumModal(true)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Premium Unlock Modal */}
      <PremiumUnlockModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

{selectedSlot && (
  <PartySizeModal
    isOpen={showPartySizeModal}
    onClose={() => {
      setShowPartySizeModal(false)
      setSelectedSlot(null)
      setBookingError(null)
    }}
    onConfirm={confirmBooking}
    minSize={selectedSlot.party_min}
    maxSize={selectedSlot.party_max}
    venueName={venue.name}
    error={bookingError}
  />
)}
    </div>
  )
}
