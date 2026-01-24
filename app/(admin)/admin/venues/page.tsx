'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Venue } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminVenuesPage() {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVenues()
  }, [])

  const loadVenues = async () => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error loading venues:', error)
    } else {
      setVenues(data || [])
    }
    setLoading(false)
  }

  const toggleActive = async (venueId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('venues')
      .update({ is_active: !currentStatus })
      .eq('id', venueId)

    if (error) {
      alert('Failed to update venue')
    } else {
      loadVenues()
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading venues...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
          <p className="text-gray-600 mt-2">Manage all venues on the platform</p>
        </div>
        <Link
          href="/admin/venues/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          + Add Venue
        </Link>
      </div>

      {/* Venues Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {venues.map((venue) => (
              <tr key={venue.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{venue.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {venue.area}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                  {venue.venue_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    venue.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {venue.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <Link
                    href={`/admin/venues/${venue.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleActive(venue.id, venue.is_active)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {venue.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
