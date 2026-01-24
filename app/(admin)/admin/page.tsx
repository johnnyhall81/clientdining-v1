'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalVenues: 0,
    totalSlots: 0,
    availableSlots: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalUsers: 0,
    premiumUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      checkAdminAndLoadStats()
    }
  }, [user])

  const checkAdminAndLoadStats = async () => {
    if (!user) return

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'platform_admin') {
      router.push('/home')
      return
    }

    setIsAdmin(true)

    // Load stats
    const [venues, slots, bookings, users] = await Promise.all([
      supabase.from('venues').select('id', { count: 'exact', head: true }),
      supabase.from('slots').select('id, status', { count: 'exact' }),
      supabase.from('bookings').select('id, status', { count: 'exact' }),
      supabase.from('profiles').select('id, tier', { count: 'exact' }),
    ])

    setStats({
      totalVenues: venues.count || 0,
      totalSlots: slots.data?.length || 0,
      availableSlots: slots.data?.filter(s => s.status === 'available').length || 0,
      totalBookings: bookings.count || 0,
      activeBookings: bookings.data?.filter(b => b.status === 'active').length || 0,
      totalUsers: users.count || 0,
      premiumUsers: users.data?.filter(u => u.tier === 'premium').length || 0,
    })

    setLoading(false)
  }

  if (loading || !isAdmin) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Venues"
          value={stats.totalVenues}
          subtitle="Total venues"
          color="blue"
        />
        <StatCard
          title="Slots"
          value={`${stats.availableSlots} / ${stats.totalSlots}`}
          subtitle="Available / Total"
          color="green"
        />
        <StatCard
          title="Bookings"
          value={`${stats.activeBookings} / ${stats.totalBookings}`}
          subtitle="Active / Total"
          color="purple"
        />
        <StatCard
          title="Users"
          value={`${stats.premiumUsers} / ${stats.totalUsers}`}
          subtitle="Premium / Total"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admin/venues')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-900 transition-colors text-left"
          >
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-semibold text-gray-900">Manage Venues</div>
            <div className="text-sm text-gray-600">Add or edit venues</div>
          </button>

          <button
            onClick={() => router.push('/admin/slots')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-900 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold text-gray-900">Manage Slots</div>
            <div className="text-sm text-gray-600">Create availability</div>
          </button>

          <button
            onClick={() => router.push('/admin/bookings')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-900 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold text-gray-900">View Bookings</div>
            <div className="text-sm text-gray-600">All platform bookings</div>
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, color }: {
  title: string
  value: string | number
  subtitle: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  )
}
