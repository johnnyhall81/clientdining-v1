import type { Metadata } from 'next'
import FAQClient from './FAQClient'

export const metadata: Metadata = {
  title: 'FAQ — ClientDining',
  description: 'How ClientDining works. A private booking platform for business dining in London.',
}

export default function FAQPage() {
  return <FAQClient />
}
