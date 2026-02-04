'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'

export default function AdminPage() {
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

  useEffect(() => {
    async function loadStats() {
      const [venues, slots, bookings, users] = await Promise.all([
        supabase.from('venues').select('id, is_active', { count: 'exact' }),
        supabase.from('slots').select('id, status', { count: 'exact' }),
        supabase.from('bookings').select('id, status', { count: 'exact' }),
        supabase.from('profiles').select('user_id, diner_tier', { count: 'exact' }),
      ])

      setStats({
        totalVenues: venues.count || 0,
        activeVenues: venues.data?.filter((v) => v.is_active).length || 0,
        totalSlots: slots.count || 0,
        availableSlots: slots.data?.filter((s) => s.status === 'available').length || 0,
        totalBookings: bookings.count || 0,
        activeBookings: bookings.data?.filter((b) => b.status === 'active').length || 0,
        totalUsers: users.count || 0,
        premiumUsers: users.data?.filter((u) => u.diner_tier === 'premium').length || 0,
      })
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-zinc-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light mb-2">Platform Dashboard</h1>
          <p className="text-zinc-400 text-sm">Overview of your dining platform</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="text-sm text-zinc-500 mb-2">Total Venues</div>
            <div className="text-4xl font-light text-zinc-900 mb-1">{stats.totalVenues}</div>
            <div className="text-xs text-zinc-400">{stats.activeVenues} active</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="text-sm text-zinc-500 mb-2">Available Slots</div>
            <div className="text-4xl font-light text-blue-600 mb-1">{stats.availableSlots}</div>
            <div className="text-xs text-zinc-400">of {stats.totalSlots} total</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="text-sm text-zinc-500 mb-2">Active Bookings</div>
            <div className="text-4xl font-light text-green-600 mb-1">{stats.activeBookings}</div>
            <div className="text-xs text-zinc-400">of {stats.totalBookings} total</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="text-sm text-zinc-500 mb-2">Premium Users</div>
            <div className="text-4xl font-light text-orange-600 mb-1">{stats.premiumUsers}</div>
            <div className="text-xs text-zinc-400">of {stats.totalUsers} users</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <h2 className="text-lg font-light text-zinc-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/venues"
              className="flex items-center justify-center h-20 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-light"
            >
              Manage Venues
            </Link>
            <Link
              href="/admin/slots"
              className="flex items-center justify-center h-20 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-light"
            >
              Manage Slots
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center justify-center h-20 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-light"
            >
              View Bookings
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-center h-20 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-light"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/alerts"
              className="flex items-center justify-center h-20 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-light"
            >
              🔔 Process Alerts
            </Link>
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-center h-20 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-light"
            >
              📊 Activity
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}