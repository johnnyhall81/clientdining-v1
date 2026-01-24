'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function NewVenuePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    area: '',
    venue_type: 'restaurant' as 'restaurant' | 'club',
    description: '',
    address: '',
    image_venue: '',
    image_food: '',
  })
  const [saving, setSaving] = useState(false)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('venues')
        .insert({
          ...formData,
          is_active: true,
        })

      if (error) throw error

      alert('Venue created successfully!')
      router.push('/admin/venues')
    } catch (error: any) {
      console.error('Error creating venue:', error)
      alert('Failed to create venue: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Venue</h1>
        <p className="text-gray-600 mt-2">Create a new venue on the platform</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g. The Ledbury"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (auto-generated)
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            placeholder="the-ledbury"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area *
            </label>
            <input
              type="text"
              required
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. Notting Hill"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              required
              value={formData.venue_type}
              onChange={(e) => setFormData({ ...formData, venue_type: e.target.value as 'restaurant' | 'club' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="restaurant">Restaurant</option>
              <option value="club">Private Club</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Brief description of the venue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Full address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue Image URL
          </label>
          <input
            type="text"
            value={formData.image_venue}
            onChange={(e) => setFormData({ ...formData, image_venue: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="/venues/venue-name.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Image URL
          </label>
          <input
            type="text"
            value={formData.image_food}
            onChange={(e) => setFormData({ ...formData, image_food: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="/venues/food-name.jpg"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Venue'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/venues')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
