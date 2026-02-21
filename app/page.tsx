import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import LandingPage from '@/components/LandingPage'

export const metadata: Metadata = {
  title: 'ClientDining — Reserve the tables that matter.',
  description: "Private access for City professionals. An invitation-only dining platform for London's senior executives.",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootPage() {
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

  return <LandingPage venues={venues || []} />
}
