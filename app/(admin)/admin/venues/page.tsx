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
      .order('display_order', { ascending: true })

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

  const moveVenue = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= venues.length) return

    // Swap positions in array
    const updated = [...venues]
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]

    // Assign clean sequential display_order values (1, 2, 3...)
    // This prevents stale values and duplicate order numbers accumulating over time
    const normalized = updated.map((v, i) => ({ ...v, display_order: i + 1 } as any))

    // Optimistic update immediately so UI feels instant
    setVenues(normalized)

    // Persist all display_order values in parallel — avoids partial writes
    await Promise.all(
      normalized.map((v) =>
        supabase.from('venues').update({ display_order: (v as any).display_order }).eq('id', v.id)
      )
    )
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">
                Order
              </th>
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
            {venues.map((venue, index) => (
              <tr key={venue.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      onClick={() => moveVenue(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </button>
                    <span className="text-[10px] text-gray-300">{index + 1}</span>
                    <button
                      onClick={() => moveVenue(index, 'down')}
                      disabled={index === venues.length - 1}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </td>
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
