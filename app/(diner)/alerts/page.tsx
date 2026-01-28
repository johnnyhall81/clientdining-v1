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
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alerts</h1>
        <p className="text-gray-600">View and manage your alerts</p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'active'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
        </nav>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 mb-4">
            {filter === 'active' ? 'No active alerts' : 'No alerts set'}
          </p>
          <Link href="/search" className="text-blue-600 hover:underline">
            Search for tables to set alerts
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <div key={alert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <Link href={`/venues/${alert.venue.id}`} className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity">
                {alert.venue.image_venue && (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={alert.venue.image_venue}
                      alt={alert.venue.name}
                      fill
                      sizes="64px"
                      className="rounded object-cover"
                    />
                  </div>
                )}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 hover:underline">{alert.venue.name}</h3>
                    <p className="text-sm text-gray-600">{alert.venue.area}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-gray-700">
                        {formatFullDateTime(alert.slot.start_at)}
                      </span>
                      <span className="text-gray-600">
                        {alert.slot.party_min}-{alert.slot.party_max} guests
                      </span>
                      {alert.status === 'notified' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          🔔 Notified - Book now!
                        </span>
                      )}
                      {alert.status === 'active' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      )}
                      {alert.status === 'expired' && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => handleRemoveAlert(alert.id)}
                  className="h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-white border border-red-500 text-red-600 hover:bg-red-50 transition-colors"
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
