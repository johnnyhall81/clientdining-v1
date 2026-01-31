export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About</h1>
        <p className="text-lg text-gray-700 max-w-3xl">
          ClientDining is a private platform used to manage business dining reservations at a selected set of restaurants and
          private members’ clubs in London.
        </p>
      </div>

      <div className="prose prose-lg max-w-none space-y-16">
        {/* About */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">About ClientDining</h2>
          <p className="text-gray-700">
            Members use the platform to view venue availability, submit reservation requests, and manage bookings in one
            place. Availability is presented based on information shared by participating venues and is updated as changes
            are received.
          </p>
          <p className="text-gray-700">
            The platform is designed for professional use cases, including client meetings, team dinners, corporate
            gatherings, and private roundtables. Venues are selected for their suitability to business settings and their
            ability to support professional hosting requirements.
          </p>
        </section>

        {/* How members use */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">How Members Use ClientDining</h2>

          <div className="space-y-4 not-prose">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Browse Venues</h3>
              <p className="text-gray-700">
                Members access a limited selection of restaurants and private members’ clubs across London. Venues are
                reviewed prior to inclusion, with consideration given to service standards, discretion, and operational
                reliability.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">View Availability</h3>
              <p className="text-gray-700">
                Availability is displayed for each venue, including date, time, and table capacity. Information shown
                reflects the most recent availability shared by the venue. Availability may change due to operational
                factors outside the platform’s control.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Book Tables</h3>
              <p className="text-gray-700">
                Reservation requests are submitted through the platform. Where possible, bookings are confirmed promptly
                based on venue response. Members manage all reservations through a single interface.
              </p>
              <p className="text-gray-700 mt-3">
                Standard tables are available to all members. Access to premium slots requires Premium membership and may
                allow booking further in advance, subject to venue availability.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Set Alerts</h3>
              <p className="text-gray-700">
                When a preferred slot is unavailable, members may set an alert for that time. Alerts notify members when
                availability is updated to show an open slot. Priority notifications may apply to Premium members.
              </p>
            </div>
          </div>
        </section>

        {/* Membership tiers */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Membership Tiers</h2>

          <p className="text-gray-700">
            ClientDining offers two membership tiers: Standard and Premium.
          </p>

          <div className="grid md:grid-cols-2 gap-8 not-prose">
            <div className="border-2 border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
              <p className="text-gray-600 mb-6">Standard membership is available at no cost. Members may:</p>
              <ul className="space-y-2 text-gray-700 m-0 p-0 list-none">
                <li>✓ Browse all venues listed on the platform</li>
                <li>✓ Submit requests for standard restaurant tables</li>
                <li>✓ Submit requests for any table within 24 hours of the intended reservation time</li>
                <li>✓ Set alerts on monitored slots</li>
                <li>✓ Hold up to three active future bookings</li>
              </ul>
              <p className="text-gray-600 mt-6">
                Standard membership is intended for professionals who book infrequently or primarily at short notice.
              </p>
            </div>

            <div className="border-2 border-blue-600 rounded-xl p-8 bg-blue-50">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium — £49/month</h3>
              <p className="text-gray-600 mb-2">
                Premium membership includes all Standard features, with additional access and capacity:
              </p>
              <p className="text-sm text-gray-600 mb-6">Most members choose this.</p>
              <ul className="space-y-2 text-gray-700 m-0 p-0 list-none">
                <li>✓ Submit requests for premium restaurant slots further in advance</li>
                <li>✓ Hold up to ten active future bookings</li>
                <li>✓ Receive priority alert notifications, where applicable</li>
              </ul>
              <p className="text-gray-600 mt-6">
                Premium membership is intended for professionals who host business dinners regularly and require greater
                forward-planning flexibility.
              </p>
            </div>
          </div>
        </section>

        {/* Venue selection */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Venue Selection</h2>
          <p className="text-gray-700">
            ClientDining works with a focused group of restaurants and private members’ clubs in London. Venues are selected
            based on:
          </p>
          <ul className="space-y-2 text-gray-700 ml-6">
            <li>• Consistency and quality of service</li>
            <li>• Suitability for business dining</li>
            <li>• Capacity to support professional hosting requirements</li>
            <li>• Willingness to share availability information with the platform</li>
          </ul>
          <p className="text-gray-700">
            The platform does not aim to provide comprehensive coverage of the London dining market. New venues are added
            selectively and reviewed prior to inclusion.
          </p>
        </section>

        {/* Access and verification */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Access and Verification</h2>
          <p className="text-gray-700">
            Membership is verified to support a professional network. Verification is conducted using publicly available
            professional information, typically via LinkedIn.
          </p>
          <p className="text-gray-700">
            This process helps maintain an environment aligned with the platform’s intended use. Access to ClientDining is
            subject to approval and is not open to the general public.
          </p>
        </section>

        {/* Operational principles */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Operational Principles</h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              <strong className="text-gray-900">Accuracy.</strong> Availability is presented based on information provided by
              venues. The platform aims to reflect current availability but is dependent on venue updates and operational
              conditions.
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-900">Discretion.</strong> ClientDining operates alongside existing reservation
              channels and does not publicly promote or market individual venues.
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-900">Quality.</strong> The platform prioritises a limited number of suitable
              venues rather than broad market coverage. Growth is deliberate.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
          <p className="text-gray-700">For venue partnerships: venues@clientdining.com</p>
          <p className="text-gray-700">For member support: support@clientdining.com</p>
        </section>

        {/* CTA */}
        <section className="bg-gray-900 text-white p-10 rounded-2xl not-prose">
          <h2 className="text-2xl font-bold mb-4">Join ClientDining</h2>
          <p className="text-gray-300 mb-8">
            Sign in to manage reservations and membership.
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
        </section>
      </div>
    </div>
  )
}
