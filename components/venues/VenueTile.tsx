'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Venue } from '@/lib/supabase'

interface VenueTileProps {
  venue: Venue & { image?: string }
  availableSlots?: number
}

export default function VenueTile({ venue, availableSlots = 0 }: VenueTileProps) {
  return (
    <Link href={`/venues/${venue.id}`}>
      <div className="group cursor-pointer">
        <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden mb-3">
          {venue.image ? (
            <img 
              src={venue.image}
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform duration-300">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {venue.name}
          </h3>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{venue.area}</span>
            <span className="text-gray-500 capitalize">{venue.venue_type}</span>
          </div>
          
          {availableSlots > 0 && (
            <p className="text-sm text-green-600 font-medium">
              {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} available
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}