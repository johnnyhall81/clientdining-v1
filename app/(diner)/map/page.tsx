import { createClient } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'

export const revalidate = 0

const VenueMap = dynamic(() => import('@/components/venues/VenueMap'), { ssr: false })

export default async function MapPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, slug, venue_type, description, requires_guest_names, area, image_hero, is_active, lat, lng, logo_url, hire_only, private_hire_available, address, postcode, created_at')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    // Break out of the layout's px and py padding on all sides
    // Nav is h-16 (64px), so map fills exactly the remaining viewport height
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8" style={{ height: 'calc(100vh - 64px)' }}>
      <VenueMap venues={venues || []} />
    </div>
  )
}
