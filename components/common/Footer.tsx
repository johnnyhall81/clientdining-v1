import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <h3 className="text-lg font-light mb-4 text-zinc-900">ClientDining</h3>
            <p className="text-zinc-600 text-sm font-light">
              When the table matters
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-light mb-4 uppercase tracking-wider text-zinc-900">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-zinc-600 hover:text-zinc-900 text-sm font-light">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-zinc-600 hover:text-zinc-900 text-sm font-light">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-zinc-600 hover:text-zinc-900 text-sm font-light">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/overview" className="text-zinc-600 hover:text-zinc-900 text-sm font-light">
                  Venue overview
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-sm font-light mb-4 uppercase tracking-wider text-zinc-900">
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-zinc-600 hover:text-zinc-900 text-sm font-light">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-zinc-600 hover:text-zinc-900 text-sm font-light">
                  Join
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-zinc-600 hover:text-zinc-900 text-sm font-light">
                  Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-light mb-4 uppercase tracking-wider text-zinc-900">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-zinc-600 hover:text-zinc-900 text-sm font-light">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-zinc-600 hover:text-zinc-900 text-sm font-light">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-600 text-sm font-light">
            © {new Date().getFullYear()} ClientDining. All rights reserved.
          </p>
          <p className="text-zinc-600 text-sm font-light mt-4 md:mt-0">
            Contact:{' '}
            <a href="mailto:support@clientdining.com" className="hover:text-zinc-900">
              support@clientdining.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
