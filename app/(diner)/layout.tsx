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
    <div className="bg-zinc-50 flex flex-col">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-8 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
