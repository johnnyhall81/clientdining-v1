import VenueGrid from '@/components/venues/VenueGrid'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching venues:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-light text-zinc-900 mb-2">Venues</h1>
      </div>
      <VenueGrid venues={venues || []} />
    </div>
  )
}
