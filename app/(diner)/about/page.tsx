export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About</h1>
        <p className="text-lg text-gray-700 max-w-3xl leading-relaxed">
          A private platform for booking business dinners at a small number of restaurants
          and private members’ clubs in London.
        </p>
      </div>

      <div className="prose prose-lg max-w-none space-y-16">
        {/* About */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">About ClientDining</h2>

          <p className="text-gray-700">
            ClientDining is designed for people who regularly take clients or colleagues
            out to dinner and want a straightforward way to see what’s available,
            request a table, and keep bookings in one place.
          </p>

          <p className="text-gray-700">
            Availability on ClientDining is shown based on information shared by venues
            and updated as changes come in. In practice, this means you can usually see
            dates, times, and table sizes without having to email, call, or wait for a reply.
          </p>
        </section>

        {/* How people use */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">How people use ClientDining</h2>

          <div className="space-y-4 not-prose">
            <div className="bg-gray-50/70 p-6 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Browse venues</h3>
              <p className="text-gray-700 leading-relaxed">
                Members browse a short list of restaurants and private members’ clubs
                that work well for business dinners. Venues are chosen with professional
                settings in mind.
              </p>
            </div>

            <div className="bg-gray-50/70 p-6 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Request a table</h3>
              <p className="text-gray-700 leading-relaxed">
                When a table is available, members submit a booking request through the
                platform. In many cases this is confirmed quickly, but timing ultimately
                depends on the venue.
              </p>
            </div>

            <div className="bg-gray-50/70 p-6 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Set alerts</h3>
              <p className="text-gray-700 leading-relaxed">
                If the time you want isn’t available, you can set an alert on that slot.
                When availability changes and the slot opens up, you’ll get a notification.
                Premium members receive alerts first when there’s competition for the
                same table.
              </p>
            </div>
          </div>
        </section>

        {/* Membership */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Membership</h2>

          <p className="text-gray-700">
            ClientDining has two membership levels: Standard and Premium.
          </p>

          <div className="grid md:grid-cols-2 gap-8 not-prose">
            <div className="border border-gray-200 rounded-xl p-8 bg-white">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Free. Best if you book occasionally or tend to plan at short notice.
              </p>
              <ul className="space-y-2 text-gray-700 m-0 p-0 list-none">
                <li>✓ Browse all venues</li>
                <li>✓ Request standard restaurant tables</li>
                <li>✓ Book any table within 24 hours</li>
                <li>✓ Set alerts on any slot</li>
                <li>✓ Hold up to three future bookings</li>
              </ul>
            </div>

            <div className="border border-gray-300 rounded-xl p-8 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Premium — £49/month
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                For people who host business dinners regularly and prefer to plan ahead.
              </p>
              <ul className="space-y-2 text-gray-700 m-0 p-0 list-none">
                <li>✓ Everything in Standard</li>
                <li>✓ Request certain tables further in advance</li>
                <li>✓ Hold up to ten future bookings</li>
                <li>✓ Priority alert notifications</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Venues */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">The venues</h2>

          <p className="text-gray-700">
            ClientDining works with a smaller group of restaurants and private members’
            clubs that are comfortable hosting business dinners and willing to share
            availability information.
          </p>

          <p className="text-gray-700">
            New venues are added gradually rather than all at once.
          </p>
        </section>

        {/* Access */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Access and verification</h2>

          <p className="text-gray-700">
            Membership is intended for professional use and is verified using publicly
            available information, typically LinkedIn profiles.
          </p>

          <p className="text-gray-700">
            Access isn’t open to the general public, and new members are approved before
            they can use the platform.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-gray-900 text-white p-10 rounded-2xl not-prose">
          <h2 className="text-2xl font-bold mb-3">Join ClientDining</h2>
          <p className="text-gray-300 mb-7 leading-relaxed">
            Create an account to request access and start booking.
          </p>
          <a
            href="/signup"
            className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Join
          </a>
          <p className="text-sm text-gray-400 mt-4">
            Access is subject to approval.
          </p>
        </section>
      </div>
    </div>
  )
}
