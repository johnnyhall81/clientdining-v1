export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Page header */}
      <div className="mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About ClientDining
        </h1>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none space-y-16">
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            What is ClientDining?
          </h2>
          <p className="text-gray-700">
            ClientDining is a private, members-only platform that gives City professionals exclusive access to premium dining reservations across London's finest restaurants and private members' clubs.
          </p>
          <p className="text-gray-700">
            We curate availability from the most sought-after venues, allowing our members to secure tables that would otherwise be impossible to book.
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">
            How It Works
          </h2>

          <div className="space-y-4">
            {[
              ["1. Browse Premium Venues", "Explore our carefully curated selection of Michelin-starred restaurants and exclusive private members' clubs across London."],
              ["2. View Real Availability", "See actual available time slots in real-time. No more calling around or waiting on endless reservation lists."],
              ["3. Book Instantly", "Reserve your table with a single click. Manage all your bookings in one place."],
              ["4. Set Smart Alerts", "Can't find the slot you want? Set an alert and we'll notify you the moment it becomes available."]
            ].map(([title, text]) => (
              <div
                key={title}
                className="bg-gray-50 p-6 rounded-xl"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Membership Tiers
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Free
              </h3>
              <p className="text-gray-600 mb-6">
                Perfect for occasional diners
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Browse all venues</li>
                <li>✓ Book standard restaurant tables</li>
                <li>✓ Book any table within 24 hours</li>
                <li>✓ Set alerts on any slot</li>
                <li>✓ Up to 3 future bookings</li>
              </ul>
            </div>

            <div className="border-2 border-blue-600 bg-blue-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Premium – £49/month
              </h3>
              <p className="text-gray-600 mb-6">
                For serious food enthusiasts
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Everything in Free, plus:</li>
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
            ClientDining is designed for City professionals who value exceptional dining experiences but don't have time to hunt for reservations. Our members include:
          </p>
          <ul className="space-y-2 text-gray-700 ml-6">
            <li>• Finance and legal professionals entertaining clients</li>
            <li>• Food enthusiasts seeking the best tables in London</li>
            <li>• Busy professionals who want guaranteed access to top venues</li>
            <li>• Anyone who apprecia
