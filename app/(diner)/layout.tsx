import { Suspense } from 'react'
import TopNav from '@/components/nav/TopNav'
import Footer from '@/components/common/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'ClientDining',
    template: '%s — ClientDining',
  },
  description: 'Business dining in London for City professionals.',
}

export default function DinerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ backgroundColor: 'var(--canvas)' }} className="flex flex-col">
      <Suspense fallback={<div className="h-16 bg-white" style={{ borderBottom: '1px solid var(--divider)' }} />}>
        <TopNav />
      </Suspense>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-8 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
