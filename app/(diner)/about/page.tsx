import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — ClientDining',
  description: 'ClientDining is a private booking platform for professionals who host business dining in London. Membership is verified for City professionals.',
}

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-12 tracking-tight">
          About
        </h1>

        <div className="max-w-2xl space-y-8 text-zinc-500 font-light leading-relaxed">
          <p>
            Business in London still happens around a table.
          </p>
          <p>
            A client dinner. A relationship that matters. A team evening to mark the right moment. A table for colleagues, investors, or industry peers. For many people working across the City, some of the most important professional conversations still happen in person, over lunch or dinner, in the right setting.
          </p>
          <p>
            And yet, for something so central to working life, the process of arranging it has never felt particularly well built for the purpose. It is often pieced together through email chains, personal contacts, and consumer reservation platforms designed for something quite different.
          </p>
          <p>
            ClientDining exists to bring structure to that process.
          </p>
          <p>
            This is not a directory, and it is not a marketplace. It is a private booking network for professionals who host as part of their role, and for executive assistants arranging on their behalf.
          </p>
          <p>
            By defining a small circle of established restaurants and private members&apos; clubs, ClientDining gives members a more consistent and reliable way to book for client hosting, team dinners, and other professional occasions where the choice of venue matters.
          </p>
          <p>
            The focus is on quality, consistency, and discretion. These are venues where you can walk through the door with confidence, knowing the setting and service will support the occasion rather than compete with it.
          </p>
          <p>
            Membership is verified. The venue group expands deliberately and remains peer level, so the network stays credible, useful, and aligned with the standards professional hosts expect.
          </p>
          <p>
            ClientDining makes business hosting in London more straightforward.
          </p>
        </div>

        <p className="mt-8 text-zinc-500 font-light leading-relaxed">
          <Link href="/signup" className="text-zinc-900 hover:text-zinc-600 transition-colors duration-200">
            Request access.
          </Link>
        </p>

      </section>
    </div>
  )
}
