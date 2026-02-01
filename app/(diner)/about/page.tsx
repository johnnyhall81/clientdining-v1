export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <header className="mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About</h1>
        <p className="text-xl text-gray-700 max-w-3xl leading-relaxed">
          ClientDining is a private platform for managing business dining reservations
          at a selected set of restaurants and private members’ clubs in London.
        </p>
      </header>

      <div className="prose prose-lg max-w-none space-y-24">
        {/* What it is */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-gray-900">What it is</h2>

          <p className="text-gray-700">
            ClientDining is used for client meetings, team dinners, and small corporate
            gatherings. It brings venue availability and booking into one place.
          </p>

          <p className="text-gray-700">
            Availability is shown based on information shared by participating venues
            and updated as changes are received.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-7">
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>

          <div className="grid gap-4 not-prose">
            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-7">
              <h3 className="font-semibold text-gray-900 mb-2">Browse venues</h3>
              <p className="text-gray-700">
                A focused selection of restaurants and private members’ clubs,
                reviewed for business suitability.
              </p>
            </div>

            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-7">
              <h3 className="font-semibold text-gray-900 mb-2">View availability</h3>
              <p className="text-gray-700">
                Dates, times, and table sizes are shown based on the latest venue updates.
              </p>
            </div>

            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-7">
              <h3 className="font-semibold text-gray-900 mb-2">Request a table</h3>
              <p className="text-gray-700">
                Reservation requests are submitted through the platform and
                handled based on venue response.
              </p>
            </div>

            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-7">
              <h3 className="font-semibold text-gray-900 mb-2">Set alerts</h3>
              <p className="text-gray-700">
                Alerts notify you when a monitored slot becomes available.
              </p>
            </div>
          </div>
        </section>

        {/* Membership */}
        <section className="space-y-7">
          <h2 className="text-2xl font-bold text-gray-900">Membership</h2>

          <p className="text-gray-700">
            ClientDining offers two membership tiers.
          </p>

          <div className="grid md:grid-cols-2 gap-8 not-prose">
            <div className="border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
              <ul className="space-y-2 text-gray-700 list-none m-0 p-0">
                <li>✓ Browse all listed venues</li>
                <li>✓ Request standard restaurant tables</li>
                <li>✓ Request any table within 24 hours</li>
                <li>✓ Set alerts on monitored slots</li>
                <li>✓ Up to three future bookings</li>
              </ul>
            </div>

            <div className="border border-gray-300 rounded-2xl p-8 bg-gray-50">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-gray-900">Premium</h3>
                <span className="text-sm font-medium text-gray-900">£49/month</span>
              </div>
              <ul className="space-y-2 text-gray-700 list-none m-0 p-0 mt-4">
                <li>✓ Request premium slots further in advance</li>
                <li>✓ Up to ten future bookings</li>
                <li>✓ Priority alert notifications</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Venue selection */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-gray-900">Venues</h2>

          <p className="text-gray-700">
            ClientDining works with a limited number of restaurants and private
            members’ clubs in London.
          </p>

          <ul className="space-y-2 text-gray-700 ml-6">
            <li>• Suitable for business dining</li>
            <li>• Consistent service standards</li>
            <li>• Willing to share availability information</li>
          </ul>
        </section>

        {/* Access */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-gray-900">Access</h2>

          <p className="text-gray-700">
            Membership is verified using professional information, typically via LinkedIn.
          </p>

          <p className="text-gray-700">
            Access is subject to approval and is not open to the general public.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-gray-900 text-white p-10 rounded-2xl not-prose">
          <h2 className="text-2xl font-bold mb-3">Sign in</h2>
          <p className="text-gray-300 mb-7">
            Sign in to manage reservations and membership.
          </p>
          <a
            href="/login"
            className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Login
          </a>
        </section>
      </div>
    </div>
  )
}
