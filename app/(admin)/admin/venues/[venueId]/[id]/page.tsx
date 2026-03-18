'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Venue } from '@/lib/supabase'

export default function EditVenuePage() {
  const router = useRouter()
  const params = useParams()
  const venueId = params.id as string
  
  const [venue, setVenue] = useState<Venue | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    area: '',
    venue_type: 'restaurant' as 'restaurant' | 'club',
    description: '',
    address: '',
    image_hero: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [menus, setMenus] = useState<{ label: string; url: string }[]>([])

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
      image_hero: data.image_hero || '',
    })
    setMenus(data.menus || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('venues')
        .update({
          ...formData,
          menus: menus.filter(m => m.label && m.url).length > 0
            ? menus.filter(m => m.label && m.url)
            : null,
        })
        .eq('id', venueId)
      if (error) throw error
      alert('Venue updated successfully!')
      router.push('/admin/venues')
    } catch (error: any) {
      alert('Failed to update venue: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this venue?')) return
    try {
      const { error } = await supabase.from('venues').delete().eq('id', venueId)
      if (error) throw error
      router.push('/admin/venues')
    } catch (error: any) {
      alert('Failed to delete venue: ' + error.message)
    }
  }

  if (loading) return <div className="text-center py-12">Loading venue...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Venue</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name *</label>
          <input type="text" required value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
          <input type="text" required value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
            <input type="text" required value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <select required value={formData.venue_type}
              onChange={(e) => setFormData({ ...formData, venue_type: e.target.value as 'restaurant' | 'club' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="restaurant">Restaurant</option>
              <option value="club">Private Club</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea required value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input type="text" value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image URL</label>
          <input type="text" value={formData.image_hero}
            onChange={(e) => setFormData({ ...formData, image_hero: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Menus</label>
          <div className="space-y-2">
            {menus.map((menu, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Dinner Menu)"
                  value={menu.label}
                  onChange={e => {
                    const updated = [...menus]
                    updated[i] = { ...updated[i], label: e.target.value }
                    setMenus(updated)
                  }}
                  className="w-40 px-3 py-2 text-sm border border-gray-300 rounded-md"
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={menu.url}
                  onChange={e => {
                    const updated = [...menus]
                    updated[i] = { ...updated[i], url: e.target.value }
                    setMenus(updated)
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setMenus(menus.filter((_, idx) => idx !== i))}
                  className="px-2 text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
            {menus.length < 5 && (
              <button
                type="button"
                onClick={() => setMenus([...menus, { label: '', url: '' }])}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add menu
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving}
            className="flex-1 bg-zinc-900 text-white py-2 px-4 rounded-lg hover:bg-zinc-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin/venues')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}
