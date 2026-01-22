import Link from 'next/link'

export default function VenueAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Venue Admin Header */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">Venue Admin - The Ledbury</h1>
              <nav className="flex gap-6">
                <Link href="/venue/bookings" className="text-sm hover:text-gray-300">
                  Bookings
                </Link>
                <Link href="/venue/slots" className="text-sm hover:text-gray-300">
                  Availability
                </Link>
              </nav>
            </div>
            <Link href="/home" className="text-sm hover:text-gray-300">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}