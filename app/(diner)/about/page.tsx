export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          About ClientDining
        </h1>
        <p className="text-lg text-gray-700">
          ClientDining is a private booking platform for City professionals hosting business dinners at London's leading restaurants and private members' clubs.
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <section className="space-y-4">
          <p className="text-gray-700">
            It's built for people who regularly entertain clients or colleagues and want a reliable way to see availability, request tables, and manage bookings in one place.
          </p>
          <p className="text-gray-700">
            Availability on ClientDining is shared directly by venues and updated as changes are received. Members can see dates, times, and table sizes directly, without needing to email or call.
          </p>
          <p className="text-gray-700">
            ClientDining is designed for intentional business dining — discreet reservations where conversation, service, and reliability matter.
          </p>
        </section>

        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Using ClientDining</h2>
          <p className="text-gray-700">
            Members browse a short, curated list of restaurants and private members' clubs suited to business dinners. Venues are selected for consistent service, professional atmosphere, and ease of hosting.
          </p>
          <p className="text-gray-700">
            When a suitable table is available, members submit a booking request through the platform. Confirmation timing remains with the venue, and all requests, updates, and confirmations are managed in one place.
          </p>
          <p className="text-gray-700">
            If a preferred time isn't available, members can set an alert on that slot and be notified if availability changes. Premium members receive priority alerts where there is competition for the same table.
          </p>
        </section>

        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Membership</h2>
          <p className="text-gray-700">ClientDining offers two membership tiers: Standard and Premium.</p>

          <div className="not-prose grid md:grid-cols-2 gap-6 mt-6">
            <div className="border border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Standard</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✓ Request standard restaurant tables</li>
                <li>✓ Access selected premium availability at short notice</li>
                <li>✓ Set alerts on any slot</li>
                <li>✓ Hold up to three future bookings</li>
              </ul>
            </div>

            <div className="border-2 border-amber-600 rounded-xl p-8 bg-amber-50">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h3 className="text-xl font-bold text-gray-900">Premium</h3>
                <span className="text-sm font-medium text-gray-900">£49/month</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">For members who plan further ahead or host clients regularly.</p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✓ Everything in Standard</li>
                <li>✓ Book premium tables further in advance</li>
                <li>✓ Hold up to ten future bookings</li>
                <li>✓ Priority alert notifications</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">The venues</h2>
          <p className="text-gray-700">
            ClientDining does not aim to list every restaurant in London. It works with a select group of restaurants and private members' clubs that prefer a controlled, professional flow of business dining reservations.
          </p>
          <p className="text-gray-700">
            Venues are chosen for consistent service, appropriate atmosphere, and their ability to host business dinners across different group sizes. Availability is shared at the venue's discretion, and bookings remain subject to their usual acceptance process.
          </p>
          <p className="text-gray-700">
            New venues are added gradually.
          </p>
        </section>

        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Access and verification</h2>
          <p className="text-gray-700">
            ClientDining is intended for professional use. Membership is verified via LinkedIn to maintain a trusted network.
          </p>
          <p className="text-gray-700">
            Access is not open to the general public. New members are approved before using the platform.
          </p>
        </section>

        <section className="space-y-4 mt-12">
          <p className="text-gray-700 text-sm italic">
            ClientDining makes business dining simpler for hosts, and more predictable for venues.
          </p>
        </section>

        <section className="mt-14 not-prose">
          <div className="bg-gray-900 text-white p-10 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-7">
              Join ClientDining and unlock access to London's most sought-after dining reservations.
            </p>
            <a
              href="/signup"
              className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Your Account
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
