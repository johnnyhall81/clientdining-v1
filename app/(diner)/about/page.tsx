export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          About ClientDining
        </h1>
        <p className="text-lg text-gray-700">Where you book matters.</p>
      </header>

      <div className="prose prose-lg max-w-none">
        {/* About */}
        <section className="space-y-4">
          <p className="text-gray-700">
            ClientDining is a private booking platform for City professionals hosting business dinners at London&apos;s
            leading restaurants and private members&apos; clubs.
          </p>
          <p className="text-gray-700">
            It provides a reliable way to see availability, request tables, and manage bookings — without chasing
            confirmations or relying on personal relationships.
          </p>
          <p className="text-gray-700">
            Availability is shared directly by venues. Members see real dates, times, and table sizes in one place.
          </p>
          <p className="text-gray-700">
            ClientDining is designed for business dining where discretion, service, and reliability are expected.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-700">
            ClientDining maintains a curated list of restaurants and private members&apos; clubs suited to business
            dining.
          </p>
          <p className="text-gray-700">
            Venues share availability directly with the platform. Members see what is genuinely available.
          </p>
          <p className="text-gray-700">
            When a table suits, a request is submitted. The venue confirms on its timeline. All updates and
            confirmations stay in one place.
          </p>
          <p className="text-gray-700">
            If a preferred slot isn&apos;t available, members can set an alert and be notified when availability
            changes. Priority applies where tables are competitive.
          </p>
        </section>

        {/* Membership */}
        <section className="space-y-6 mt-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Membership</h2>
            <p className="text-gray-600">Two tiers. The difference is certainty.</p>
          </div>

          <div className="not-prose grid md:grid-cols-2 gap-6 mt-8">
            {/* Standard Card */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white hover:shadow-sm transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Standard</h3>
              <p className="text-sm text-gray-600 mb-6">For occasional business dining</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Access participating venues</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Book tables available within 24 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Set alerts for preferred times</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
              <p className="text-sm text-gray-600 mb-6">For regular hosting</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-900 text-sm font-medium">Everything in Standard, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Early access to select availability</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Hold up to ten future bookings</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">Priority alerts when tables are in demand</span>
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

        {/* Venues */}
        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">The venues</h2>
          <p className="text-gray-700">ClientDining works with a limited number of restaurants and private members&apos; clubs.</p>
          <p className="text-gray-700">
            Venues are selected for consistent service, appropriate atmosphere, and discretion. Availability is shared
            at their discretion, and bookings remain subject to their usual acceptance process.
          </p>
          <p className="text-gray-700">New venues are added selectively.</p>
        </section>

        {/* Access */}
        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Access</h2>
          <p className="text-gray-700">ClientDining is intended for professional use.</p>
          <p className="text-gray-700">
            Membership is verified via LinkedIn and approved individually. Access is not open to the general public.
          </p>
          <p className="text-gray-700">
            This maintains a trusted network for members and a professional clientele for venues.
          </p>
        </section>

        <section className="mt-16 pt-8 border-t border-gray-200 not-prose">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Ready to get started?{" "}
              <a href="/signup" className="text-gray-900 hover:underline font-medium">
                Create your account
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
