import { Metadata } from 'next'
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

export default function RootPage() {
  return <LandingPage />
}
