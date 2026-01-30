import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import VenueClient from './VenueClient'

export const revalidate = 0 // Disable caching for this page

export default async function VenuePage({ params }: { params: { venueId: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch venue from database
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', params.venueId)
    .eq('is_active', true)
    .single()

  if (error || !venue) {
    notFound()
  }

  // Fetch ALL future slots for this venue (do NOT filter to only available)
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const { data: slots } = await supabase
    .from('slots')
    .select('*')
    .eq('venue_id', params.venueId)
    .gte('start_at', now.toISOString())
    .lte('start_at', thirtyDaysFromNow.toISOString())
    .order('start_at', { ascending: true })
    .limit(50)

  return <VenueClient venue={venue} slots={slots || []} />
}
