import React from 'react'

export default function VenueOverviewPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tight">
          For Restaurants & Private Members’ Clubs
        </h1>
        <p className="text-xl md:text-2xl text-zinc-600 font-light leading-relaxed max-w-3xl">
          ClientDining works with a deliberately small group of restaurants and private members’ clubs in London.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Introduction */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-zinc-600 leading-relaxed">
        <p>
          It exists to support a specific and familiar use case: senior City professionals hosting low-key business
          dinners during quieter periods, in a way that fits naturally with how a venue already operates.
        </p>
        <p>
          ClientDining is designed to be helpful rather than visible. It is an invitation-only booking flow that sits
          quietly alongside existing reservations, giving venues a simple way to welcome the right diners at the
          right times.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Typical Booking Profile */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">
          Typical booking profile
        </h2>
        <ul className="space-y-3 text-zinc-600">
          <li>One host entertaining clients or colleagues</li>
          <li>Early evening, Monday to Friday</li>
          <li>Small tables</li>
          <li>Discreet, low-key service</li>
          <li>Higher-than-average spend</li>
          <li>One bill settled by the host, usually on a company card</li>
        </ul>
        <p className="mt-6 text-zinc-600">
          These are standard reservations placed with intent. There are no promotions, events, or group experiences.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Participation */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">
          How venues participate
        </h2>
        <ul className="space-y-3 text-zinc-600">
          <li>Availability is shared at the venue’s discretion</li>
          <li>Availability can be added or withdrawn freely</li>
          <li>No exclusivity and no minimum volume commitments</li>
          <li>Pricing, menus, service, and guest management remain unchanged</li>
          <li>All bookings follow the venue’s usual acceptance process</li>
        </ul>
        <p className="mt-6 text-zinc-600">
          If the platform does not prove materially useful, participation can simply be paused.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Private Rooms */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-zinc-600 leading-relaxed">
        <h2 className="text-3xl font-light text-zinc-900 mb-4">
          Private rooms
        </h2>
        <p>
          Some venues also use ClientDining selectively to make better use of private rooms.
        </p>
        <p>
          This works particularly well for small corporate roundtables, breakfast or lunch meetings, and quiet
          strategy discussions. These bookings are typically contained, low-impact, and sit comfortably within
          existing operations, often during periods that would otherwise be underused.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Commercial Terms */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-zinc-600 leading-relaxed">
        <h2 className="text-3xl font-light text-zinc-900 mb-4">
          Commercial terms
        </h2>
        <p>
          ClientDining operates on a simple and transparent commission model.
        </p>
        <ul className="space-y-3">
          <li>Flat percentage commission on completed bookings</li>
          <li>Calculated on final food and beverage spend</li>
          <li>Exclusive of VAT and service charge</li>
          <li>Invoiced monthly following the booking</li>
        </ul>
        <p>
          Terms are agreed clearly in advance.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Launch */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-zinc-600 leading-relaxed">
        <h2 className="text-3xl font-light text-zinc-900 mb-4">
          Launch approach
        </h2>
        <p>
          ClientDining launches and expands deliberately.
        </p>
        <p>
          The initial group is limited to a small number of peer-level restaurants and clubs. Numbers are held
          steady to concentrate demand, protect standards, and ensure a high-quality experience on both sides
          before expanding further.
        </p>
        <p>
          There is no second tier of venues.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Fit */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-zinc-600 leading-relaxed">
        <h2 className="text-3xl font-light text-zinc-900 mb-4">
          A note on fit
        </h2>
        <p>
          ClientDining is not intended to suit every venue.
        </p>
        <p>
          It works best for establishments that value discretion, operational ease, consistent professional
          hosting, and quality over volume. Where there is a natural fit, the relationship tends to be simple,
          reliable, and long-term.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Contact */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-zinc-600 leading-relaxed mb-8">
          If this sounds relevant, we are always happy to talk. Initial conversations are simply to explore fit,
          share context, and answer questions.
        </p>
        <a
          href="mailto:john@clientdining.com"
          className="inline-flex items-center px-6 h-10 text-sm font-light bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          Contact
        </a>
      </section>

      <div className="h-24" />
    </div>
  )
}
