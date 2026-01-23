export default function TermsPage() {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-sm text-gray-600">Last updated: January 2026</p>
        </div>
  
        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using ClientDining ("the Platform"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old and a verified City professional to use ClientDining. By registering, you confirm that:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>You are legally capable of entering into binding contracts</li>
              <li>You will provide accurate and truthful information</li>
              <li>You are a professional working in qualifying industries</li>
              <li>You will maintain the confidentiality of your account</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Professional Verification</h3>
            <p>
              All users must complete professional verification before making bookings. We reserve the right to verify your professional status and refuse or revoke access if verification cannot be completed.
            </p>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Membership Tiers</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Free Membership</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li>Access to standard restaurant bookings</li>
              <li>Ability to book any slot within 24 hours</li>
              <li>Maximum of 3 future bookings (more than 24 hours away)</li>
              <li>Alert functionality on all slots</li>
            </ul>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">4.2 Premium Membership (£49/month)</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li>All Free tier benefits</li>
              <li>Access to premium slots more than 24 hours in advance</li>
              <li>Maximum of 10 future bookings</li>
              <li>Priority alert notifications</li>
            </ul>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">4.3 Subscription Terms</h3>
            <p>
              Premium subscriptions are billed monthly. You may cancel at any time, and you will retain Premium benefits until the end of your billing period. No refunds are provided for partial months.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Booking Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Making Bookings</h3>
            <p>
              Bookings are subject to availability and tier restrictions. The 24-hour rule applies: any slot within 24 hours of start time can be booked by any tier.
            </p>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">5.2 Cancellations</h3>
            <p>
              You may cancel bookings through the Platform. We encourage early cancellation to allow others to book. Repeated last-minute cancellations may result in account restrictions.
            </p>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">5.3 No-Shows</h3>
            <p>
              Failure to honor a booking without canceling may result in account suspension or termination. Venues may report no-shows to the Platform.
            </p>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">5.4 Booking Limits</h3>
            <p>
              You may not hold more than your tier's booking limit for future reservations. The system prevents overlapping bookings within 2 hours of each other.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Alert System</h2>
            <p>
              Alerts notify you when slots become available but do not guarantee bookings. Normal booking rules and tier restrictions apply. For slots more than 24 hours away, alerts operate on a first-in-first-out (FIFO) basis with a 15-minute reservation window.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Premium Subscription</h3>
            <p>
              Premium subscriptions are charged monthly via Stripe. You authorize us to charge your payment method on a recurring basis until you cancel.
            </p>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">7.2 Failed Payments</h3>
            <p>
              If payment fails, you will have a grace period to update your payment method. Failure to resolve payment issues will result in downgrade to Free tier.
            </p>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">7.3 Refunds</h3>
            <p>
              Premium subscriptions are non-refundable. Upon cancellation, you retain access until the end of the billing period.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Venue Relationships</h2>
            <p>
              ClientDining acts as a booking platform only. We are not responsible for the quality of service, food, or experiences at venues. Disputes with venues should be resolved directly with the establishment.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Use the Platform for any unlawful purpose</li>
              <li>Share your account credentials with others</li>
              <li>Make fraudulent bookings or abuse the alert system</li>
              <li>Harass or abuse venue staff or other users</li>
              <li>Attempt to circumvent booking limits or tier restrictions</li>
              <li>Use automated systems to make bookings</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, or other reasonable cause. You may delete your account at any time by contacting us.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Intellectual Property</h2>
            <p>
              All content on the Platform, including text, graphics, logos, and software, is the property of ClientDining or its licensors and is protected by intellectual property laws.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Disclaimer of Warranties</h2>
            <p>
              The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access, accuracy of information, or availability of bookings.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ClientDining shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified terms.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Governing Law</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of courts in London.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
            </p>
            <p className="mt-2">
              Email: support@clientdining.com<br />
              Address: 2 The Topiary, Ashtead, Surrey, KT21 2TE
            </p>
          </section>
        </div>
      </div>
    )
  }