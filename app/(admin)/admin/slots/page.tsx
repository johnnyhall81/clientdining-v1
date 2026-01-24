'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Venue } from '@/lib/supabase'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'

export default function AdminSlotsPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedVenue, setSelectedVenue] = useState<string>('')
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Bulk creation form
  const [bulkForm, setBulkForm] = useState({
    startDate: '',
    endDate: '',
    times: ['19:00'],
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    partyMin: 2,
    partyMax: 4,
    slotTier: 'free' as 'free' | 'premium',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadVenues()
  }, [])

  useEffect(() => {
    if (selectedVenue) {
      loadSlots()
    }
  }, [selectedVenue])

  const loadVenues = async () => {
    const { data } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    setVenues(data || [])
  }

  const loadSlots = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('slots')
      .select('*')
      .eq('venue_id', selectedVenue)
      .gte('start_at', new Date().toISOString())
      .order('start_at')
      .limit(50)
    
    setSlots(data || [])
    setLoading(false)
  }

  const handleBulkCreate = async () => {
    if (!selectedVenue || !bulkForm.startDate || !bulkForm.endDate) {
      alert('Please select venue and date range')
      return
    }

    setCreating(true)

    try {
      const start = new Date(bulkForm.startDate)
      const end = new Date(bulkForm.endDate)
      const slotsToCreate = []

      // Loop through each day in range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay()
        
        // Check if this day is selected
        if (bulkForm.daysOfWeek.includes(dayOfWeek)) {
          // Create slot for each time
          bulkForm.times.forEach(time => {
            const [hours, minutes] = time.split(':')
            const slotDate = new Date(d)
            slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
            
            slotsToCreate.push({
              venue_id: selectedVenue,
              start_at: slotDate.toISOString(),
              duration_minutes: 120,
              party_min: bulkForm.partyMin,
              party_max: bulkForm.partyMax,
              slot_tier: bulkForm.slotTier,
              status: 'available',
            })
          })
        }
      }

      const { error } = await supabase
        .from('slots')
        .insert(slotsToCreate)

      if (error) throw error

      alert(`Created ${slotsToCreate.length} slots!`)
      loadSlots()
    } catch (error: any) {
      alert('Failed to create slots: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const deleteSlot = async (slotId: string) => {
    if (!confirm('Delete this slot?')) return

    const { error } = await supabase
      .from('slots')
      .delete()
      .eq('id', slotId)

    if (error) {
      alert('Failed to delete')
    } else {
      loadSlots()
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Slots</h1>

      {/* Venue Selector */}
      <div className="bg-white rounded-lg border p-6">
        <label className="block text-sm font-medium mb-2">Select Venue</label>
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Choose a venue...</option>
          {venues.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      {selectedVenue && (
        <>
          {/* Bulk Create */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Bulk Create Slots</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={bulkForm.startDate}
                  onChange={(e) => setBulkForm({ ...bulkForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={bulkForm.endDate}
                  onChange={(e) => setBulkForm({ ...bulkForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Days of Week</label>
              <div className="flex gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const days = bulkForm.daysOfWeek.includes(i)
                        ? bulkForm.daysOfWeek.filter(d => d !== i)
                        : [...bulkForm.daysOfWeek, i]
                      setBulkForm({ ...bulkForm, daysOfWeek: days })
                    }}
                    className={`px-3 py-1 rounded ${
                      bulkForm.daysOfWeek.includes(i)
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Times (comma separated)</label>
              <input
                type="text"
                value={bulkForm.times.join(', ')}
                onChange={(e) => setBulkForm({ 
                  ...bulkForm, 
                  times: e.target.value.split(',').map(t => t.trim()) 
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="19:00, 19:30, 20:00"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Party Min</label>
                <input
                  type="number"
                  value={bulkForm.partyMin}
                  onChange={(e) => setBulkForm({ ...bulkForm, partyMin: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Party Max</label>
                <input
                  type="number"
                  value={bulkForm.partyMax}
                  onChange={(e) => setBulkForm({ ...bulkForm, partyMax: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tier</label>
                <select
                  value={bulkForm.slotTier}
                  onChange={(e) => setBulkForm({ ...bulkForm, slotTier: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleBulkCreate}
              disabled={creating}
              className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Slots'}
            </button>
          </div>

          {/* Existing Slots */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Slots (next 50)</h2>
            
            {loading ? (
              <p>Loading...</p>
            ) : slots.length === 0 ? (
              <p className="text-gray-500">No upcoming slots</p>
            ) : (
              <div className="space-y-2">
                {slots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex-1">
                      <span className="font-medium">
                        {formatSlotDate(slot.start_at)} {formatSlotTime(slot.start_at)}
                      </span>
                      <span className="text-sm text-gray-600 ml-4">
                        {slot.party_min}-{slot.party_max} guests
                      </span>
                      <span className={`text-xs ml-2 ${
                        slot.slot_tier === 'premium' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {slot.slot_tier}
                      </span>
                      <span className={`text-xs ml-2 ${
                        slot.status === 'available' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                    {slot.status === 'available' && (
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
