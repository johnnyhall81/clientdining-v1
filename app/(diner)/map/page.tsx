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
    .select('id, name, area, image_hero, is_active, lat, lng, logo_url, hire_only, address, postcode, created_at')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <div style={{ margin: '0 -2rem' }}>
      <VenueMap venues={venues || []} />
    </div>
  )
}
