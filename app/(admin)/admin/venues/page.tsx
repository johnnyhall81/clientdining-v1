'use client'

import { useState } from 'react'
import Link from 'next/link'
import VenueAgreement from '@/components/agreements/VenueAgreement'

// Mock data - would come from Supabase
const MOCK_VENUES = [
  {
    id: '1',
    name: 'The Ledbury',
    area: 'Notting Hill',
    venue_type: 'restaurant',
    is_active: true,
    slot_count: 12,
    admin_count: 2,
    agreement_accepted: true,
    agreement_date: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Core by Clare Smyth',
    area: 'Notting Hill',
    venue_type: 'restaurant',
    is_active: true,
    slot_count: 8,
    admin_count: 2,
    agreement_accepted: true,
    agreement_date: '2025-01-12T14:30:00Z'
  },
  {
    id: '3',
    name: "Annabel's",
    area: 'Mayfair',
    venue_type: 'club',
    is_active: true,
    slot_count: 6,
    admin_count: 2,
    agreement_accepted: true,
    agreement_date: '2025-01-10T09:15:00Z'
  },
  {
    id: '4',
    name: 'Gymkhana',
    area: 'Mayfair',
    venue_type: 'restaurant',
    is_active: true,
    slot_count: 10,
    admin_count: 2,
    agreement_accepted: true,
    agreement_date: '2025-01-18T11:45:00Z'
  },
  {
    id: '5',
    name: 'The Wolseley',
    area: 'Piccadilly',
    venue_type: 'restaurant',
    is_active: true,
    slot_count: 15,
    admin_count: 2,
    agreement_accepted: true,
    agreement_date: '2025-01-08T16:20:00Z'
  },
  {
    id: '6',
    name: '5 Hertford Street',
    area: 'Mayfair',
    venue_type: 'club',
    is_active: true,
    slot_count: 5,
    admin_count: 2,
    agreement_accepted: true,
    agreement_date: '2025-01-20T13:00:00Z'
  }
]

export default function AdminVenuesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [step, setStep] = useState(1) // 1: Details, 2: Agreement
  const [newVenue, setNewVenue] = useState({
    name: '',
    area: '',
    venue_type: 'restaurant',
    description: '',
    address: ''
  })
  const [agreementAccepted, setAgreementAccepted] = useState(false)

  const handleCreate = () => {
    console.log('Creating venue:', newVenue)
    console.log('Agreement accepted at:', new Date().toISOString())
    setShowCreateForm(false)
    setStep(1)
    setNewVenue({ name: '', area: '', venue_type: 'restaurant', description: '', address: '' })
    setAgreementAccepted(false)
  }

  const canProceedToAgreement = newVenue.name && newVenue.area && newVenue.address && newVenue.description

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
          <p className="text-gray-600">Manage all venues on the platform</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          + Create Venue
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Venue</h2>
              
              {/* Progress Steps */}
              <div className="flex items-center gap-4 mt-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="text-sm font-medium">Venue Details</span>
                </div>
                
                <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="text-sm font-medium">Agreement</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      value={newVenue.name}
                      onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g. The Ledbury"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area *
                    </label>
                    <input
                      type="text"
                      value={newVenue.area}
                      onChange={(e) => setNewVenue({ ...newVenue, area: e.target.value })}
                      className="input-field"
                      placeholder="e.g. Notting Hill"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={newVenue.address}
                      onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                      className="input-field"
                      placeholder="Full address including postcode"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={newVenue.venue_type}
                      onChange={(e) => setNewVenue({ ...newVenue, venue_type: e.target.value })}
                      className="input-field"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="club">Club</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newVenue.description}
                      onChange={(e) => setNewVenue({ ...newVenue, description: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <VenueAgreement 
                    showCheckbox={true}
                    isChecked={agreementAccepted}
                    onCheckChange={setAgreementAccepted}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              {step === 1 && (
                <>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedToAgreement}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Review Agreement
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!agreementAccepted}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Venue
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Venues Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Area</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Slots</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Admins</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Agreement</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_VENUES.map((venue) => (
                <tr key={venue.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <Link href={`/admin/venues/${venue.id}`} className="font-medium text-blue-600 hover:text-blue-700">
                      {venue.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{venue.area}</td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-gray-600">{venue.venue_type}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{venue.slot_count}</td>
                  <td className="py-3 px-4">
                    <span className={venue.admin_count === 2 ? 'text-green-600' : 'text-red-600'}>
                      {venue.admin_count}/2
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {venue.agreement_accepted ? (
                      <span className="text-xs text-green-600">
                        ✓ {new Date(venue.agreement_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs text-red-600">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      venue.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {venue.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/venues/${venue.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}