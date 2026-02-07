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
    <div className="pt-4">
      <VenueGrid venues={venues || []} />
    </div>
  )
}
