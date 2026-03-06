'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Venue, VenueImage } from '@/lib/supabase'

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
    private_hire_available: false,
    requires_guest_names: false,
    address: '',
    postcode: '',
    phone: '',
    booking_email: '',
    image_hero: '',
    logo_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<VenueImage[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [addingImage, setAddingImage] = useState(false)

  useEffect(() => {
    loadVenue()
    loadGallery()
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
      private_hire_available: data.private_hire_available || false,
      requires_guest_names: data.requires_guest_names || false,
      address: data.address || '',
      postcode: data.postcode || '',
      phone: data.phone || '',
      booking_email: data.booking_email || '',
      image_hero: data.image_hero || '',
      logo_url: (data as any).logo_url || '',
    })
    setLoading(false)
  }

  const loadGallery = async () => {
    const { data } = await supabase
      .from('venue_images')
      .select('*')
      .eq('venue_id', venueId)
      .order('sort_order', { ascending: true })
    setGalleryImages(data || [])
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
      alert('Failed to delete: ' + error.message)
    }
  }

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return
    setAddingImage(true)
    try {
      const nextOrder = galleryImages.length > 0
        ? Math.max(...galleryImages.map(i => i.sort_order)) + 1
        : 0
      const { data, error } = await supabase
        .from('venue_images')
        .insert({ venue_id: venueId, url: newImageUrl.trim(), sort_order: nextOrder })
        .select()
        .single()
      if (error) throw error
      setGalleryImages(prev => [...prev, data])
      setNewImageUrl('')
    } catch (error: any) {
      alert('Failed to add image: ' + error.message)
    } finally {
      setAddingImage(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Remove this image?')) return
    const { error } = await supabase.from('venue_images').delete().eq('id', imageId)
    if (!error) setGalleryImages(prev => prev.filter(i => i.id !== imageId))
  }

  const handleMoveImage = async (imageId: string, direction: 'up' | 'down') => {
    const index = galleryImages.findIndex(i => i.id === imageId)
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === galleryImages.length - 1) return

    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...galleryImages]
    const a = { ...updated[index], sort_order: updated[swapIndex].sort_order }
    const b = { ...updated[swapIndex], sort_order: updated[index].sort_order }
    updated[index] = a
    updated[swapIndex] = b
    updated.sort((x, y) => x.sort_order - y.sort_order)
    setGalleryImages(updated)

    // Persist both swapped rows
    await Promise.all([
      supabase.from('venue_images').update({ sort_order: a.sort_order }).eq('id', a.id),
      supabase.from('venue_images').update({ sort_order: b.sort_order }).eq('id', b.id),
    ])
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Venue</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">

        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input type="text" required value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <input type="text" required value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Area</label>
            <input type="text" required value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select value={formData.venue_type}
              onChange={(e) => setFormData({ ...formData, venue_type: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md">
              <option value="restaurant">Restaurant</option>
              <option value="club">Club</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea required value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={8}
            placeholder="Enter description. Press Enter for new paragraphs."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" />
          <p className="text-xs text-gray-500 mt-1">Tip: Press Enter twice for paragraph breaks</p>
          {formData.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Preview:</p>
              <div className="text-gray-700 whitespace-pre-line">{formData.description}</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 py-2">
          <input type="checkbox" id="private_hire" checked={formData.private_hire_available}
            onChange={(e) => setFormData({ ...formData, private_hire_available: e.target.checked })}
            className="rounded h-4 w-4" />
          <label htmlFor="private_hire" className="text-sm font-medium">Private hire available</label>
        </div>

        <div className="flex items-center gap-2 py-2">
          <input type="checkbox" id="requires_guest_names" checked={formData.requires_guest_names}
            onChange={(e) => setFormData({ ...formData, requires_guest_names: e.target.checked })}
            className="rounded h-4 w-4" />
          <label htmlFor="requires_guest_names" className="text-sm font-medium">Requires guest names at booking</label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          <input type="text" value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Postcode</label>
            <input type="text" placeholder="W1K 1AB" value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
              className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input type="tel" placeholder="+44 20 1234 5678" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Booking Email</label>
          <input type="email" placeholder="reservations@venue.com" value={formData.booking_email}
            onChange={(e) => setFormData({ ...formData, booking_email: e.target.value })}
            className="w-full px-3 py-2 border rounded-md" />
        </div>

        {/* Hero image */}
        <div>
          <label className="block text-sm font-medium mb-1">Hero Image URL</label>
          <p className="text-xs text-zinc-400 mb-2">Shown on venue cards and as the first image in the gallery</p>
          <input type="text" placeholder="https://...supabase.co/storage/v1/object/public/venue-images/venues/hero.jpg"
            value={formData.image_hero}
            onChange={(e) => setFormData({ ...formData, image_hero: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm" />
          {formData.image_hero && (
            <div className="mt-2 relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-100">
              <img src={formData.image_hero} alt="Hero preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue Logo URL (white SVG)</label>
          <p className="text-xs text-zinc-400 mb-2">White SVG overlaid on the hero image. Upload to venue-images bucket.</p>
          <input type="text" placeholder="https://...supabase.co/storage/v1/object/public/venue-images/logo_white.svg"
            value={(formData as any).logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value } as any)}
            className="w-full px-3 py-2 border rounded-md text-sm" />
          {(formData as any).logo_url && (
            <div className="mt-2 relative h-16 w-full rounded-lg overflow-hidden bg-zinc-800 flex items-center px-4">
              <img src={(formData as any).logo_url} alt="Logo preview" className="h-8 w-auto object-contain" />
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-zinc-900 text-white py-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin/venues')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Delete
          </button>
        </div>
      </form>

      {/* Gallery image manager — separate from the main form */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Gallery Images</h2>
          <p className="text-xs text-zinc-400 mt-1">These appear in the swipeable gallery on the venue page, after the hero image. Drag order using the arrows.</p>
        </div>

        {/* Existing images */}
        {galleryImages.length === 0 ? (
          <p className="text-sm text-zinc-400">No gallery images yet.</p>
        ) : (
          <div className="space-y-3">
            {galleryImages.map((img, idx) => (
              <div key={img.id} className="flex items-center gap-3 p-3 border rounded-lg bg-zinc-50">
                <div className="relative w-20 h-14 rounded overflow-hidden bg-zinc-200 flex-shrink-0">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500 truncate">{img.url}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleMoveImage(img.id, 'up')} disabled={idx === 0}
                    className="p-1 rounded hover:bg-zinc-200 disabled:opacity-20" title="Move up">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                  </button>
                  <button onClick={() => handleMoveImage(img.id, 'down')} disabled={idx === galleryImages.length - 1}
                    className="p-1 rounded hover:bg-zinc-200 disabled:opacity-20" title="Move down">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button onClick={() => handleDeleteImage(img.id)}
                    className="p-1 rounded hover:bg-red-100 text-red-500 ml-1" title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new image */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Paste full Supabase image URL..."
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage() }}}
            className="flex-1 px-3 py-2 border rounded-md text-sm"
          />
          <button
            type="button"
            onClick={handleAddImage}
            disabled={addingImage || !newImageUrl.trim()}
            className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 disabled:opacity-50"
          >
            {addingImage ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
