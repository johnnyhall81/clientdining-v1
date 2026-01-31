export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          About
        </h1>
        <p className="text-lg text-gray-700">
          Live availability at London's leading restaurants and private members' clubs.
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <section className="space-y-4">
          <p className="text-gray-700">
            ClientDining is built for business dining: client meetings, team dinners, and private roundtables. 
            Availability is accurate. Bookings are immediate. Set alerts on any slot.
          </p>
        </section>

        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Membership</h2>

          <div className="not-prose grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Standard</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>Browse all venues</li>
                <li>Book standard tables and any table within 24 hours</li>
                <li>Set alerts on availability</li>
                <li>Up to 3 future bookings</li>
              </ul>
            </div>

            <div className="border border-gray-900 rounded-xl p-8 bg-gray-50">
              <div className="flex items-baseline justify-between gap-4 mb-4">
                <h3 className="text-xl font-bold text-gray-900">Premium</h3>
                <span className="text-sm font-medium text-gray-900">£49/month</span>
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>Everything in Standard</li>
                <li>Book premium slots in advance</li>
                <li>Up to 10 future bookings</li>
                <li>Priority alert notifications</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4 mt-12">
          <p className="text-gray-700 text-sm">
            Membership is verified. Access is professional.
          </p>

          <p className="text-gray-700 text-sm">
            For venues: <span className="text-gray-900 font-medium">venues@clientdining.com</span>
          </p>
        </section>

        <section className="mt-14 not-prose">
  <div className="bg-gray-900 text-white p-10 rounded-2xl">
    <h2 className="text-2xl font-bold mb-3">Join ClientDining</h2>
    <a                
      href="/login"
      className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
    >
      Sign in
    </a>               
  </div>
</section>
      </div>
    </div>
  )
}