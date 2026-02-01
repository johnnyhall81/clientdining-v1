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

        <section className="space-y-6 mt-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Membership</h2>
            <p className="text-gray-600">Standard for occasional dining. Premium for regular hosting.</p>
          </div>

          <div className="not-prose grid md:grid-cols-2 gap-6 mt-8">
            {/* Standard Card */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white hover:shadow-sm transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Standard</h3>
              <p className="text-sm text-gray-600 mb-6">Perfect for occasional client dinners</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Access exceptional restaurants</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Book tables available within 24 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Smart alerts for preferred times</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Hold up to three future bookings</span>
                </li>
              </ul>

              <a 
                href="/signup"
                className="block w-full text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Get started
              </a>
            </div>

            {/* Premium Card */}
            <div className="border border-gray-800 rounded-xl p-8 bg-gray-50 relative overflow-hidden hover:shadow-md transition-shadow">
              {/* Subtle accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900"></div>
              
              <div className="flex items-baseline justify-between gap-4 mb-1">
                <h3 className="text-xl font-semibold text-gray-900">Premium</h3>
                <span className="text-lg font-semibold text-gray-900">£49/month</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">For frequent business entertainment</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-900 text-sm font-medium">Everything in Standard, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Plan ahead with advance premium bookings</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Hold up to ten future bookings</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Priority access when tables become available</span>
                </li>
              </ul>

              <a 
                href="/signup?tier=premium"
                className="block w-full text-center py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Upgrade to Premium
              </a>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Recommended for professionals hosting 2+ client dinners per month
              </p>
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

        <section className="mt-16 pt-8 border-t border-gray-200 not-prose">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Ready to get started?{' '}
              <a 
                href="/signup"
                className="text-gray-900 hover:underline font-medium"
              >
                Create your account
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}