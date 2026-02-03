import React from 'react'

export default function ForVenuesPage() {
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

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-zinc-600 leading-relaxed">
        <p>
          The platform is designed to support a specific use case: senior City professionals hosting low-key business
          dinners during quieter periods, without altering how a venue already operates.
        </p>
        <p>
          This is not a marketing channel, a discount platform, or a concierge service. It is a controlled,
          invitation-only booking flow designed to sit quietly alongside existing reservations.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Booking Profile */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">Typical booking profile</h2>
        <ul className="space-y-3 text-zinc-600">
          <li>One host entertaining clients or colleagues</li>
          <li>Early evening, Monday to Friday</li>
          <li>Discreet, low-key service</li>
          <li>One bill settled by the host, usually on a company card</li>
        </ul>
        <p className="mt-6 text-zinc-600">
          These are standard reservations placed with intent. There are no promotions, events, or group experiences.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Participation */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">How venues participate</h2>
        <ul className="space-y-3 text-zinc-600">
          <li>Availability is shared at the venue’s discretion</li>
          <li>Availability can be added or withdrawn freely</li>
          <li>No exclusivity and no minimum volume commitments</li>
          <li>No interference with pricing, menus, service, or guest management</li>
          <li>Bookings remain subject to the venue’s usual acceptance process</li>
        </ul>
        <p className="mt-6 text-zinc-600">
          If the platform is not materially beneficial, participation can simply be paused.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Private Rooms */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-zinc-600 leading-relaxed">
        <h2 className="text-3xl font-light text-zinc-900 mb-4">Private rooms</h2>
        <p>
          Some venues also use ClientDining selectively to make better use of private rooms.
        </p>
        <p>
          This works particularly well for industry roundtables, breakfast or lunch meetings,
          and quiet strategy discussions. These bookings are contained, low-impact, and sit comfortably
          within existing operations.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Commercial Terms */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-zinc-600 leading-relaxed">
        <h2 className="text-3xl font-light text-zinc-900 mb-4">Commercial terms</h2>
        <p>
          ClientDining operates on a simple commission model.
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
        <h2 className="text-3xl font-light text-zinc-900 mb-4">Launch approach</h2>
        <p>
          ClientDining launches and expands deliberately.
        </p>
        <p>
          The initial group is limited to a small number of peer-level restaurants and clubs.
          Numbers are held steady to concentrate demand, protect standards, and ensure a high-quality
          experience before any expansion.
        </p>
        <p>
          There is no second tier of venues.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Fit */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-zinc-600 leading-relaxed">
        <h2 className="text-3xl font-light text-zinc-900 mb-4">A note on fit</h2>
        <p>
          ClientDining is not right for every venue, and that is intentional.
        </p>
        <p>
          It works best for establishments that value discretion, operational ease,
          consistent professional hosting, and quality over volume.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 border-t border-zinc-200" />

      {/* Contact */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-zinc-600 leading-relaxed mb-8">
          If this sounds relevant, we are happy to talk. Initial conversations are simply to explore fit
          and answer questions.
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
