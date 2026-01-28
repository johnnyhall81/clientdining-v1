export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About ClientDining
        </h1>
      </div>

      <div className="prose prose-lg max-w-none space-y-16">
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            What is ClientDining?
          </h2>
          <p className="text-gray-700">
            ClientDining is a private, members-only platform providing City professionals with exclusive access to premium dining reservations across London's leading restaurants and private members' clubs.
          </p>
          <p className="text-gray-700">
            We curate live availability from London's most sought-after venues, giving members access to tables that are typically unavailable to the public.
          </p>
          <p className="text-gray-700">
            ClientDining is built around intentional business dining — discreet reservations for client meetings, team dinners, and corporate gatherings, rather than promotional or discounted experiences.
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">
            How It Works
          </h2>

          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Browse Premium Venues
              </h3>
              <p className="text-gray-700">
                Browse a curated selection of leading restaurants and private members' clubs across London, suitable for everything from intimate client dinners to larger corporate events.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">
                2. View Real Availability
              </h3>
              <p className="text-gray-700">
                View genuine, real-time availability — no waiting lists, no back-and-forth.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Book Instantly
              </h3>
              <p className="text-gray-700">
                Secure your table instantly and manage all bookings in one place.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">
                4. Set Smart Alerts
              </h3>
              <p className="text-gray-700">
                If your preferred time isn't available, set a smart alert and be notified the moment it opens.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Membership Tiers
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Standard
              </h3>
              <p className="text-gray-600 mb-6">
                Ideal for occasional dining and last-minute bookings
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Browse all venues</li>
                <li>✓ Book standard restaurant tables</li>
                <li>✓ Book any table within 24 hours</li>
                <li>✓ Set alerts on any slot</li>
                <li>✓ Up to 3 future bookings</li>
              </ul>
            </div>

            <div className="border-2 border-blue-600 rounded-xl p-8 bg-blue-50">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Premium – £49/month
              </h3>
              <p className="text-gray-600 mb-6">
                Designed for frequent client entertainment and team dining
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Everything in Standard, plus:</li>
                <li>✓ Book premium restaurant slots in advance</li>
                <li>✓ Up to 10 future bookings</li>
                <li>✓ Priority alert notifications</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Who Is This For?
          </h2>
          <p className="text-gray-700">
            ClientDining is designed for City professionals who regularly host business dinners and value exceptional dining without the friction of chasing reservations.
          </p>
          <ul className="space-y-2 text-gray-700 ml-6">
            <li>• Finance and legal professionals entertaining clients</li>
            <li>• Team leaders organizing dinners and celebrations</li>
            <li>• Firms hosting corporate events, round tables, and industry gatherings</li>
            <li>• Busy professionals who want reliable access to top venues</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Our Commitment
          </h2>
          <p className="text-gray-700">
            We prioritise quality over quantity. Every venue is personally vetted, and we work closely with each establishment to ensure members receive a consistently high standard of service.
          </p>
          <p className="text-gray-700">
            ClientDining is designed to sit quietly alongside existing reservation channels. The emphasis is on discretion, quality, and operational ease — not marketing, discounts, or volume for its own sake.
          </p>
          <p className="text-gray-700">
            We launch and grow deliberately, working with a small number of carefully selected restaurants and private members' clubs to ensure consistent availability and a high-quality experience.
          </p>
          <p className="text-gray-700">
            Access to ClientDining is verified via LinkedIn to confirm professional background and maintain a discreet, high-quality network.
          </p>
        </section>

        <section className="bg-gray-900 text-white p-10 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-8">
            Join ClientDining and unlock access to London's most sought-after dining reservations.
          </p>
          <a
            href="/signup"
            className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Your Account
          </a>
        </section>
      </div>
    </div>
  )
}
