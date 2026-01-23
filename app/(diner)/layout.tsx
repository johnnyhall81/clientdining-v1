import TopNav from '@/components/nav/TopNav'
import Footer from '@/components/common/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ClientDining',
  description: 'London\'s best tables',
}

export default function DinerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}