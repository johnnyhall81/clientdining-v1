'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'

import { formatFullDateTime } from '@/lib/date-utils'
import Link from 'next/link'
import Image from 'next/image'

interface AlertWithDetails {
  id: string
  slot_id: string
  status: string
  created_at: string
  notified_at: string | null
  expires_at: string | null
  slot: {
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
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadAlerts()
    }
  }, [user, authLoading, router])

  const loadAlerts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('slot_alerts')
        .select(`
          *,
          slots!inner (
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
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAlert = async (alertId: string) => {
    if (!confirm('Remove this alert?')) return

    try {
      const { error } = await supabase
        .from('slot_alerts')
        .delete()
        .eq('id', alertId)

      if (error) {
        console.error('Error removing alert:', error)
        alert('Failed to remove alert')
        return
      }

      // Reload alerts
      loadAlerts()
    } catch (error) {
      console.error('Error removing alert:', error)
      alert('Failed to remove alert')
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') {
      return alert.status === 'active' || alert.status === 'notified'
    }
    return true
  })

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-zinc-500 font-light">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light text-zinc-900 mb-2">Alerts</h1>
        <p className="text-zinc-600 font-light">View and manage your alerts</p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('active')}
            className={`py-4 px-1 border-b-2 font-light text-sm ${
              filter === 'active'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`py-4 px-1 border-b-2 font-light text-sm ${
              filter === 'all'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            All
          </button>
        </nav>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <p className="text-zinc-500 font-light mb-4">
            {filter === 'active' ? 'No active alerts' : 'No alerts set'}
          </p>
          <Link href="/search" className="text-zinc-900 font-light hover:underline">
            Search for tables to set alerts
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <div key={alert.id} className="bg-white rounded-lg shadow-sm border border-zinc-200 p-4">
              <div className="flex items-center justify-between gap-4">
                
              <Link 
                href={`/venues/${alert.venue.id}`}
                prefetch={true}
                className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
              >
                
                
                
                <div className="relative w-16 h-16 aspect-square bg-zinc-100 rounded overflow-hidden flex-shrink-0">
                {alert.venue.image_venue ? (
                  <Image
                    src={alert.venue.image_venue}
                    alt={alert.venue.name}
                    fill
                    sizes="64px"
                    quality={90}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-light">
                    No image
                  </div>
                )}
              </div>
                  <div>
                    <h3 className="font-light text-lg text-zinc-900 hover:underline">{alert.venue.name}</h3>
                    <p className="text-sm text-zinc-600 font-light">{alert.venue.area}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-zinc-700 font-light">
                        {formatFullDateTime(alert.slot.start_at)}
                      </span>
                      <span className="text-zinc-600 font-light">
                        {alert.slot.party_min}-{alert.slot.party_max} guests
                      </span>
                      {alert.status === 'notified' && (
                        <span className="text-xs bg-zinc-900 text-zinc-50 px-2 py-0.5 rounded-full font-light">
                          🔔 Notified - Book now!
                        </span>
                      )}
                      {alert.status === 'active' && (
                        <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-light">
                          Active
                        </span>
                      )}
                      {alert.status === 'expired' && (
                        <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-light">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => handleRemoveAlert(alert.id)}
                  className="h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
