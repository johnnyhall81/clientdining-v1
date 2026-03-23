'use client'

import { useState } from 'react'
import { Venue } from '@/lib/supabase'
import VenueTile from './VenueTile'
import dynamic from 'next/dynamic'

const VenueMap = dynamic(() => import('./VenueMap'), { ssr: false })

interface VenueGridProps {
  venues: Venue[]
}

export default function VenueGrid({ venues }: VenueGridProps) {
  const [view, setView] = useState<'grid' | 'map'>('grid')

  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 font-light leading-relaxed">No venues available at the moment.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-end mb-6">
        <div
          className="flex items-center"
          style={{ border: '1px solid #E4E4E7', borderRadius: '6px', overflow: 'hidden' }}
        >
          <button
            onClick={() => setView('grid')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-light transition-colors"
            style={{
              backgroundColor: view === 'grid' ? '#F4F4F5' : 'white',
              color: view === 'grid' ? '#18181B' : '#71717A',
            }}
            aria-label="Grid view"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Grid
          </button>
          <div style={{ width: '1px', background: '#E4E4E7', height: '28px' }} />
          <button
            onClick={() => setView('map')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-light transition-colors"
            style={{
              backgroundColor: view === 'map' ? '#F4F4F5' : 'white',
              color: view === 'map' ? '#18181B' : '#71717A',
            }}
            aria-label="Map view"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            Map
          </button>
        </div>
      </div>

      {/* Views */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {venues.map((venue) => (
            <VenueTile key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <VenueMap venues={venues} />
      )}
    </div>
  )
}
