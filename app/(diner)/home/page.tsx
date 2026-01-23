import VenueGrid from '@/components/venues/VenueGrid'
import { Venue } from '@/lib/supabase'

// This would normally fetch from Supabase
const MOCK_VENUES: Venue[] = [
  {
    id: '1',
    name: 'The Ledbury',
    area: 'Notting Hill',
    venue_type: 'restaurant',
    description: 'Two Michelin-starred fine dining',
    is_active: true,
    created_at: new Date().toISOString(),
    image: '/venues/ledbury-venue.jpg'
  },
  {
    id: '2',
    name: 'Core by Clare Smyth',
    area: 'Notting Hill',
    venue_type: 'restaurant',
    description: 'Three Michelin-starred British cuisine',
    is_active: true,
    created_at: new Date().toISOString(),
    image: '/venues/core-venue.jpg'
  },
  {
    id: '3',
    name: "Annabel's",
    area: 'Mayfair',
    venue_type: 'club',
    description: 'Exclusive members club',
    is_active: true,
    created_at: new Date().toISOString(),
    image: '/venues/annabels-venue.jpg'
  },
  {
    id: '4',
    name: 'Gymkhana',
    area: 'Mayfair',
    venue_type: 'restaurant',
    description: 'Michelin-starred Indian cuisine',
    is_active: true,
    created_at: new Date().toISOString(),
    image: '/venues/gymkhana-venue.jpg'
  },
  {
    id: '5',
    name: 'The Wolseley',
    area: 'Piccadilly',
    venue_type: 'restaurant',
    description: 'Grand European café-restaurant',
    is_active: true,
    created_at: new Date().toISOString(),
    image: '/venues/wolseley-venue.jpg'
  },
  {
    id: '6',
    name: "5 Hertford Street",
    area: 'Mayfair',
    venue_type: 'club',
    description: 'Private members club',
    is_active: true,
    created_at: new Date().toISOString(),
    image: '/venues/hertford-venue.jpg'
  }
]

export default function HomePage() {
  return (
    export default function HomePage() {
      return (
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center py-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              ClientDining
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Access London's best tables.
            </p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              Premium dining reservations at London's finest restaurants and exclusive private clubs. 
              For verified City professionals.
            </p>
          </div>
          
          {/* Venue Grid */}
          <VenueGrid venues={MOCK_VENUES} />
        </div>
      )
    }
  )
}