import React from 'react';

export default function About() {
  // One typographic voice for the whole page
  const body = 'text-zinc-600 text-lg leading-relaxed';
  const h2 = 'text-3xl font-light text-zinc-900 mb-8';

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tight">
          About ClientDining
        </h1>

        <div className={`max-w-3xl space-y-6 ${body}`}>
          <p>
            ClientDining is a private booking platform for City professionals who host business dinners in London.
          </p>

          <p>
            It provides a reliable way to see availability, request tables, and manage bookings at a small number of
            leading restaurants and private members’ clubs. Availability is shared directly by venues and updated as it
            changes.
          </p>

          <p>
            The platform is designed for early-evening business dining, Monday to Thursday. Reservations are discreet,
            service-led, and sit alongside a venue’s existing operations without disruption.
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
        <div className="border-t border-zinc-200" />
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className={h2}>How it works</h2>

        <div className={`max-w-3xl space-y-6 ${body}`}>
          <p>
            ClientDining maintains a curated list of restaurants and private members’ clubs suited to business dining.
            Venues are selected for their ability to host professional conversations comfortably, across different group
            sizes.
          </p>

          <p>
            Venues share availability directly with the platform. Members see real dates, times, and table sizes, submit
            a booking request, and receive confirmation in one place. Confirmation timing remains with the venue.
          </p>

          <p>
            When tables are in demand, access is time-sensitive. Premium members see availability first. If unfilled,
            tables open to all members in the final 24 hours.
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

  <p className="text-zinc-600 text-lg leading-relaxed mb-12 max-w-3xl">
    Two tiers. The difference is access when tables are competitive.
  </p>

  <div className="grid md:grid-cols-2 gap-8">
    {/* Standard */}
    <div className="border border-zinc-200 p-8 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-light text-zinc-900 mb-1">
            Standard
          </h3>
          <p className="text-zinc-600 text-lg">
            Best when timing is flexible.
          </p>
        </div>

        <ul className="space-y-3 text-zinc-600 text-lg leading-relaxed">
          <li>Book tables that are currently available</li>
          <li>Hold up to three future bookings</li>
          <li>Set alerts for preferred dates and times</li>
        </ul>

        <p className="text-zinc-600 text-lg leading-relaxed">
          High-demand tables open to Standard members if still available within 24 hours.
        </p>
      </div>

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
    <div className="border border-zinc-900/30 bg-zinc-100/50 p-8 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-light text-zinc-900 mb-1">
            Premium
          </h3>
          <p className="text-zinc-600 text-lg">
            Best when the table matters.
          </p>
          <p className="text-zinc-600 text-lg mt-1">
            £49 per month
          </p>
        </div>

        <ul className="space-y-3 text-zinc-600 text-lg leading-relaxed">
          <li>First access to high-demand tables</li>
          <li>Hold up to ten future bookings</li>
          <li>Early visibility when availability changes</li>
        </ul>

        <p className="text-sm text-zinc-600 leading-relaxed">
          Premium membership is typically paid for as part of business expenses.
        </p>
      </div>

      <div className="mt-8">
        <a
          href="/signup?tier=premium"
          className="inline-flex items-center justify-center h-10 px-6 text-sm font-light bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          Upgrade to Premium
        </a>
      </div>
    </div>
  </div>

  {/* Company plans */}
  <div className="mt-12 max-w-3xl">
    <p className="text-zinc-600 text-lg leading-relaxed mb-2">
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
        <div className="border-t border-zinc-200" />
      </div>

      {/* The venues */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className={h2}>The venues</h2>

        <div className={`max-w-3xl space-y-6 ${body}`}>
          <p>ClientDining works with a deliberately small group of restaurants and private members’ clubs.</p>
          <p>Venues are chosen for reliability, discretion, and their ability to host business dinners comfortably.</p>
          <p>
            Availability is shared at the venue’s discretion, and bookings remain subject to their usual acceptance
            process. The list of venues is expanded carefully over time.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200" />
      </div>

      {/* Access */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className={h2}>Access</h2>

        <div className={`max-w-3xl space-y-6 ${body}`}>
          <p>ClientDining is intended for professional use.</p>
          <p>
            Membership is verified via LinkedIn and approved individually. Access is not open to the general public.
          </p>

          <p>
            <a
              href="/signup"
              className="text-zinc-900 underline underline-offset-4 hover:no-underline"
            >
              Apply for membership
            </a>
          </p>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
