import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">ClientDining</h3>
            <p className="text-gray-600 text-sm">
              London's best tables
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-gray-900">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-gray-900 text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-gray-900 text-sm">
                  Search Venues
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-gray-900">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-600 hover:text-gray-900 text-sm">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-600 hover:text-gray-900 text-sm">
                  Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-gray-900">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} ClientDining. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm mt-4 md:mt-0">
            Contact: <a href="mailto:support@clientdining.com" className="hover:text-gray-900">support@clientdining.com</a>
          </p>
        </div>
      </div>
    </footer>
  )
}