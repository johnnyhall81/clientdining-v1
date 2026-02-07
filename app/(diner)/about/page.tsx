'use client'

import React from 'react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tight">
          About ClientDining
        </h1>

        <div className="max-w-3xl space-y-6 text-zinc-600 leading-relaxed">
          <p>
            ClientDining is a private booking platform for City professionals who host business dinners in London.
          </p>

          <p>
            It provides a reliable way to see availability, request tables, and manage bookings at a small number of
            leading restaurants and private members' clubs. Availability is shared directly by venues and updated as it
            changes.
          </p>

          <p>
            The platform is designed for early-evening business dining, Monday to Friday. Reservations are discreet,
            service-led, and low-key, sitting alongside a venue's existing operations without disruption.
          </p>

          <p>
            ClientDining is selective by design. Venues are chosen for consistency, atmosphere, and their suitability
            for professional hosting. Membership is verified and not open to the general public.
          </p>

          <p>
            The aim is simple: fewer emails, fewer follow-ups, and greater certainty when the table matters.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">How it works</h2>

        <div className="max-w-3xl space-y-6 text-zinc-600 leading-relaxed">
          <p>
            ClientDining maintains a curated list of restaurants and private members' clubs suited to business dining.
            Venues are selected for their ability to host professional conversations comfortably, across different group
            sizes.
          </p>

          <p>
            Venues share availability directly with the platform. Members see real dates, times, and table sizes, submit
            a booking request, and receive confirmation in one place. Bookings are reviewed and confirmed directly by the venue.
          </p>

          <p>
            When tables are in demand, access is time-sensitive. Premium members see availability first. If unfilled,
            tables open to all members in the final 24 hours.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* Membership */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">Membership</h2>

        <p className="max-w-3xl text-zinc-600 leading-relaxed">
        Membership is designed to suit different hosting needs.
        Standard works well when you're flexible. Premium is designed for peak-time bookings and planning ahead, when certainty matters.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Standard */}
          <div className="border border-zinc-200 p-8 bg-zinc-50">
            <h3 className="text-2xl font-light text-zinc-900 mb-2">Standard</h3>
            <p className="text-zinc-600 leading-relaxed mb-6">
              Best when timing is flexible.
            </p>

            <ul className="space-y-3 text-zinc-600 leading-relaxed">
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Book tables that are currently available</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Hold up to three future bookings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Set alerts for preferred dates and times</span>
              </li>
            </ul>

            <p className="text-sm text-zinc-600 leading-relaxed mt-6">
              High-demand tables open to Standard members if still available within 24 hours.
            </p>

            <div className="mt-8">
              <a
                href="/signup"
                className="text-zinc-900 underline underline-offset-4 hover:no-underline"
              >
                Get started
              </a>
            </div>
          </div>

          {/* Premium */}
          <div className="border border-zinc-900/30 bg-white p-8">
            <div className="flex items-baseline justify-between gap-6 mb-2">
              <h3 className="text-2xl font-light text-zinc-900">Premium</h3>
              <span className="text-zinc-600">£49/month</span>
            </div>

            <p className="text-zinc-600 leading-relaxed mb-6">
               Best for peak times and planning ahead.
            </p>

            <ul className="space-y-3 text-zinc-600 leading-relaxed">
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>First access to high-demand tables</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Hold up to ten future bookings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Early visibility when availability changes</span>
              </li>
            </ul>

            <p className="text-sm text-zinc-600 leading-relaxed mt-6">
              Premium membership is typically paid for as part of business expenses.
            </p>

            <div className="mt-8">
              <a
                href="/signup?tier=premium"
                className="inline-block bg-zinc-900 text-zinc-50 px-8 py-4 hover:bg-zinc-800 transition-colors duration-200"
              >
                Upgrade to Premium
              </a>
            </div>
          </div>
        </div>

        {/* Company plans (kept inside the decision moment) */}
        <div className="max-w-3xl mt-12">
          <p className="text-zinc-600 leading-relaxed mb-2">
            For teams where client hosting is shared.
          </p>
          <a
            href="mailto:support@clientdining.com?subject=Company%20plans%20enquiry"
            className="text-zinc-900 underline underline-offset-4 hover:no-underline"
          >
            Enquire about company plans
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* The venues */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">The venues</h2>

        <div className="max-w-3xl space-y-6 text-zinc-600 leading-relaxed">
          <p>
            ClientDining works with a deliberately small group of restaurants and private members' clubs.
          </p>
          <p>
            Venues are chosen for reliability, discretion, and their ability to host low-key business dinners comfortably.
          </p>
          <p>
            Availability is shared at the venue's discretion, and bookings remain subject to their usual acceptance
            process. The list of venues is expanded carefully over time.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* Access */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">Access</h2>

        <div className="max-w-3xl space-y-6 text-zinc-600 leading-relaxed">
          <p>
            ClientDining is intended for professional use.
          </p>
          <p>
            Membership is verified via LinkedIn and approved individually. Access is not open to the general public.
          </p>
        </div>

        <div className="mt-12">
          <a
            href="/signup"
            className="inline-block bg-zinc-900 text-zinc-50 px-8 py-4 hover:bg-zinc-800 transition-colors duration-200"
          >
            Apply for membership
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* Company Information */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm text-zinc-500 leading-relaxed">
            ClientDining is a trading name of CLIENTDINING LIMITED, a company registered in England and Wales.
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed mt-2">
            Company Registration No: 17018817<br />
            Registered Office: 2 The Topiary, Ashtead, KT21 2TE
          </p>
        </div>
      </section>

      {/* Bottom Spacing */}
      <div className="h-24"></div>
    </div>
  )
}
