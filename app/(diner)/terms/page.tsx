export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-sm text-zinc-500 font-light">Last updated: February 2026</p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 1. Acceptance of Terms */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">1. Acceptance of Terms</h2>
        <p className="text-zinc-600 leading-relaxed mb-4">
          By accessing and using ClientDining, a trading name of CLIENTDINING LIMITED ("the Platform", "we", "our", "us"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
        </p>
        <p className="text-sm text-zinc-600 leading-relaxed">
          CLIENTDINING LIMITED is a company registered in England and Wales.<br />
          Company Registration No: 17018817<br />
          Registered Office: 2 The Topiary, Ashtead, KT21 2TE
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 2. Eligibility */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">2. Eligibility</h2>
        <p className="text-zinc-600 leading-relaxed mb-6">
          You must be at least 18 years old and a verified City professional to use ClientDining. By registering, you confirm that:
        </p>
        <div className="space-y-3 text-zinc-600 leading-relaxed">
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>You are legally capable of entering into binding contracts</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>You will provide accurate and truthful information</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>You are a professional working in qualifying industries</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>You will maintain the confidentiality of your account</span>
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 3. Account Registration */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">3. Account Registration</h2>
        
        <h3 className="text-2xl font-light text-zinc-900 mb-6">3.1 Professional Verification</h3>
        <p className="text-zinc-600 leading-relaxed mb-8">
          All users must complete professional verification before making bookings. We reserve the right to verify your professional status and refuse or revoke access if verification cannot be completed.
        </p>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">3.2 Account Security</h3>
        <p className="text-zinc-600 leading-relaxed">
          You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized use of your account.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 4. Membership Tiers */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">4. Membership Tiers</h2>
        
        <h3 className="text-2xl font-light text-zinc-900 mb-6">4.1 Free Membership</h3>
        <div className="space-y-3 text-zinc-600 leading-relaxed mb-8">
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Access to standard restaurant bookings</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Ability to book any slot within 24 hours</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Maximum of 3 future bookings (more than 24 hours away)</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Alert functionality on all slots</span>
          </p>
        </div>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">4.2 Premium Membership (£49/month)</h3>
        <div className="space-y-3 text-zinc-600 leading-relaxed mb-8">
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>All Free tier benefits</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Access to premium slots more than 24 hours in advance</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Maximum of 10 future bookings</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Priority alert notifications</span>
          </p>
        </div>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">4.3 Subscription Terms</h3>
        <p className="text-zinc-600 leading-relaxed">
          Premium subscriptions are billed monthly. You may cancel at any time, and you will retain Premium benefits until the end of your billing period. No refunds are provided for partial months.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 5. Booking Policy */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">5. Booking Policy</h2>
        
        <h3 className="text-2xl font-light text-zinc-900 mb-6">5.1 Making Bookings</h3>
        <p className="text-zinc-600 leading-relaxed mb-8">
          Bookings are subject to availability and tier restrictions. The 24-hour rule applies: any slot within 24 hours of start time can be booked by any tier.
        </p>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">5.2 Cancellations</h3>
        <p className="text-zinc-600 leading-relaxed mb-8">
          You may cancel bookings through the Platform. We encourage early cancellation to allow others to book. Repeated last-minute cancellations may result in account restrictions.
        </p>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">5.3 No-Shows</h3>
        <p className="text-zinc-600 leading-relaxed mb-8">
          Failure to honor a booking without canceling may result in account suspension or termination. Venues may report no-shows to the Platform.
        </p>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">5.4 Booking Limits</h3>
        <p className="text-zinc-600 leading-relaxed">
          You may not hold more than your tier's booking limit for future reservations. The system prevents overlapping bookings within 2 hours of each other.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 6. Alert System */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">6. Alert System</h2>
        <p className="text-zinc-600 leading-relaxed">
          Alerts notify you when slots become available but do not guarantee bookings. Normal booking rules and tier restrictions apply. For slots more than 24 hours away, alerts operate on a first-in-first-out (FIFO) basis with a 15-minute reservation window.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 7. Payment Terms */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">7. Payment Terms</h2>
        
        <h3 className="text-2xl font-light text-zinc-900 mb-6">7.1 Premium Subscription</h3>
        <p className="text-zinc-600 leading-relaxed mb-8">
          Premium subscriptions are charged monthly via Stripe. You authorize us to charge your payment method on a recurring basis until you cancel.
        </p>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">7.2 Failed Payments</h3>
        <p className="text-zinc-600 leading-relaxed mb-8">
          If payment fails, you will have a grace period to update your payment method. Failure to resolve payment issues will result in downgrade to Free tier.
        </p>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">7.3 Refunds</h3>
        <p className="text-zinc-600 leading-relaxed">
          Premium subscriptions are non-refundable. Upon cancellation, you retain access until the end of the billing period.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 8. Venue Relationships */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">8. Venue Relationships</h2>
        <p className="text-zinc-600 leading-relaxed mb-4">
          CLIENTDINING LIMITED acts as a booking platform only. We are not responsible for the quality of service, food, or experiences at venues. Disputes with venues should be resolved directly with the establishment.
        </p>
        <p className="text-zinc-600 leading-relaxed">
          Each booking creates a direct contractual relationship between you and the venue. CLIENTDINING LIMITED is not a party to that contract.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 9. User Conduct */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">9. User Conduct</h2>
        <p className="text-zinc-600 leading-relaxed mb-6">You agree not to:</p>
        <div className="space-y-3 text-zinc-600 leading-relaxed">
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Use the Platform for any unlawful purpose</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Share your account credentials with others</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Make fraudulent bookings or abuse the alert system</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Harass or abuse venue staff or other users</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Attempt to circumvent booking limits or tier restrictions</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Use automated systems to make bookings</span>
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 10. Account Termination */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">10. Account Termination</h2>
        <p className="text-zinc-600 leading-relaxed">
          We reserve the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, or other reasonable cause. You may delete your account at any time by contacting us.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 11. Intellectual Property */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">11. Intellectual Property</h2>
        <p className="text-zinc-600 leading-relaxed">
          All content on the Platform, including text, graphics, logos, and software, is the property of CLIENTDINING LIMITED or its licensors and is protected by intellectual property laws.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 12. Disclaimer of Warranties */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">12. Disclaimer of Warranties</h2>
        <p className="text-zinc-600 leading-relaxed">
          The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access, accuracy of information, or availability of bookings.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 13. Limitation of Liability */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">13. Limitation of Liability</h2>
        <p className="text-zinc-600 leading-relaxed">
          To the maximum extent permitted by law, CLIENTDINING LIMITED shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform. Nothing in these terms excludes or limits our liability for death or personal injury caused by our negligence, fraud, or any liability that cannot be excluded under English law.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 14. Changes to Terms */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">14. Changes to Terms</h2>
        <p className="text-zinc-600 leading-relaxed">
          We may modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified terms.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 15. Governing Law */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">15. Governing Law</h2>
        <p className="text-zinc-600 leading-relaxed">
          These Terms are governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 16. Contact */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">16. Contact</h2>
        <p className="text-zinc-600 leading-relaxed mb-4">
          For questions about these Terms, contact us at:
        </p>
        <p className="text-zinc-600 leading-relaxed">
          CLIENTDINING LIMITED<br />
          Email: support@clientdining.com<br />
          Address: 2 The Topiary, Ashtead, KT21 2TE<br />
          Company Registration No: 17018817
        </p>
      </section>

      {/* Bottom Spacing */}
      <div className="h-24"></div>
    </div>
  )
}
