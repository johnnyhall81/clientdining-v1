export default function AboutPage() {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About ClientDining</h1>
        </div>
  
        <div className="prose prose-lg max-w-none">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">What is ClientDining?</h2>
            <p className="text-gray-700">
              ClientDining is a private, members-only platform that gives City professionals exclusive access to premium dining reservations across London's finest restaurants and private members' clubs.
            </p>
            <p className="text-gray-700">
              We curate availability from the most sought-after venues, allowing our members to secure tables that would otherwise be impossible to book.
            </p>
          </section>
  
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">1. Browse Premium Venues</h3>
                <p className="text-gray-700">
                  Explore our carefully curated selection of Michelin-starred restaurants and exclusive private members' clubs across London.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">2. View Real Availability</h3>
                <p className="text-gray-700">
                  See actual available time slots in real-time. No more calling around or waiting on endless reservation lists.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">3. Book Instantly</h3>
                <p className="text-gray-700">
                  Reserve your table with a single click. Manage all your bookings in one place.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">4. Set Smart Alerts</h3>
                <p className="text-gray-700">
                  Can't find the slot you want? Set an alert and we'll notify you the moment it becomes available.
                </p>
              </div>
            </div>
          </section>
  
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Membership Tiers</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 mb-4">Perfect for occasional diners</p>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Browse all venues</li>
                  <li>✓ Book standard restaurant tables</li>
                  <li>✓ Book any table within 24 hours</li>
                  <li>✓ Set alerts on any slot</li>
                  <li>✓ Up to 3 future bookings</li>
                </ul>
              </div>
              
              <div className="border-2 border-blue-600 rounded-lg p-6 bg-blue-50">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium - £49/month</h3>
                <p className="text-gray-600 mb-4">For serious food enthusiasts</p>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Everything in Free, plus:</li>
                  <li>✓ Book premium restaurant slots in advance</li>
                  <li>✓ Up to 10 future bookings</li>
                  <li>✓ Priority alert notifications</li>
                </ul>
              </div>
            </div>
          </section>
  
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Who Is This For?</h2>
            <p className="text-gray-700">
              ClientDining is designed for City professionals who value exceptional dining experiences but don't have time to hunt for reservations. Our members include:
            </p>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>• Finance and legal professionals entertaining clients</li>
              <li>• Food enthusiasts seeking the best tables in London</li>
              <li>• Busy professionals who want guaranteed access to top venues</li>
              <li>• Anyone who appreciates fine dining and exclusive experiences</li>
            </ul>
          </section>
  
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Our Commitment</h2>
            <p className="text-gray-700">
              We prioritize quality over quantity. Every venue on our platform is carefully curated, and we maintain close relationships with each establishment to ensure our members receive exceptional service.
            </p>
            <p className="text-gray-700">
              Professional verification is required for all members to maintain the integrity and exclusivity of our community.
            </p>
          </section>
  
          <section className="bg-gray-900 text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-6">
              Join ClientDining today and gain access to London's most exclusive dining experiences.
            </p>
            <a href="/signup" className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Create Your Account
            </a>
          </section>
        </div>
      </div>
    )
  }