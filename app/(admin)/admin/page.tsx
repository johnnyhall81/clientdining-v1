'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVenues: 0,
    activeVenues: 0,
    totalSlots: 0,
    availableSlots: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalUsers: 0,
    premiumUsers: 0,
  })
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [venues, slots, bookings, users] = await Promise.all([
        supabase.from('venues').select('id, is_active', { count: 'exact' }),
        supabase.from('slots').select('id, status', { count: 'exact' }),
        supabase.from('bookings').select('id, status', { count: 'exact' }),
        supabase.from('profiles').select('user_id, diner_tier', { count: 'exact' }),
      ])

      setStats({
        totalVenues: venues.count || 0,
        activeVenues: venues.data?.filter(v => v.is_active).length || 0,
        totalSlots: slots.count || 0,
        availableSlots: slots.data?.filter(s => s.status === 'available').length || 0,
        totalBookings: bookings.count || 0,
        activeBookings: bookings.data?.filter(b => b.status === 'active').length || 0,
        totalUsers: users.count || 0,
        premiumUsers: users.data?.filter(u => u.diner_tier === 'premium').length || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessAlerts = async () => {
    if (!confirm('Process all pending alert notifications?')) return

    setProcessing(true)
    try {
      const response = await fetch('/api/alerts/process')
      const data = await response.json()
      
      if (response.ok) {
        alert(`Success! ${data.message}`)
      } else {
        alert(`Error: ${data.error || 'Failed to process alerts'}`)
      }
    } catch (error) {
      console.error('Error processing alerts:', error)
      alert('Failed to process alerts')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your dining platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Venues</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalVenues}</div>
          <div className="text-sm text-gray-500 mt-1">{stats.activeVenues} active</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Available Slots</div>
          <div className="text-3xl font-bold text-blue-600">{stats.availableSlots}</div>
          <div className="text-sm text-gray-500 mt-1">of {stats.totalSlots} total</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Active Bookings</div>
          <div className="text-3xl font-bold text-green-600">{stats.activeBookings}</div>
          <div className="text-sm text-gray-500 mt-1">of {stats.totalBookings} total</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Premium Users</div>
          <div className="text-3xl font-bold text-orange-600">{stats.premiumUsers}</div>
          <div className="text-sm text-gray-500 mt-1">of {stats.totalUsers} users</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/venues"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Manage Venues
          </Link>
          <Link
            href="/admin/slots"
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            Manage Slots
          </Link>
          <Link
            href="/admin/bookings"
            className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
          >
            View Bookings
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
          >
            Manage Users
          </Link>
          <button
            onClick={handleProcessAlerts}
            disabled={processing}
            className="flex items-center justify-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 font-medium disabled:opacity-50"
          >
            {processing ? 'Processing...' : '🔔 Process Alerts'}
          </button>
        </div>
      </div>
    </div>
  )
}
