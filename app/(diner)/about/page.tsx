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
          A private booking platform for City professionals hosting business dinners at London's leading restaurants and private members' clubs.
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
            Restaurants share availability directly with the platform. Members see dates, times, and table sizes. Submit a request. The venue confirms.
          </p>
          <p>
            High-demand slots are reserved for Premium members. If unfilled, they open to all members in the final 24 hours.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* Membership */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-12">Membership</h2>
        
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
                <span>Hold three future bookings</span>
              </li>
            </ul>
            <p className="text-sm text-zinc-500 italic pt-4 border-t border-zinc-200">
              Grab high-demand slots if they're still available in the final 24 hours.
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
                <span>Immediate access to high-demand slots</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Hold ten future bookings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-zinc-400">•</span>
                <span>Priority alerts</span>
              </li>
            </ul>
          </div>
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
          A limited number of restaurants and private members' clubs selected for consistent service, appropriate atmosphere, and discretion.
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
          Membership verified via LinkedIn. Approved individually.
        </p>
        
        <a 
          href="/signup" 
          className="inline-block bg-zinc-900 text-zinc-50 px-8 py-4 hover:bg-zinc-800 transition-colors duration-200"
        >
          Apply for membership
        </a>
      </section>

      {/* Bottom Spacing */}
      <div className="h-24"></div>
    </div>
  );
}
