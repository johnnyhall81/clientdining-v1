export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About</h1>
      </div>

      <div className="prose prose-lg max-w-none space-y-16">
        {/* About */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">About ClientDining</h2>

          <p className="text-gray-700">
            ClientDining is a private platform used by City professionals to manage business dining reservations at a select
            number of restaurants and private members’ clubs in London.
          </p>

          <p className="text-gray-700">
            It’s designed for people who regularly take clients or colleagues out to dinner and want a straightforward way
            to see what’s available, request a table, and keep bookings in one place.
          </p>

          <p className="text-gray-700">
            Availability on ClientDining is shown based on information shared by the venues themselves and updated as
            changes are received. In practice, this means you can usually see dates, times, and table sizes without having
            to email, call, or wait for a reply.
          </p>

          <p className="text-gray-700">
            ClientDining is built around intentional business dining — discreet reservations for client meetings, team
            dinners, and private roundtables.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>

          <p className="text-gray-700">Most members use ClientDining in a simple way.</p>

          <p className="text-gray-700">
            They browse a short list of restaurants and private members’ clubs that work well for business dinners. Venues
            are chosen with professional settings in mind — places where conversation matters and hosting feels
            appropriate.
          </p>

          <p className="text-gray-700">
            When a table is available, members submit a booking request through the platform. In many cases this is
            confirmed quickly, but timing ultimately depends on the venue. All requests and bookings are managed in one
            place.
          </p>

          <p className="text-gray-700">
            If the time you want isn’t available, you can set an alert on that slot. When availability changes and the slot
            opens up, you’ll receive a notification. Premium members receive priority alerts when there is competition for
            the same table.
          </p>
        </section>

        {/* Membership */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Membership</h2>

          <p className="text-gray-700">
            ClientDining has two membership tiers: Standard and Premium.
          </p>

          <div className="not-prose grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl p-8 bg-white">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
              <ul className="space-y-2 text-gray-700 m-0 p-0 list-none">
                <li>✓ Request standard restaurant tables</li>
                <li>✓ Book premium tables last minute</li>
                <li>✓ Set alerts on any slot</li>
                <li>✓ Hold up to three future bookings</li>
              </ul>
            </div>

            <div className="border border-amber-600 rounded-xl p-8 bg-white">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium — £49/month</h3>
              <ul className="space-y-2 text-gray-700 m-0 p-0 list-none">
                <li>✓ Premium includes everything in Standard, plus</li>
                <li>✓ Request premium tables further in advance</li>
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
            ClientDining doesn’t try to list every restaurant in London. Instead, it works with a select group of
            restaurants and private members’ clubs that are comfortable hosting business dinners and willing to share
            availability information.
          </p>

          <p className="text-gray-700">
            Venues tend to be places with consistent service, the right atmosphere for professional conversations, and the
            ability to accommodate different group sizes. New venues are added gradually rather than all at once.
          </p>
        </section>

        {/* Access */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Access and verification</h2>

          <p className="text-gray-700">
            ClientDining is intended for professional use. Membership is verified via LinkedIn to maintain a professional network.
          </p>

          <p className="text-gray-700">
            Access isn’t open to the general public, and new members are approved before they can use the platform.
          </p>
        </section>


        {/* CTA */}
        <section className="bg-gray-900 text-white p-10 rounded-2xl not-prose">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
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
