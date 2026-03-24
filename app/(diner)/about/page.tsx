import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — ClientDining',
  description: 'ClientDining is a private booking network for professionals who host across corporate and creative London. Membership is verified.',
}

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-zinc-900 tracking-tight mb-1">About</h1>
        </div>

        <div className="space-y-6 text-sm text-zinc-500 font-light leading-relaxed">
          <p>Business in London still happens around a table.</p>
          <p>A client dinner. A team evening. A conversation with colleagues, investors, collaborators or industry peers. Across corporate and creative London, some of the most important professional relationships are still built in person, over lunch or dinner, in the right setting.</p>
          <p>And yet, for something so central to working life, the process of arranging it remains surprisingly fragmented — often pieced together through email chains, personal contacts, and consumer reservation platforms designed for something quite different.</p>
          <p>ClientDining exists to bring structure to that process.</p>
          <p>It is a private booking network for professionals who host as part of their role, and for executive assistants booking on their behalf. Not a directory. Not a public marketplace. A more reliable way to book within a defined circle of established restaurants and private members&apos; clubs.</p>
          <p>The aim is simple: to make it easier to secure the right table for client hosting, team dinners, and other professional occasions where the choice of venue matters.</p>
          <p>Every venue on the platform is selected for quality, consistency, and discretion. These are places you can book with confidence, knowing the setting and service will support the occasion rather than compete with it.</p>
          <p>Membership is verified, and the venue group expands deliberately. That keeps the network credible, useful, and peer level — aligned with the standards professional hosts expect.</p>
          <p>When the table matters, the process should too.</p>
        </div>

        <p className="mt-8 text-sm text-zinc-400 font-light">
          Not yet a member?{' '}
          <Link href="/signup" className="text-zinc-700 hover:text-zinc-900 transition-colors">
            Apply to join.
          </Link>
        </p>
      </section>
    </div>
  )
}
