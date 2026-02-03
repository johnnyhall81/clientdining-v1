import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tight">
          About ClientDining
        </h1>

        <div className="space-y-6 text-zinc-600 text-lg leading-relaxed max-w-3xl">
          <p>
            ClientDining is a private booking platform for City professionals who host business dinners in London.
          </p>

          <p>
            It provides a reliable way to see availability, request tables, and manage bookings at a small number of leading restaurants and private members’ clubs. Availability is shared directly by venues and updated as it changes.
          </p>

          <p>
            The platform is designed for early-evening business dining, Monday to Thursday. Reservations are discreet, service-led, and sit alongside a venue’s existing operations without disruption.
          </p>

          <p>
            ClientDining is selective by design. Venues are chosen for consistency, atmosphere, and their suitability for professional hosting. Membership is verified and not open to the general public.
          </p>

          <p className="text-zinc-500">
            The aim is simple: fewer emails, fewer follow-ups, and greater certainty when the table matters.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200" />
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">
          How it works
        </h2>

        <div className="space-y-6 text-zinc-600 leading-relaxed max-w-3xl">
          <p>
            ClientDining maintains a curated list of restaurants and private members’ clubs suited to business dining. Venues are selected for their ability to host professional conversations comfortably, across different group sizes.
          </p>

          <p>
            Venues share availability directly with the platform. Members see real dates, times, and table sizes, submit a booking request, and receive confirmation in one place. Confirmation timing remains with the venue.
          </p>

          <p>
            When tables are in demand, access is time-sensitive. Premium members see availability first. If unfilled, tables open to all members in the final 24 hours.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200" />
      </div>

      {/* Membership */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-4">
          Membership
        </h2>

        <p className="text-zinc-500 mb-12">
          Two tiers. The difference is access when tables are competitive.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Standard */}
          <div className="space-y-6">
            <h3 className="text-2xl font-light text-zinc-900">
              Standard
            </h3>

            <ul className="space-y-3 text-zinc-600">
              <li>Access participating venues</li>
              <li>Book available tables</li>
              <li>Set alerts for preferred dates and times</li>
              <li>Hold up to three future bookings</li>
            </ul>

            <p className="text-sm text-zinc-500 italic pt-4 border-t border-zinc-200">
              High-demand tables open to Standard members if still available within 24 hours.
            </p>
          </div>

          {/* Premium */}
          <div className="space-y-6 md:border-l md:border-zinc-200 md:pl-12">
            <div>
              <h3 className="text-2xl font-light text-zinc-900 mb-1">
                Premium
              </h3>
              <p className="text-zinc-500">
                £49 per month
              </p>
            </div>

            <ul className="space-y-3 text-zinc-600">
              <li>Everything in Standard</li>
              <li>First access when high-demand tables become available</li>
              <li>Hold up to ten future bookings</li>
              <li>Early visibility when availability changes</li>
            </ul>

            <p className="text-sm text-zinc-500 italic">
              Commonly expensed as a business tool.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200" />
      </div>

      {/* Company plans */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">
          Company plans
        </h2>

        <div className="space-y-4 text-zinc-600 leading-relaxed max-w-3xl">
          <p>
            ClientDining is often used by teams where multiple people host clients on behalf of the same firm.
          </p>

          <p>
            Company plans provide central billing and shared access, while preserving the same booking rules and venue controls.
          </p>

          <p>
            Designed for organisations where business dining is a shared responsibility.
          </p>
        </div>

        <div className="mt-8">
          <a
            href="/contact"
            className="inline-flex items-center px-6 h-10 text-sm font-light border border-zinc-300 text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            Enquire about company plans
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200" />
      </div>

      {/* The venues */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">
          The venues
        </h2>

        <div className="space-y-4 text-zinc-600 leading-relaxed max-w-3xl">
          <p>
            ClientDining does not aim to list every restaurant in London.
          </p>

          <p>
            It works with a limited number of establishments that understand the difference between feeding people and hosting business.
          </p>

          <p>
            Availability is shared at the venue’s discretion. Bookings remain subject to the venue’s usual acceptance process. New venues are added gradually.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200" />
      </div>

      {/* Access */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">
          Access
        </h2>

        <div className="space-y-4 text-zinc-600 leading-relaxed max-w-3xl mb-12">
          <p>
            ClientDining is intended for professional use.
          </p>

          <p>
            Membership is verified via LinkedIn and approved individually. Access is not open to the general public.
          </p>
        </div>

        <a
          href="/signup"
          className="inline-flex items-center px-6 h-10 text-sm font-light bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          Apply for membership
        </a>
      </section>

      {/* Bottom spacing */}
      <div className="h-24" />
    </div>
  );
}
