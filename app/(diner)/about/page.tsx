import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tight">
          About ClientDining
        </h1>
        <p className="text-xl md:text-2xl text-zinc-600 font-light leading-relaxed max-w-3xl">
          A private booking platform for City professionals hosting business dinners at London&apos;s leading restaurants and private members&apos; clubs.
        </p>
        <p className="text-lg text-zinc-500 mt-6 font-light">
          See availability. Request tables. Confirm bookings.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">How It Works</h2>
        <div className="space-y-6 text-zinc-600 leading-relaxed">
          <p>
            Restaurants share availability directly with the platform. Members see dates, times, and table sizes, submit a request, and the venue confirms.
          </p>
          <p>
            When a table is in demand, access is time-sensitive. Premium members see these slots first. If unfilled, they open to all members in the final 24 hours.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* Membership */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-4">Membership</h2>
        <p className="text-zinc-500 mb-12">
          Two tiers. The difference is access when tables are competitive.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Standard */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-light text-zinc-900 mb-2">Standard</h3>
            </div>
            <ul className="space-y-3 text-zinc-600">
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Access participating venues</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Book available tables</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Set alerts for preferred dates</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Hold up to three future bookings</span>
              </li>
            </ul>
            <p className="text-sm text-zinc-500 italic pt-4 border-t border-zinc-200">
              High-demand tables open to Standard members if still available within 24 hours.
            </p>
          </div>

          {/* Premium */}
          <div className="space-y-6 md:border-l md:border-zinc-200 md:pl-12">
            <div>
              <h3 className="text-2xl font-light text-zinc-900 mb-1">Premium</h3>
              <p className="text-zinc-500">£49/month</p>
            </div>
            <ul className="space-y-3 text-zinc-600">
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Everything in Standard</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>First access when high-demand tables become available</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Hold up to ten future bookings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Early visibility on competitive slots</span>
              </li>
            </ul>
            <p className="text-sm text-zinc-500 italic">
              Commonly expensed as a business tool.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* Company Plans */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">Company Plans</h2>
        <p className="text-zinc-600 leading-relaxed max-w-3xl mb-6">
          ClientDining is often used by teams where multiple people host clients on behalf of the same firm. Company plans provide central billing and shared access, without changing how venues operate.
        </p>
        <p className="text-zinc-500">
          Designed for teams where client hosting is a shared responsibility.
        </p>
        <div className="mt-8">
          <a
            href="/contact"
            className="inline-flex items-center px-6 h-10 text-sm font-light border border-zinc-300 text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            Enquire about company plans
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* The Venues */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">The Venues</h2>
        <p className="text-zinc-600 leading-relaxed max-w-3xl">
          A limited number of restaurants and private members&apos; clubs selected for consistent service, appropriate atmosphere, and discretion.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* Access */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">Access</h2>
        <p className="text-zinc-600 leading-relaxed mb-12">
          Membership is verified via LinkedIn and approved individually.
        </p>

        <a
          href="/signup"
          className="inline-flex items-center px-6 h-10 text-sm font-light bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          Apply for membership
        </a>
      </section>

      {/* Bottom Spacing */}
      <div className="h-24"></div>
    </div>
  );
}
