'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'

interface Alert {
  id: string
  slot_id: string
  diner_user_id: string
  status: string
  created_at: string
  slot: {
    id: string
    start_at: string
    party_min: number
    party_max: number
    slot_tier: string
    status: string
    venue_id: string
  }
  venue: {
    id: string
    name: string
    area: string
  }
  diner: {
    user_id: string
    email: string
    full_name: string | null
  }
}

interface VenueDemand {
  venue_id: string
  venue_name: string
  area: string
  alert_count: number
  slots: Array<{
    slot_id: string
    start_at: string
    party_size: string
    alert_count: number
    diner_emails: string[]
  }>
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [venueDemand, setVenueDemand] = useState<VenueDemand[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'all' | 'byVenue'>('all')
  const [filterVenue, setFilterVenue] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')

  useEffect(() => {
    loadAlerts()
  }, [filterStatus])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('slot_alerts')
        .select(`
          id,
          slot_id,
          diner_user_id,
          status,
          created_at,
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
              area
            )
          ),
          profiles!slot_alerts_diner_user_id_fkey (
            user_id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data
      const transformedAlerts: Alert[] = (data || []).map((item: any) => ({
        id: item.id,
        slot_id: item.slot_id,
        diner_user_id: item.diner_user_id,
        status: item.status,
        created_at: item.created_at,
        slot: {
          id: item.slots.id,
          start_at: item.slots.start_at,
          party_min: item.slots.party_min,
          party_max: item.slots.party_max,
          slot_tier: item.slots.slot_tier,
          status: item.slots.status,
          venue_id: item.slots.venue_id,
        },
        venue: {
          id: item.slots.venues.id,
          name: item.slots.venues.name,
          area: item.slots.venues.area,
        },
        diner: {
          user_id: item.profiles.user_id,
          email: item.profiles.email,
          full_name: item.profiles.full_name,
        },
      }))

      setAlerts(transformedAlerts)

      // Calculate venue demand
      calculateVenueDemand(transformedAlerts.filter(a => a.status === 'active'))
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateVenueDemand = (activeAlerts: Alert[]) => {
    const venueMap = new Map<string, VenueDemand>()

    activeAlerts.forEach((alert) => {
      const venueId = alert.venue.id
      
      if (!venueMap.has(venueId)) {
        venueMap.set(venueId, {
          venue_id: venueId,
          venue_name: alert.venue.name,
          area: alert.venue.area,
          alert_count: 0,
          slots: [],
        })
      }

      const venueDemand = venueMap.get(venueId)!
      venueDemand.alert_count++

      // Find or create slot entry
      const slotIndex = venueDemand.slots.findIndex(s => s.slot_id === alert.slot_id)
      if (slotIndex === -1) {
        venueDemand.slots.push({
          slot_id: alert.slot_id,
          start_at: alert.slot.start_at,
          party_size: `${alert.slot.party_min}-${alert.slot.party_max}`,
          alert_count: 1,
          diner_emails: [alert.diner.email],
        })
      } else {
        venueDemand.slots[slotIndex].alert_count++
        venueDemand.slots[slotIndex].diner_emails.push(alert.diner.email)
      }
    })

    // Sort by alert count (highest demand first)
    const sortedDemand = Array.from(venueMap.values()).sort(
      (a, b) => b.alert_count - a.alert_count
    )

    // Sort slots within each venue
    sortedDemand.forEach(venue => {
      venue.slots.sort((a, b) => b.alert_count - a.alert_count)
    })

    setVenueDemand(sortedDemand)
  }

  const filteredAlerts = filterVenue
    ? alerts.filter(a => a.venue.id === filterVenue)
    : alerts

  const uniqueVenues = Array.from(new Set(alerts.map(a => a.venue.id))).map(id => {
    const alert = alerts.find(a => a.venue.id === id)!
    return { id, name: alert.venue.name }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor demand and identify opportunities for additional slots</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Active Alerts</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {alerts.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Venues with Demand</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {venueDemand.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Highest Demand</div>
          <div className="text-lg font-bold text-gray-900 mt-2">
            {venueDemand[0]?.venue_name || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{venueDemand[0]?.alert_count || 0} alerts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total All Time</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {alerts.length}
          </div>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setView('byVenue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'byVenue'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Venue (Demand)
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 ml-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="active">Active Only</option>
              <option value="all">All Statuses</option>
              <option value="notified">Notified</option>
              <option value="booked">Booked</option>
              <option value="expired">Expired</option>
            </select>

            {view === 'all' && (
              <select
                value={filterVenue}
                onChange={(e) => setFilterVenue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Venues</option>
                {uniqueVenues.map(venue => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      ) : view === 'all' ? (
        /* All Alerts View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No alerts found
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{alert.venue.name}</div>
                        <div className="text-sm text-gray-500">{alert.venue.area}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatSlotDate(alert.slot.start_at)} at {formatSlotTime(alert.slot.start_at)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {alert.slot.party_min}-{alert.slot.party_max} guests • {alert.slot.slot_tier}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Slot status: {alert.slot.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{alert.diner.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{alert.diner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alert.status === 'active' ? 'bg-green-100 text-green-800' :
                          alert.status === 'notified' ? 'bg-blue-100 text-blue-800' :
                          alert.status === 'booked' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={`mailto:${alert.diner.email}?subject=Re: Your alert for ${alert.venue.name}&body=Hi ${alert.diner.full_name || 'there'},%0D%0A%0D%0ARegarding your alert for ${alert.venue.name} on ${formatSlotDate(alert.slot.start_at)} at ${formatSlotTime(alert.slot.start_at)}...%0D%0A%0D%0ABest regards,%0D%0AClientDining Team`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Email
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(alert.diner.email)
                            window.alert('Email copied to clipboard!')
                          }}
                          className="ml-3 text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* By Venue (Demand) View */
        <div className="space-y-6">
          {venueDemand.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No active demand to display</p>
            </div>
          ) : (
            venueDemand.map((venue) => (
              <div key={venue.venue_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{venue.venue_name}</h3>
                      <p className="text-sm text-gray-600">{venue.area}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{venue.alert_count}</div>
                      <div className="text-sm text-gray-500">Active Alerts</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700">High Demand Slots:</h4>
                    <button
                      onClick={() => {
                        const allEmails = venue.slots.flatMap(s => s.diner_emails).join(';')
                        window.location.href = `mailto:?bcc=${allEmails}&subject=New slots available at ${venue.venue_name}&body=Hi,%0D%0A%0D%0AWe noticed you set an alert for ${venue.venue_name}. We've added new availability that might interest you.%0D%0A%0D%0AVisit ClientDining to view available slots:%0D%0Ahttps://clientdining.com/venues/${venue.venue_id}%0D%0A%0D%0ABest regards,%0D%0AClientDining Team`
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Email All ({venue.alert_count} diners)
                    </button>
                  </div>
                  <div className="space-y-3">
                    {venue.slots.map((slot) => (
                      <div key={slot.slot_id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {formatSlotDate(slot.start_at)} at {formatSlotTime(slot.start_at)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Party size: {slot.party_size} guests
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Interested diners: {slot.diner_emails.slice(0, 3).join(', ')}
                            {slot.diner_emails.length > 3 && ` +${slot.diner_emails.length - 3} more`}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                const emails = slot.diner_emails.join(';')
                                window.location.href = `mailto:?bcc=${emails}&subject=New slot available: ${venue.venue_name} - ${formatSlotDate(slot.start_at)}&body=Hi,%0D%0A%0D%0AWe noticed you set an alert for ${venue.venue_name} on ${formatSlotDate(slot.start_at)} at ${formatSlotTime(slot.start_at)}.%0D%0A%0D%0AWe've created a similar slot that might interest you.%0D%0A%0D%0AView and book now:%0D%0Ahttps://clientdining.com/venues/${venue.venue_id}%0D%0A%0D%0ABest regards,%0D%0AClientDining Team`
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              📧 Email {slot.alert_count} {slot.alert_count === 1 ? 'diner' : 'diners'}
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(slot.diner_emails.join(', '))
                                window.alert('Emails copied to clipboard!')
                              }}
                              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                            >
                              Copy emails
                            </button>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            {slot.alert_count} {slot.alert_count === 1 ? 'alert' : 'alerts'}
                          </span>
                          <div className="text-xs text-gray-500 mt-2">
                            💡 Consider creating similar slot
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
