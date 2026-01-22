'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import VenueAgreement from '@/components/agreements/VenueAgreement'

// Mock venue data
const MOCK_VENUES: Record<string, any> = {
  '1': {
    id: '1',
    name: 'The Ledbury',
    area: 'Notting Hill',
    venue_type: 'restaurant',
    description: 'Two Michelin-starred fine dining restaurant.',
    address: '127 Ledbury Road, Notting Hill, London W11 2AQ',
    is_active: true,
    agreement_accepted: true,
    agreement_date: '2025-01-15T10:00:00Z',
    agreement_accepted_by: 'admin@clientdining.com'
  },
  '2': {
    id: '2',
    name: 'Core by Clare Smyth',
    area: 'Notting Hill',
    venue_type: 'restaurant',
    description: 'Three Michelin-starred British cuisine.',
    address: '92 Kensington Park Road, Notting Hill, London W11 2PN',
    is_active: true,
    agreement_accepted: true,
    agreement_date: '2025-01-12T14:30:00Z',
    agreement_accepted_by: 'admin@clientdining.com'
  },
  '3': {
    id: '3',
    name: "Annabel's",
    area: 'Mayfair',
    venue_type: 'club',
    description: 'Exclusive private members\' club.',
    address: '46 Berkeley Square, Mayfair, London W1J 5AT',
    is_active: true,
    agreement_accepted: true,
    agreement_date: '2025-01-10T09:15:00Z',
    agreement_accepted_by: 'admin@clientdining.com'
  },
  '4': {
    id: '4',
    name: 'Gymkhana',
    area: 'Mayfair',
    venue_type: 'restaurant',
    description: 'Michelin-starred Indian cuisine.',
    address: '42 Albemarle Street, Mayfair, London W1S 4JH',
    is_active: true,
    agreement_accepted: true,
    agreement_date: '2025-01-18T11:45:00Z',
    agreement_accepted_by: 'admin@clientdining.com'
  },
  '5': {
    id: '5',
    name: 'The Wolseley',
    area: 'Piccadilly',
    venue_type: 'restaurant',
    description: 'Grand European café-restaurant.',
    address: '160 Piccadilly, St. James\'s, London W1J 9EB',
    is_active: true,
    agreement_accepted: true,
    agreement_date: '2025-01-08T16:20:00Z',
    agreement_accepted_by: 'admin@clientdining.com'
  },
  '6': {
    id: '6',
    name: '5 Hertford Street',
    area: 'Mayfair',
    venue_type: 'club',
    description: 'Exclusive private members\' club.',
    address: '5 Hertford Street, Mayfair, London W1J 7RJ',
    is_active: true,
    agreement_accepted: true,
    agreement_date: '2025-01-20T13:00:00Z',
    agreement_accepted_by: 'admin@clientdining.com'
  }
}

// Mock venue admins
const MOCK_ADMINS = [
  { id: '1', email: 'gm@ledbury.com', name: 'General Manager', is_active: true },
  { id: '2', email: 'reservations@ledbury.com', name: 'Reservations Lead', is_active: true }
]

// Mock slots
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
  }
]

