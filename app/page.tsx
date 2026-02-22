import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import LandingPage from '@/components/LandingPage'

export const metadata: Metadata = {
  title: 'ClientDining — Business dining in London',
  description: 'A private booking platform for professionals who host business dining in London. Membership is verified for City professionals.',
  openGraph: {
    title: 'ClientDining — Business dining in London',
    description: 'A private booking platform for professionals who host business dining in London.',
    url: 'https://www.clientdining.com',
    images: [{ url: 'https://www.clientdining.com/og.jpg', width: 1200, height: 630, alt: 'ClientDining' }],
  },
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
