'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { formatFullDateTime } from '@/lib/date-utils'
import Link from 'next/link'
import Image from 'next/image'
import RemoveAlertModal from '@/components/modals/RemoveAlertModal'
import PartySizeModal from '@/components/modals/PartySizeModal'

interface AlertWithDetails {
  id: string
  slot_id: string
  status: string
  created_at: string
  notified_at: string | null
  expires_at: string | null
  slot: {
    id?: string
    start_at: string
    party_min: number
    party_max: number
    slot_tier: string
    status: string
  }
  venue: {
    id: string
    name: string
    area: string
    image_venue: string | null
  }
}

export default function AlertsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [alerts, setAlerts] = useState<AlertWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [alertToRemove, setAlertToRemove] = useState<AlertWithDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null)
  const [showPartySizeModal, setShowPartySizeModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<AlertWithDetails | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadAlerts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  const loadAlerts = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('slot_alerts')
        .select(`
          *,
          slots!inner (
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
              image_venue
            )
          )
        `)
        .eq('diner_user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformed: AlertWithDetails[] = (data || []).map((item: any) => ({
        id: item.id,
        slot_id: item.slot_id,
        status: item.status,
        created_at: item.created_at,
        notified_at: item.notified_at,
        expires_at: item.expires_at,
        slot: item.slots,
        venue: item.slots.venues,
      }))

      setAlerts(transformed)
    } catch (e) {
      console.error('Error loading alerts:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAlert = (alert: AlertWithDetails) => {
    setAlertToRemove(alert)
    setShowRemoveModal(true)
  }

  const confirmRemoveAlert = async () => {
    if (!alertToRemove) return

    setShowRemoveModal(false)
    setError(null)

    try {
      const { error } = await supabase
        .from('slot_alerts')
        .update({ status: 'cancelled' })
        .eq('id', alertToRemove.id)

      if (error) {
        console.error('Error removing alert:', error)
        setError('Failed to remove alert. Please try again.')
        return
      }

      await loadAlerts()
      setAlertToRemove(null)
    } catch (e) {
      console.error('Error removing alert:', e)
      setError('Failed to remove alert. Please try again.')
    }
  }

  const handleBook = (alert: AlertWithDetails) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (alert.status !== 'notified') return

    setSelectedAlert(alert)
    setBookingError(null)
    setShowPartySizeModal(true)
  }

  const confirmBooking = async (partySize: number, notes?: string) => {
    if (!selectedAlert) return
  
    setBookingSlotId(selectedAlert.slot_id)
    setBookingError(null)
  
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedAlert.slot_id,
          partySize: Number(partySize),
          notes,
        }),
      })
  
      const data = await response.json().catch(() => ({}))
  
      if (!response.ok) {
        const message = data?.error || 'Could not create booking'
        setBookingError(message)
        setBookingSlotId(null)
        return
      }
  
      setShowPartySizeModal(false)
      setBookingError(null)
  
      // Remove the alert from the local state
      // (The RPC function already marked it as 'booked' in the database)
      setAlerts((prev) => prev.filter((a) => a.id !== selectedAlert.id))
  
      router.push('/bookings')
      router.refresh()
      
    } catch (e) {
      console.error('Booking error:', e)
      setBookingError('Could not create booking. Please try again.')
    } finally {
      setBookingSlotId(null)
    }
  }

  const filteredAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'notified')

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-zinc-500 font-light">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light text-zinc-900 mb-2">Alerts</h1>
        
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-white border border-zinc-200">
          <p className="text-zinc-500 font-light mb-4">No active alerts</p>
          <Link href="/search" className="text-zinc-900 font-light hover:underline">
            Search for tables to set alerts
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-light">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const isBookingThis = bookingSlotId === alert.slot_id

              return (
                <div key={alert.id} className="bg-white border border-zinc-200 relative">
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveAlert(alert)}
                    className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-zinc-600 transition-colors"
                    aria-label="Remove alert"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex flex-col md:flex-row">
                    {/* Wide landscape image */}
                    <Link href={`/venues/${alert.venue.id}`} prefetch={true} className="relative w-full md:w-2/5 aspect-[4/3] bg-zinc-100 overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity">
                      {alert.venue.image_venue ? (
                        <Image
                          src={alert.venue.image_venue}
                          alt={alert.venue.name}
                          fill
                          sizes="40vw"
                          quality={60}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100" />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 p-6 flex flex-col justify-between pr-10">
                      <div className="space-y-2">
                        <Link href={`/venues/${alert.venue.id}`} prefetch={true}>
                          <h3 className="font-light text-xl text-zinc-900 hover:opacity-70 transition-opacity">{alert.venue.name}</h3>
                        </Link>
                        <p className="text-sm text-zinc-400 font-light">{alert.venue.area}</p>
                        <p className="text-sm text-zinc-700 font-light pt-2">{formatFullDateTime(alert.slot.start_at)}</p>
                        <p className="text-sm text-zinc-500 font-light">
                          {alert.slot.party_min === alert.slot.party_max
                            ? `${alert.slot.party_min} guests`
                            : `${alert.slot.party_min}–${alert.slot.party_max} guests`}
                        </p>
                        {alert.status === 'notified' && (
                          <p className="text-xs text-blue-700 font-light pt-1">Table available — act now</p>
                        )}
                      </div>

                      {alert.status === 'notified' && (
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => handleBook(alert)}
                            disabled={isBookingThis}
                            className={[
                              'h-10 px-6 text-sm font-light whitespace-nowrap transition-colors border border-zinc-300',
                              isBookingThis
                                ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed'
                                : 'bg-white text-zinc-900 hover:bg-zinc-50',
                            ].join(' ')}
                          >
                            {isBookingThis ? 'Booking...' : 'Book'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <RemoveAlertModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false)
          setAlertToRemove(null)
        }}
        onConfirm={confirmRemoveAlert}
        venueName={alertToRemove?.venue.name}
      />

      {selectedAlert && (
        <PartySizeModal
          isOpen={showPartySizeModal}
          onClose={() => {
            setShowPartySizeModal(false)
            setSelectedAlert(null)
            setBookingError(null)
            setBookingSlotId(null)
          }}
          onConfirm={confirmBooking}
          minSize={selectedAlert.slot.party_min}
          maxSize={selectedAlert.slot.party_max}
          venueName={selectedAlert.venue?.name || 'Venue'}
          error={bookingError}
        />
      )}
    </div>
  )
}
