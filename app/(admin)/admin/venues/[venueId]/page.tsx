'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Venue } from '@/lib/supabase'

export default function EditVenuePage() {
  const router = useRouter()
  const params = useParams()
  const venueId = params.venueId as string
  
  const [venue, setVenue] = useState<Venue | null>(null)
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadVenue()
  }, [venueId])

  const loadVenue = async () => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .single()

    if (error) {
      console.error('Error loading venue:', error)
      alert('Failed to load venue')
      router.push('/admin/venues')
      return
    }

    setVenue(data)
    setFormData({
      name: data.name,
      slug: data.slug,
      area: data.area,
      venue_type: data.venue_type,
      description: data.description,
      address: data.address || '',
      image_venue: data.image_venue || '',
      image_food: data.image_food || '',
    })
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('venues')
        .update(formData)
        .eq('id', venueId)

      if (error) throw error

      alert('Venue updated successfully!')
      router.push('/admin/venues')
    } catch (error: any) {
      console.error('Error updating venue:', error)
      alert('Failed to update venue: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this venue?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId)

      if (error) throw error

      alert('Venue deleted!')
      router.push('/admin/venues')
    } catch (error: any) {
      alert('Failed to delete: ' + error.message)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Venue</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Area</label>
            <input
              type="text"
              required
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={formData.venue_type}
              onChange={(e) => setFormData({ ...formData, venue_type: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="restaurant">Restaurant</option>
              <option value="club">Club</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={8}
            placeholder="Enter description. Press Enter for new paragraphs."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Press Enter twice for paragraph breaks
          </p>
          
          {/* Preview */}
          {formData.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Preview:</p>
              <div className="text-gray-700 whitespace-pre-line">
                {formData.description}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/venues')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}
