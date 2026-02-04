'use client'

import React from 'react'

export default function VenuesOverview() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tight">
          For Restaurants and Private Members’ Clubs
        </h1>

        <div className="max-w-3xl space-y-6 text-zinc-600 leading-relaxed">
          <p>
            ClientDining is a private booking platform for early evening business
            dining during the working week.
          </p>

          <p>
            It works with a small group of leading restaurants and private
            members’ clubs where early weekday tables are quieter than later
            services.
          </p>

          <p>
            ClientDining introduces verified City professionals hosting low key
            business dinners. These are straightforward bookings: one table,
            discreet service, good spend, and a clean finish.
          </p>

          <p>
            Venues share availability directly with the platform and retain full
            control throughout. You decide what to offer, when to offer it, and
            which requests to accept. Bookings are reviewed and confirmed
            directly by the venue. Nothing changes operationally.
          </p>

          <p>
            Participation is flexible and can be adjusted or paused at any time.
          </p>

          <p>
            Some venues also use ClientDining selectively for private rooms,
            particularly for corporate breakfasts or lunches.
          </p>

          <p>
            Commercially, ClientDining operates on a flat commission on completed
            bookings, calculated on food and beverage spend excluding VAT and
            service charge, and invoiced monthly.
          </p>

          <p>
            The venue group is kept deliberately small and peer level. Growth is
            controlled so demand concentrates and standards remain high.
          </p>

          <p>
            If this is relevant, a short walkthrough is usually enough to
            determine fit.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

{/* Contact */}
<section className="max-w-4xl mx-auto px-6 pt-12">
        <div className="max-w-3xl">
          <p className="text-zinc-600 leading-relaxed">
            For a brief walkthrough or to discuss participation, contact{' '}
            <a
              href="mailto:john@clientdining.com"
              className="text-zinc-900 underline underline-offset-4 hover:no-underline"
            >
              john@clientdining.com
            </a>
            .
          </p>
        </div>
      </section>

      
      {/* Bottom spacing to mirror About */}
      <div className="h-24"></div>
    </div>
  )
}
