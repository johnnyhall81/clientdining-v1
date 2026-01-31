export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          About
        </h1>
        <p className="text-lg text-gray-700">
          Private access to live dining availability across London’s leading restaurants and private members’ clubs.
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <section className="space-y-4">
          <p className="text-gray-700">
            ClientDining is built for business dining: discreet client meetings, team dinners, and small roundtables.
            Availability shown is intended to be trusted — if a slot is open, it can be booked.
          </p>

          <ul className="space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">Curated venues.</strong> A focused set of restaurants and private members’ clubs.
            </li>
            <li>
              <strong className="text-gray-900">Live availability.</strong> No waiting lists, no back-and-forth.
            </li>
            <li>
              <strong className="text-gray-900">Alerts.</strong> Set an alert on any slot and be notified the moment it opens.
            </li>
          </ul>
        </section>

        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Membership</h2>

          <div className="not-prose grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Browse all venues</li>
                <li>✓ Book standard restaurant tables</li>
                <li>✓ Book any table within 24 hours</li>
                <li>✓ Set alerts on any slot</li>
                <li>✓ Up to 3 future bookings</li>
              </ul>
            </div>

            <div className="border border-gray-900 rounded-xl p-8 bg-gray-50">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl font-bold text-gray-900">Premium</h3>
                <span className="text-sm font-medium text-gray-900">£49/month</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 mb-5">Most members choose this.</p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Everything in Standard</li>
                <li>✓ Book premium slots in advance</li>
                <li>✓ Up to 10 future bookings</li>
                <li>✓ Priority alert notifications</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Principles</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">Discretion by default.</strong> ClientDining sits quietly alongside existing reservation channels.
            </li>
            <li>
              <strong className="text-gray-900">Quality over quantity.</strong> We work with a small number of venues and grow deliberately.
            </li>
            <li>
              <strong className="text-gray-900">Verified access.</strong> Membership is verified to maintain a professional, high-trust network.
            </li>
          </ul>

          <p className="text-gray-700">
            For restaurants and private members’ clubs:{" "}
            <span className="text-gray-900 font-medium">venues@clientdining.com</span>
          </p>
        </section>

        <section className="mt-14 not-prose">
          <div className="bg-gray-900 text-white p-10 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">Join ClientDining</h2>
            <p className="text-gray-300 mb-7">
              Access live availability at London’s leading restaurants and private members’ clubs.
            </p>
            <a
              href="/login"
              className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Login
            </a>
            <p className="text-sm text-gray-400 mt-4">
              New members can request access from the login screen.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
