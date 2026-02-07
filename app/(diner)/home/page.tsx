import VenueGrid from '@/components/venues/VenueGrid'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  // Create server-side client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Fetch active venues from database
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching venues:', error)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-light text-zinc-900 mb-3">ClientDining</h1>
        <p className="text-zinc-600 font-light text-lg">
          A private booking platform for City professionals hosting business dinners in London.
        </p>
      </div>
      <VenueGrid venues={venues || []} />
    </div>
  )
}