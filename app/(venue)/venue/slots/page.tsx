'use client'

import { useState } from 'react'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'

// Mock slots data
const MOCK_SLOTS = [
  {
    id: 's1',
    start_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 2,
    party_max: 4,
    slot_tier: 'free',
    status: 'available'
  },
  {
    id: 's2',
    start_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 2,
    party_max: 6,
    slot_tier: 'premium',
    status: 'available'
  },
  {
    id: 's3',
    start_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 4,
    party_max: 6,
    slot_tier: 'free',
    status: 'booked'
  },
  {
    id: 's4',
    start_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 2,
    party_max: 4,
    slot_tier: 'premium',
    status: 'available'
  }
]

export default function VenueSlotsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    party_min: '2',
    party_max: '4'
  })

  const handleAddSlot = () => {
    console.log('Adding slot:', newSlot)
    setShowAddForm(false)
    setNewSlot({ date: '', time: '', party_min: '2', party_max: '4' })
  }

  const handleRemoveSlot = (slotId: string) => {
    if (!confirm('Are you sure you want to remove this slot?')) {
      return
    }
    console.log('Removing slot:', slotId)
  }

  const availableSlots = MOCK_SLOTS.filter(s => s.status === 'available')
  const bookedSlots = MOCK_SLOTS.filter(s => s.status === 'booked')

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Availability</h1>
            <p className="text-gray-600">Manage your venue's available slots</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Add Availability
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Slots</div>
            <div className="text-3xl font-bold text-gray-900">{MOCK_SLOTS.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Available</div>
            <div className="text-3xl font-bold text-green-600">{availableSlots.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Booked</div>
            <div className="text-3xl font-bold text-blue-600">{bookedSlots.length}</div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can add or remove availability slots. Slot tiers (Free/Premium) are set by Platform Admin. You cannot remove booked slots - cancel the booking first.
          </p>
        </div>

        {/* Slots Table */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Slots</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Party Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tier</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SLOTS.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No slots added yet. Click "Add Availability" to create your first slot.
                    </td>
                  </tr>
                ) : (
                  MOCK_SLOTS.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()).map((slot) => (
                    <tr key={slot.id} className="border-b border-gray-100">
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
                        {slot.status === 'available' ? (
                          <button
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">Cannot remove</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={() => setShowAddForm(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Availability</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Guests
                  </label>
                  <select
                    value={newSlot.party_min}
                    onChange={(e) => setNewSlot({ ...newSlot, party_min: e.target.value })}
                    className="input-field"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="8">8</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Guests
                  </label>
                  <select
                    value={newSlot.party_max}
                    onChange={(e) => setNewSlot({ ...newSlot, party_max: e.target.value })}
                    className="input-field"
                  >
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="8">8</option>
                    <option value="10">10</option>
                    <option value="12">12</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Slot tier (Free/Premium) will be set to Free by default. Platform Admin can change it later.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddSlot}
                disabled={!newSlot.date || !newSlot.time}
                className="btn-primary flex-1"
              >
                Add Slot
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}