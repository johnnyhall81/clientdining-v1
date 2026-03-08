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
            The truth is, business in London still happens around a table.
          </p>
          <p>
            Whether it is a high stakes negotiation, a long overdue introduction, or simply marking a milestone with the right people, these moments are the heartbeat of the City. And yet, for something so important, the way we actually arrange those tables has never felt particularly well set up for the purpose. It is usually pieced together through email chains, personal contacts, and consumer reservation platforms designed for date night rather than a board level conversation.
          </p>
          <p>
            ClientDining exists to bring structure to that process.
          </p>
          <p>
            This is not a directory, and it is not a marketplace. It is a private booking network. By defining a small circle of established restaurants and private members&apos; clubs, we give professional hosts a structured, consistent way to book without the back and forth.
          </p>
          <p>
            The focus is on quality, consistency, and discretion. These are venues where you can walk through the door with total confidence, knowing the atmosphere and service will sit quietly alongside your conversation.
          </p>
          <p>
            Membership is verified and intended for professionals and executive assistants who host as part of their role. The venue group expands deliberately and stays peer level, ensuring that demand remains concentrated and standards remain consistent.
          </p>
          <p>
            ClientDining makes professional hosting more straightforward.
          </p>
          <p>
            When the table matters.
          </p>
        </div>

        <div className="mt-16">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-900 text-sm font-light rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors duration-300"
          >
            Apply for membership
          </Link>
        </div>

      </section>
    </div>
  )
}
