import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">Platform Admin</h1>
              <nav className="flex gap-6">
                <Link href="/admin/venues" className="text-sm hover:text-gray-300">
                  Venues
                </Link>
                <Link href="/admin/slots" className="text-sm hover:text-gray-300">
                  Slots
                </Link>
                <Link href="/admin/users" className="text-sm hover:text-gray-300">
                  Users
                </Link>
              </nav>
            </div>
            <Link href="/home" className="text-sm hover:text-gray-300">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}