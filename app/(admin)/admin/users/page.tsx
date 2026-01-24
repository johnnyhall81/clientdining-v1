'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  tier: string
  is_professionally_verified: boolean
  subscription_status: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all')

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    setLoading(true)

    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter === 'free') {
      query = query.eq('tier', 'free')
    } else if (filter === 'premium') {
      query = query.eq('tier', 'premium')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading users:', error)
    } else {
      setUsers(data || [])
    }

    setLoading(false)
  }

  const updateUserTier = async (userId: string, newTier: 'free' | 'premium') => {
    if (!confirm(`Change user tier to ${newTier}?`)) return

    const { error } = await supabase
      .from('profiles')
      .update({ tier: newTier })
      .eq('id', userId)

    if (error) {
      alert('Failed to update tier: ' + error.message)
    } else {
      alert('User tier updated successfully')
      loadUsers()
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) return

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      alert('Failed to update role: ' + error.message)
    } else {
      alert('User role updated successfully')
      loadUsers()
    }
  }

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_professionally_verified: !currentStatus,
        verified_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', userId)

    if (error) {
      alert('Failed to update verification: ' + error.message)
    } else {
      loadUsers()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">View and manage all platform users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Premium Users</div>
          <div className="text-2xl font-bold text-orange-600">
            {users.filter(u => u.tier === 'premium').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Free Users</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.tier === 'free').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setFilter('premium')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'premium'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Premium
          </button>
          <button
            onClick={() => setFilter('free')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'free'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Free
          </button>
        </nav>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-center py-12">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No users found</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="diner">Diner</option>
                      <option value="venue_admin">Venue Admin</option>
                      <option value="platform_admin">Platform Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.tier}
                      onChange={(e) => updateUserTier(user.id, e.target.value as any)}
                      className={`text-sm border rounded px-2 py-1 ${
                        user.tier === 'premium'
                          ? 'border-orange-300 text-orange-700'
                          : 'border-green-300 text-green-700'
                      }`}
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleVerification(user.id, user.is_professionally_verified)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_professionally_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.is_professionally_verified ? 'Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <span className="text-xs text-gray-400">
                      {user.subscription_status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
