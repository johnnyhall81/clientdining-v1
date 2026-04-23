import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16" style={{ backgroundColor: 'var(--canvas)', borderTop: '1px solid var(--divider)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

          {/* Left */}
          <div>
            <p className="text-sm font-light text-zinc-900">ClientDining</p>
            <p className="text-xs font-light text-zinc-400 mt-2 leading-relaxed">
              Company Registration No: 17018817<br />
              Registered in England and Wales
            </p>
          </div>

          {/* Right */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/about" className="text-sm font-light text-zinc-500 hover:text-zinc-900 transition-colors">About</Link>
            <Link href="/faq" className="text-sm font-light text-zinc-500 hover:text-zinc-900 transition-colors">FAQ</Link>
            <Link href="/privacy" className="text-sm font-light text-zinc-500 hover:text-zinc-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm font-light text-zinc-500 hover:text-zinc-900 transition-colors">Terms</Link>
            <a href="mailto:support@clientdining.com" className="text-sm font-light text-zinc-500 hover:text-zinc-900 transition-colors">Contact</a>
          </nav>

        </div>

        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--divider)' }}>
          <p className="text-xs font-light text-zinc-400">
            © {new Date().getFullYear()} CLIENTDINING LIMITED. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