export default function AdminVenueDetailPage() {
  const params = useParams()
  const venueId = params.venueId as string
  const venue = MOCK_VENUES[venueId]
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedVenue, setEditedVenue] = useState(venue)
  const [showAgreement, setShowAgreement] = useState(false)

  if (!venue) {
    return <div>Venue not found</div>
  }

  const handleSave = () => {
    console.log('Saving venue:', editedVenue)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/venues" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Back to Venues
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
          <p className="text-gray-600">{venue.area} • {venue.venue_type}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-primary"
        >
          {isEditing ? 'Cancel' : 'Edit Venue'}
        </button>
      </div>

      {/* Venue Details */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Venue Details</h2>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={editedVenue.name}
                onChange={(e) => setEditedVenue({ ...editedVenue, name: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <input
                type="text"
                value={editedVenue.area}
                onChange={(e) => setEditedVenue({ ...editedVenue, area: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={editedVenue.address}
                onChange={(e) => setEditedVenue({ ...editedVenue, address: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editedVenue.description}
                onChange={(e) => setEditedVenue({ ...editedVenue, description: e.target.value })}
                className="input-field"
                rows={3}
              />
            </div>
            
            <button onClick={handleSave} className="btn-primary">
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Address:</span>
              <p className="text-gray-900">{venue.address}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Description:</span>
              <p className="text-gray-900">{venue.description}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Type:</span>
              <p className="text-gray-900 capitalize">{venue.venue_type}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                venue.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {venue.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Agreement Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Venue Participation Agreement</h2>
          <button 
            onClick={() => setShowAgreement(!showAgreement)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showAgreement ? 'Hide Agreement' : 'View Agreement'}
          </button>
        </div>
        
        {venue.agreement_accepted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-green-600 text-xl">✓</div>
              <div className="flex-1">
                <p className="font-semibold text-green-900 mb-1">Agreement Accepted</p>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Date: {new Date(venue.agreement_date).toLocaleString('en-GB', { 
                    dateStyle: 'long', 
                    timeStyle: 'short' 
                  })}</p>
                  <p>Accepted by: {venue.agreement_accepted_by}</p>
                  <p className="mt-2 text-green-800">
                    <strong>Commission:</strong> 20% on food & beverage (ex. VAT & service)
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-xl">⚠️</div>
              <div>
                <p className="font-semibold text-red-900 mb-1">Agreement Not Accepted</p>
                <p className="text-sm text-red-700">This venue cannot go live until the agreement is accepted.</p>
              </div>
            </div>
          </div>
        )}

        {showAgreement && (
          <div className="mt-6">
            <VenueAgreement showCheckbox={false} />
          </div>
        )}
      </div>

      {/* Venue Admins */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Venue Admins (2 max)</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Manage Admins
          </button>
        </div>
        
        <div className="space-y-3">
          {MOCK_ADMINS.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{admin.name}</p>
                <p className="text-sm text-gray-600">{admin.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                admin.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {admin.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Slots */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Slots</h2>
          <button className="btn-primary text-sm">
            + Add Slot
          </button>
        </div>
        
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
              {MOCK_SLOTS.map((slot) => (
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
                    <button className="text-sm text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Images */}
      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Venue Images</h2>
          <p className="text-sm text-gray-600">
            Upload exactly 2 high-quality images to showcase this venue
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">📸 Image Requirements</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">1. Venue Image (Exterior or Interior)</p>
              <ul className="ml-4 space-y-1 text-blue-700">
                <li>• Shows the venue's atmosphere and setting</li>
                <li>• Used on homepage tiles and search results</li>
                <li>• Aspect ratio: 4:3 landscape preferred</li>
                <li>• Minimum size: 1200px width recommended</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">2. Food/Dish Image</p>
              <ul className="ml-4 space-y-1 text-blue-700">
                <li>• Signature dish or beautifully plated food</li>
                <li>• Used on venue detail page header</li>
                <li>• Aspect ratio: 21:9 ultra-wide preferred</li>
                <li>• Minimum size: 1920px width recommended</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-blue-300">
              <p className="font-medium mb-1">Technical Requirements:</p>
              <ul className="ml-4 space-y-1 text-blue-700">
                <li>• Format: <strong>JPG only</strong></li>
                <li>• File size: Maximum 5MB per image</li>
                <li>• High resolution for best quality</li>
                <li>• Professional photography strongly recommended</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="space-y-6">
            {/* Venue Image Upload */}
            <div>
              <label className="block mb-3">
                <span className="text-sm font-semibold text-gray-900">Venue Image (Exterior/Interior)</span>
                <span className="block text-xs text-gray-600 mt-1">
                  Will be saved as: <code className="bg-gray-200 px-2 py-0.5 rounded">{venue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-venue.jpg</code>
                </span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg"
                className="block w-full text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  file:cursor-pointer cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload a high-quality image showing the venue's atmosphere (exterior facade or beautiful interior shot)
              </p>
            </div>

            {/* Food Image Upload */}
            <div>
              <label className="block mb-3">
                <span className="text-sm font-semibold text-gray-900">Food/Dish Image</span>
                <span className="block text-xs text-gray-600 mt-1">
                  Will be saved as: <code className="bg-gray-200 px-2 py-0.5 rounded">{venue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-food.jpg</code>
                </span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg"
                className="block w-full text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  file:cursor-pointer cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload a stunning image of a signature dish or beautifully plated food
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="btn-primary">
                Upload Images
              </button>
              <p className="text-xs text-gray-500 mt-3">
                <strong>Note:</strong> Images will be automatically renamed and optimized. Existing images will be replaced.
              </p>
            </div>
          </div>
        </div>

        {/* Current Images Preview */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Current Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Venue Image</p>
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`/venues/${venue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-venue.jpg`}
                  alt={`${venue.name} venue`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%239ca3af"%3ENo image uploaded%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <code>{venue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-venue.jpg</code>
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Food Image</p>
              <div className="aspect-[21/9] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`/venues/${venue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-food.jpg`}
                  alt={`${venue.name} food`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="840" height="360"%3E%3Crect fill="%23e5e7eb" width="840" height="360"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%239ca3af"%3ENo image uploaded%3C/text%3E%3C/svg%3E%3C/svg%3E'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <code>{venue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-food.jpg</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}