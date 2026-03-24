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
  const [menus, setMenus] = useState<{ label: string; url: string }[]>([])

  // Private hire rooms
  type Room = {
    id: string
    name: string
    description: string
    space_type: string
    capacity_dining: number | null
    capacity_standing: number | null
    capacity_boardroom: number | null
    pricing_type: string
    pricing_from: number | null
    pricing_notes: string
    facilities: string[]
    best_for: string[]
    catering: string[]
    images: { url: string; caption: string; is_main: boolean }[]
    display_order: number
    is_active: boolean
  }
  const blankRoom = (): Omit<Room, 'id'> => ({
    name: '',
    description: '',
    space_type: 'private',
    capacity_dining: null,
    capacity_standing: null,
    capacity_boardroom: null,
    pricing_type: 'min_spend',
    pricing_from: null,
    pricing_notes: '',
    facilities: [],
    best_for: [],
    catering: [],
    images: [],
    display_order: 0,
    is_active: true,
  })
  const [rooms, setRooms] = useState<Room[]>([])
  const [editingRoom, setEditingRoom] = useState<(Omit<Room, 'id'> & { id?: string }) | null>(null)
  const [savingRoom, setSavingRoom] = useState(false)
  const [newRoomImageUrl, setNewRoomImageUrl] = useState('')

  const FACILITIES = ['WiFi', 'AV screen', 'PA system', 'Projector', 'Flatscreen TV', 'Natural light', 'Air con', 'Dance floor', 'Terrace', 'Soundproof']
  const BEST_FOR = ['Client dinner', 'Drinks reception', 'Away day', 'Team dinner', 'Board meeting', 'Product launch', 'Celebration']
  const CATERING = ['In-house catering', 'External allowed', 'BYO allowed']

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<VenueImage[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [addingImage, setAddingImage] = useState(false)

  useEffect(() => {
    loadVenue()
    loadGallery()
    loadRooms()
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
    setMenus(data.menus || [])
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

  const loadRooms = async () => {
    const { data } = await supabase
      .from('private_hire_rooms')
      .select('*')
      .eq('venue_id', venueId)
      .order('display_order', { ascending: true })
    setRooms((data || []) as any)
  }

  const handleSaveRoom = async () => {
    if (!editingRoom?.name.trim()) return
    setSavingRoom(true)
    try {
      const payload = {
        venue_id: venueId,
        name: editingRoom.name,
        description: editingRoom.description,
        space_type: editingRoom.space_type,
        capacity_dining: editingRoom.capacity_dining,
        capacity_standing: editingRoom.capacity_standing,
        capacity_boardroom: editingRoom.capacity_boardroom,
        pricing_type: editingRoom.pricing_type,
        pricing_from: editingRoom.pricing_from,
        pricing_notes: editingRoom.pricing_notes,
        facilities: editingRoom.facilities,
        best_for: editingRoom.best_for,
        catering: editingRoom.catering,
        images: editingRoom.images,
        display_order: editingRoom.display_order,
        is_active: editingRoom.is_active,
      }
      if (editingRoom.id) {
        const { error } = await supabase.from('private_hire_rooms').update(payload).eq('id', editingRoom.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('private_hire_rooms').insert(payload)
        if (error) throw error
      }
      await loadRooms()
      setEditingRoom(null)
    } catch (err: any) {
      alert('Failed to save room: ' + err.message)
    } finally {
      setSavingRoom(false)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Delete this room?')) return
    const { error } = await supabase.from('private_hire_rooms').delete().eq('id', roomId)
    if (!error) setRooms(prev => prev.filter(r => r.id !== roomId))
  }

  const toggleRoomFlag = (field: 'facilities' | 'best_for' | 'catering', value: string) => {
    if (!editingRoom) return
    const current = editingRoom[field]
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    setEditingRoom({ ...editingRoom, [field]: updated })
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

        <div>
          <label className="block text-sm font-medium mb-2">Menus</label>
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
                  className="w-40 px-3 py-2 text-sm border rounded-md"
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
                  className="flex-1 px-3 py-2 text-sm border rounded-md"
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
      {/* Private hire rooms */}
      <div className="bg-white rounded-lg border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Private Hire Rooms</h2>
            <p className="text-xs text-zinc-400 mt-1">Each room appears as a card on the venue's private hire tab.</p>
          </div>
          {!editingRoom && (
            <button
              onClick={() => setEditingRoom(blankRoom())}
              className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800"
            >
              + Add room
            </button>
          )}
        </div>

        {/* Room list */}
        {rooms.length === 0 && !editingRoom && (
          <p className="text-sm text-zinc-400">No rooms yet.</p>
        )}
        {rooms.map(room => (
          <div key={room.id} className="flex items-start gap-4 p-4 border rounded-lg bg-zinc-50">
            {room.images?.[0]?.url && (
              <img src={room.images[0].url} alt={room.name} className="w-20 h-16 object-cover rounded flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900">{room.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {[
                  room.capacity_dining ? `${room.capacity_dining} dining` : null,
                  room.capacity_standing ? `${room.capacity_standing} standing` : null,
                  room.pricing_from ? `from £${room.pricing_from.toLocaleString()}` : null,
                ].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setEditingRoom({
                  ...room,
                  facilities: room.facilities || [],
                  best_for: room.best_for || [],
                  catering: room.catering || [],
                  images: room.images || [],
                })}
                className="px-3 py-1.5 text-xs border rounded hover:bg-white transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteRoom(room.id)}
                className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Room editor */}
        {editingRoom && (
          <div className="border rounded-lg p-5 space-y-5 bg-zinc-50">
            <p className="text-sm font-semibold text-zinc-700">{editingRoom.id ? 'Edit room' : 'New room'}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-zinc-600 mb-1">Room name</label>
                <input type="text" value={editingRoom.name} placeholder="e.g. The Drawing Room"
                  onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Space type</label>
                <select value={editingRoom.space_type}
                  onChange={e => setEditingRoom({ ...editingRoom, space_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm">
                  <option value="private">Private space</option>
                  <option value="semi_private">Semi-private</option>
                  <option value="whole_venue">Whole venue</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Display order</label>
                <input type="number" value={editingRoom.display_order}
                  onChange={e => setEditingRoom({ ...editingRoom, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Description</label>
              <textarea value={editingRoom.description} rows={3}
                placeholder="Describe the room — atmosphere, best use, standout features…"
                onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm resize-none" />
            </div>

            {/* Capacity */}
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-2">Capacity</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'capacity_dining', label: 'Dining (seated)' },
                  { key: 'capacity_standing', label: 'Standing' },
                  { key: 'capacity_boardroom', label: 'Boardroom' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[11px] text-zinc-400 mb-1">{label}</label>
                    <input type="number" placeholder="–"
                      value={(editingRoom as any)[key] ?? ''}
                      onChange={e => setEditingRoom({ ...editingRoom, [key]: e.target.value ? parseInt(e.target.value) : null } as any)}
                      className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-2">Pricing</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Type</label>
                  <select value={editingRoom.pricing_type}
                    onChange={e => setEditingRoom({ ...editingRoom, pricing_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm">
                    <option value="min_spend">Min spend</option>
                    <option value="hire_fee">Hire fee</option>
                    <option value="hire_fee_plus_min_spend">Hire fee + min spend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">From (£)</label>
                  <input type="number" placeholder="e.g. 1500"
                    value={editingRoom.pricing_from ?? ''}
                    onChange={e => setEditingRoom({ ...editingRoom, pricing_from: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[11px] text-zinc-400 mb-1">Pricing notes</label>
                  <input type="text" placeholder="e.g. per evening"
                    value={editingRoom.pricing_notes}
                    onChange={e => setEditingRoom({ ...editingRoom, pricing_notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-2">Facilities</p>
              <div className="flex flex-wrap gap-2">
                {FACILITIES.map(f => (
                  <button key={f} type="button"
                    onClick={() => toggleRoomFlag('facilities', f)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      editingRoom.facilities.includes(f)
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >{f}</button>
                ))}
              </div>
            </div>

            {/* Best for */}
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-2">Best for</p>
              <div className="flex flex-wrap gap-2">
                {BEST_FOR.map(f => (
                  <button key={f} type="button"
                    onClick={() => toggleRoomFlag('best_for', f)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      editingRoom.best_for.includes(f)
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >{f}</button>
                ))}
              </div>
            </div>

            {/* Catering */}
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-2">Catering</p>
              <div className="flex flex-wrap gap-2">
                {CATERING.map(f => (
                  <button key={f} type="button"
                    onClick={() => toggleRoomFlag('catering', f)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      editingRoom.catering.includes(f)
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >{f}</button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-2">Room images</p>
              {(editingRoom.images || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {(editingRoom.images || []).map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img.url} alt="" className="w-20 h-14 object-cover rounded border" />
                      {img.is_main && (
                        <span className="absolute top-1 left-1 bg-zinc-900 text-white text-[9px] px-1 rounded">Main</span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                        {!img.is_main && (
                          <button type="button"
                            onClick={() => setEditingRoom({
                              ...editingRoom,
                              images: (editingRoom.images || []).map((im, idx) => ({ ...im, is_main: idx === i }))
                            })}
                            className="text-[9px] text-white bg-zinc-700 px-1.5 py-0.5 rounded"
                          >Set main</button>
                        )}
                        <button type="button"
                          onClick={() => setEditingRoom({
                            ...editingRoom,
                            images: (editingRoom.images || []).filter((_, idx) => idx !== i)
                          })}
                          className="text-[9px] text-white bg-red-600 px-1.5 py-0.5 rounded"
                        >Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input type="text" placeholder="Paste image URL…"
                  value={newRoomImageUrl}
                  onChange={e => setNewRoomImageUrl(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (!newRoomImageUrl.trim()) return
                      const currentImages = editingRoom.images || []
                      const isFirst = currentImages.length === 0
                      setEditingRoom({
                        ...editingRoom,
                        images: [...currentImages, { url: newRoomImageUrl.trim(), caption: '', is_main: isFirst }]
                      })
                      setNewRoomImageUrl('')
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-md text-sm" />
                <button type="button"
                  onClick={() => {
                    if (!newRoomImageUrl.trim()) return
                    const currentImages = editingRoom.images || []
                    const isFirst = currentImages.length === 0
                    setEditingRoom({
                      ...editingRoom,
                      images: [...currentImages, { url: newRoomImageUrl.trim(), caption: '', is_main: isFirst }]
                    })
                    setNewRoomImageUrl('')
                  }}
                  className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800"
                >Add</button>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="room_active" checked={editingRoom.is_active}
                onChange={e => setEditingRoom({ ...editingRoom, is_active: e.target.checked })}
                className="rounded h-4 w-4" />
              <label htmlFor="room_active" className="text-sm text-zinc-600">Active (visible on venue page)</label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleSaveRoom} disabled={savingRoom}
                className="px-6 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 disabled:opacity-50">
                {savingRoom ? 'Saving…' : editingRoom.id ? 'Save changes' : 'Add room'}
              </button>
              <button type="button" onClick={() => { setEditingRoom(null); setNewRoomImageUrl('') }}
                className="px-4 py-2 border text-sm rounded-lg hover:bg-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
