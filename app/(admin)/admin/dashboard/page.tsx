'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { formatFullDateTime } from '@/lib/date-utils'
import { RefreshCw } from 'lucide-react'

interface Booking {
  id: string
  slot_id: string
  user_id: string
  party_size: number
  status: string
  notes: string | null  // Changed from notes_private
  created_at: string
  cancelled_at: string | null
  slot: {
    start_at: string
    venue: {
      name: string
      phone: string | null
      booking_email: string | null
    }
  }
  user: {
    email: string
    full_name: string | null
  }
}

interface Alert {
  id: string
  slot_id: string
  status: string
  created_at: string
  notified_at: string | null
  slot: {
    start_at: string
    venue: {
      name: string
    }
  }
  user: {
    email: string
    full_name: string | null
  }
}

interface User {
  user_id: string
  role: string
  diner_tier: string
  is_professionally_verified: boolean
  created_at: string
  email: string
  full_name: string | null
  referred_by_user_id: string | null
}

interface Referral {
  user_id: string
  email: string
  full_name: string | null
  created_at: string
  diner_tier: string
  referrer: {
    email: string
    full_name: string | null
  }
}

export default function AdminDashboard() {
  const [activeBookings, setActiveBookings] = useState<Booking[]>([])
  const [cancelledBookings, setCancelledBookings] = useState<Booking[]>([])
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [newUsers, setNewUsers] = useState<User[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  
  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()

      if (data.error) {
        console.error('Dashboard data error:', data.error)
        return
      }

      setActiveBookings(data.activeBookings || [])
      setCancelledBookings(data.cancelledBookings || [])
      setCompletedBookings(data.completedBookings || [])
      setAlerts(data.alerts || [])
      setNewUsers(data.newUsers || [])
      setReferrals(data.referrals || [])

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading activity data:', error)
    } finally {
      setLoading(false)
    }
  }






  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-zinc-900">Admin Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (30s)
            </label>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="text-2xl font-light text-zinc-900">{activeBookings.length}</div>
            <div className="text-sm text-zinc-500">Active Bookings</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="text-2xl font-light text-zinc-900">{alerts.length}</div>
            <div className="text-sm text-zinc-500">Active Alerts</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="text-2xl font-light text-zinc-900">{cancelledBookings.length}</div>
            <div className="text-sm text-zinc-500">Recent Cancellations</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="text-2xl font-light text-zinc-900">{newUsers.length}</div>
            <div className="text-sm text-zinc-500">New Users (7d)</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="text-2xl font-light text-zinc-900">{referrals.length}</div>
            <div className="text-sm text-zinc-500">Total Referrals</div>
          </div>
        </div>

        {/* Active Bookings */}
        <section className="mb-8">
          <h2 className="text-xl font-light text-zinc-900 mb-4">Active Bookings</h2>
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Date/Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Diner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Party</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Notes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Booked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {activeBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                        No active bookings
                      </td>
                    </tr>
                  ) : (
                    activeBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-zinc-900">{booking.slot?.venue?.name}</div>
                          {booking.slot?.venue?.phone && (
                            <div className="text-zinc-500 text-xs">📞 {booking.slot.venue.phone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {formatFullDateTime(booking.slot?.start_at)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-zinc-900">{booking.user?.full_name || 'N/A'}</div>
                          <div className="text-zinc-500 text-xs">{booking.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-900">{booking.party_size}</td>
                        <td className="px-4 py-3 text-sm">
                          {booking.slot?.venue?.booking_email && (
                            <div className="text-zinc-600 text-xs">{booking.slot.venue.booking_email}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.notes ? (
                            <div className="text-zinc-700 text-xs max-w-xs truncate" title={booking.notes}>
                              {booking.notes}
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Active Alerts */}
        <section className="mb-8">
          <h2 className="text-xl font-light text-zinc-900 mb-4">Active Alerts</h2>
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Slot Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {alerts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        No active alerts
                      </td>
                    </tr>
                  ) : (
                    alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 text-sm text-zinc-900">{alert.slot?.venue?.name}</td>
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {formatFullDateTime(alert.slot?.start_at)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-zinc-900">{alert.user?.full_name || 'N/A'}</div>
                          <div className="text-zinc-500 text-xs">{alert.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            alert.status === 'notified' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cancelled Bookings */}
        <section className="mb-8">
          <h2 className="text-xl font-light text-zinc-900 mb-4">Recent Cancellations</h2>
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Slot Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Diner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Party</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Cancelled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {cancelledBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        No recent cancellations
                      </td>
                    </tr>
                  ) : (
                    cancelledBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 text-sm text-zinc-900">{booking.slot?.venue?.name}</td>
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {formatFullDateTime(booking.slot?.start_at)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-zinc-900">{booking.user?.full_name || 'N/A'}</div>
                          <div className="text-zinc-500 text-xs">{booking.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-900">{booking.party_size}</td>
                        <td className="px-4 py-3 text-sm text-zinc-500">
                          {booking.cancelled_at ? new Date(booking.cancelled_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* New Users */}
        <section className="mb-8">
          <h2 className="text-xl font-light text-zinc-900 mb-4">New Users (Last 7 Days)</h2>
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Verified</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {newUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        No new users in the last 7 days
                      </td>
                    </tr>
                  ) : (
                    newUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 text-sm text-zinc-900">{user.full_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600">{user.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            user.diner_tier === 'premium' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-zinc-100 text-zinc-800'
                          }`}>
                            {user.diner_tier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {user.is_professionally_verified ? (
                            <span className="text-green-600">✓ Yes</span>
                          ) : (
                            <span className="text-zinc-400">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

{/* Referrals */}
<section className="mb-8">
          <h2 className="text-xl font-light text-zinc-900 mb-4">Referrals</h2>
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">New User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Referred By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Referrer Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {referrals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                        No referrals yet
                      </td>
                    </tr>
                  ) : (
                    referrals.map((referral) => (
                      <tr key={referral.user_id} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 text-sm text-zinc-900">{referral.full_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600">{referral.email}</td>
                        <td className="px-4 py-3 text-sm text-zinc-900">{referral.referrer?.full_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600">{referral.referrer?.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            referral.diner_tier === 'premium' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-zinc-100 text-zinc-800'
                          }`}>
                            {referral.diner_tier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>


      </div>
    </div>
  )
}