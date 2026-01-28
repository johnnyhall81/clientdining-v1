'use client'

import { useEffect, useState } from 'react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all')

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    setLoading(true)

    try {
      // Add timestamp to prevent caching
      const response = await fetch(`/api/admin/users?t=${Date.now()}`)
      const data = await response.json()
      
      if (data.users) {
        let filtered = data.users
        if (filter === 'free') {
          filtered = filtered.filter((u: any) => u.diner_tier === 'free')
        } else if (filter === 'premium') {
          filtered = filtered.filter((u: any) => u.diner_tier === 'premium')
        }
        setUsers(filtered)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserTier = async (userId: string, newTier: 'free' | 'premium') => {
    if (!confirm(`Change user tier to ${newTier}?`)) return

    try {
      const response = await fetch('/api/admin/users/update-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier: newTier }),
      })

      if (response.ok) {
        alert('User tier updated successfully')
        await loadUsers()
      } else {
        alert('Failed to update tier')
      }
    } catch (error) {
      console.error('Error updating tier:', error)
      alert('Failed to update tier')
    }
  }

  const updateUserRole = async (userId: string, newRole: 'diner' | 'venue_manager' | 'platform_admin') => {
    if (!confirm(`Change user role to ${newRole}?`)) return

    try {
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        alert('User role updated successfully')
        await loadUsers()
      } else {
        alert('Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users/toggle-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verified: !currentStatus }),
      })

      if (response.ok) {
        await loadUsers()
      } else {
        alert('Failed to update verification')
      }
    } catch (error) {
      console.error('Error updating verification:', error)
      alert('Failed to update verification')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts, tiers, and permissions</p>
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
            All Users ({users.length})
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
        </nav>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member Since</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
 


 <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {/* Profile Picture */}
                    {user.avatar_url ? (
                      <a 
                        href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(user.full_name || user.email || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || 'User'}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                        <span className="text-gray-600 text-sm font-medium">
                          {(user.full_name?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Name with LinkedIn badge */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{user.full_name || 'N/A'}</span>
                 
                 
                      {user.is_professionally_verified && user.avatar_url && (
                        <a
                          href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(user.full_name || user.email || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Search on LinkedIn"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}

                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>



                        </a>
                      )}
                    </div>
                  </div>
                </td>
 






                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.diner_tier}
                    onChange={(e) => updateUserTier(user.user_id, e.target.value as 'free' | 'premium')}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.user_id, e.target.value as any)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="diner">Diner</option>
                    <option value="venue_manager">Venue Manager</option>
                    <option value="platform_admin">Platform Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleVerification(user.user_id, user.is_professionally_verified)}
                    className={`text-sm px-3 py-1 rounded-full cursor-pointer transition-colors ${
                      user.is_professionally_verified
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {user.is_professionally_verified ? '✓ Verified' : 'Not Verified'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}