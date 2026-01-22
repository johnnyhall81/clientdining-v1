'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'

// Mock data - would come from Supabase
const MOCK_SLOTS = [
  {
    id: 's1',
    venueName: 'The Ledbury',
    venueId: '1',
    start_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 2,
    party_max: 4,
    slot_tier: 'free',
    status: 'available'
  },
  {
    id: 's2',
    venueName: 'Gymkhana',
    venueId: '4',
    start_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 2,
    party_max: 6,
    slot_tier: 'premium',
    status: 'available'
  },
  {
    id: 's3',
    venueName: 'The Wolseley',
    venueId: '5',
    start_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 2,
    party_max: 4,
    slot_tier: 'free',
    status: 'booked'
  },
  {
    id: 's4',
    venueName: "Annabel's",
    venueId: '3',
    start_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 4,
    party_max: 6,
    slot_tier: 'premium',
    status: 'available'
  }
]

export default function AdminSlotsPage() {
  const [filter, setFilter] = useState('all')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [newTier, setNewTier] = useState<'free' | 'premium'>('free')

  const handleChangeTier = (slotId: string) => {
    console.log('Changing tier for slot:', slotId, 'to', newTier)
    setSelectedSlot(null)
  }

  const filteredSlots = MOCK_SLOTS.filter(slot => {
    if (filter === 'all') return true
    if (filter === 'free') return slot.slot_tier === 'free'
    if (filter === 'premium') return slot.slot_tier === 'premium'
    if (filter === 'available') return slot.status === 'available'
    if (filter === 'booked') return slot.status === 'booked'
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Slots Management</h1>
        <p className="text-gray-600">Manage slot tiers and availability across all venues</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Slots
          </button>
          <button
            onClick={() => setFilter('free')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'free'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Free Tier
          </button>
          <button
            onClick={() => setFilter('premium')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'premium'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Premium Tier
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'available'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter('booked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'booked'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Booked
          </button>
        </div>
      </div>

      {/* Tier Change Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Change Slot Tier</h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the new tier for this slot:
              </p>
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="tier"
                    value="free"
                    checked={newTier === 'free'}
                    onChange={(e) => setNewTier(e.target.value as 'free' | 'premium')}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Free Tier</div>
                    <div className="text-sm text-gray-600">Available to all users</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="tier"
                    value="premium"
                    checked={newTier === 'premium'}
                    onChange={(e) => setNewTier(e.target.value as 'free' | 'premium')}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Premium Tier</div>
                    <div className="text-sm text-gray-600">Requires premium subscription</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleChangeTier(selectedSlot)}
                className="btn-primary flex-1"
              >
                Update Tier
              </button>
              <button
                onClick={() => setSelectedSlot(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slots Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Venue</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date & Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Party Size</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tier</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No slots found matching the filter
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot) => (
                  <tr key={slot.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/venues/${slot.venueId}`}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {slot.venueName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatSlotDate(slot.start_at)} at {formatSlotTime(slot.start_at)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {slot.party_min === slot.party_max
                        ? `${slot.party_min}`
                        : `${slot.party_min}-${slot.party_max}`} guests
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        slot.slot_tier === 'premium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {slot.slot_tier === 'premium' ? '⭐ Premium' : '✓ Free'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        slot.status === 'available'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {slot.status === 'available' ? 'Available' : 'Booked'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedSlot(slot.id)
                          setNewTier(slot.slot_tier)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Change Tier
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