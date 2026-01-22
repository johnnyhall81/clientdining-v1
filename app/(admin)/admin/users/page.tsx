'use client'

import { useState } from 'react'

// Mock user data
const MOCK_USERS = [
  {
    id: 'u1',
    email: 'john.smith@example.com',
    name: 'John Smith',
    role: 'diner',
    diner_tier: 'premium',
    is_professionally_verified: true,
    is_disabled: false,
    created_at: '2025-01-10T10:00:00Z'
  },
  {
    id: 'u2',
    email: 'sarah.jones@example.com',
    name: 'Sarah Jones',
    role: 'diner',
    diner_tier: 'free',
    is_professionally_verified: true,
    is_disabled: false,
    created_at: '2025-01-12T14:30:00Z'
  },
  {
    id: 'u3',
    email: 'michael.brown@example.com',
    name: 'Michael Brown',
    role: 'diner',
    diner_tier: 'free',
    is_professionally_verified: false,
    is_disabled: false,
    created_at: '2025-01-15T09:20:00Z'
  },
  {
    id: 'u4',
    email: 'gm@ledbury.com',
    name: 'General Manager',
    role: 'venue_admin',
    diner_tier: 'free',
    is_professionally_verified: true,
    is_disabled: false,
    created_at: '2025-01-05T08:00:00Z'
  },
  {
    id: 'u5',
    email: 'reservations@ledbury.com',
    name: 'Reservations Lead',
    role: 'venue_admin',
    diner_tier: 'free',
    is_professionally_verified: true,
    is_disabled: false,
    created_at: '2025-01-05T08:00:00Z'
  },
  {
    id: 'u6',
    email: 'emma.wilson@example.com',
    name: 'Emma Wilson',
    role: 'diner',
    diner_tier: 'premium',
    is_professionally_verified: true,
    is_disabled: false,
    created_at: '2025-01-18T16:45:00Z'
  }
]

export default function AdminUsersPage() {
  const [filter, setFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const handleVerify = (userId: string) => {
    console.log('Verifying user:', userId)
    setSelectedUser(null)
  }

  const handleDisable = (userId: string) => {
    console.log('Disabling user:', userId)
    setSelectedUser(null)
  }

  const filteredUsers = MOCK_USERS.filter(user => {
    if (filter === 'all') return true
    if (filter === 'diners') return user.role === 'diner'
    if (filter === 'venue_admins') return user.role === 'venue_admin'
    if (filter === 'premium') return user.diner_tier === 'premium'
    if (filter === 'unverified') return !user.is_professionally_verified
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600">Manage all users on the platform</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Users ({MOCK_USERS.length})
          </button>
          <button
            onClick={() => setFilter('diners')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'diners'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Diners
          </button>
          <button
            onClick={() => setFilter('venue_admins')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'venue_admins'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Venue Admins
          </button>
          <button
            onClick={() => setFilter('premium')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'premium'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Premium
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'unverified'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unverified
          </button>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Details</h2>
            
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <p className="text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Role:</span>
                <p className="text-gray-900 capitalize">{selectedUser.role.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Tier:</span>
                <p className="text-gray-900 capitalize">{selectedUser.diner_tier}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Professionally Verified:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  selectedUser.is_professionally_verified
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedUser.is_professionally_verified ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Account Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  selectedUser.is_disabled
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {selectedUser.is_disabled ? 'Disabled' : 'Active'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {!selectedUser.is_professionally_verified && (
                <button
                  onClick={() => handleVerify(selectedUser.id)}
                  className="btn-primary w-full"
                >
                  ✓ Verify Professionally
                </button>
              )}
              
              {!selectedUser.is_disabled ? (
                <button
                  onClick={() => handleDisable(selectedUser.id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Disable Account
                </button>
              ) : (
                <button
                  onClick={() => handleDisable(selectedUser.id)}
                  className="btn-primary w-full"
                >
                  Enable Account
                </button>
              )}
              
              <button
                onClick={() => setSelectedUser(null)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tier</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Verified</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No users found matching the filter
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'platform_admin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'venue_admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        user.diner_tier === 'premium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.diner_tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.is_professionally_verified ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600">✗</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.is_disabled
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.is_disabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}