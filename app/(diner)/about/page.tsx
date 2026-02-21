'use client'

import React from 'react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-12 tracking-tight">
          About ClientDining
        </h1>

        <div className="max-w-2xl space-y-8 text-zinc-600 font-light leading-relaxed">
          <p>
            ClientDining is a private booking platform for professionals who host business dining in London.
          </p>

          <p>
            It provides access to a small group of established restaurants and private members' clubs, including venues that typically operate with controlled or membership-based access.
          </p>

          <p>
            Business hosting remains a normal part of working life in the City. Yet arranging these tables often relies on informal emails, personal contacts, or general reservation platforms not designed for this purpose.
          </p>

          <p>
            ClientDining offers a single, discreet channel for managing those bookings.
          </p>

          <p>
            Venues share availability at their discretion. Members see confirmed dates and table sizes and submit requests through the platform. All bookings remain subject to venue approval.
          </p>

          <p>
            It exists to make professional hosting more straightforward.
          </p>

          <p className="text-zinc-900">
            When the table matters, it should work.
          </p>
        </div>

        <div className="mt-16">
          <Link
            href="/signup"
            className="inline-block bg-zinc-900 text-zinc-50 px-8 py-4 text-xs font-light tracking-widest uppercase hover:bg-zinc-800 transition-colors duration-200"
          >
            Apply for membership
          </Link>
        </div>
      </section>


    </div>
  )
}
