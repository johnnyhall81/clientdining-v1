export default function PrivacyPage() {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-600">Last updated: January 2026</p>
        </div>
  
        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              ClientDining ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Name and email address</li>
              <li>Professional verification details</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Booking preferences and history</li>
              <li>Communications with us</li>
            </ul>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.2 Automatically Collected Information</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your bookings and transactions</li>
              <li>Send you booking confirmations and alerts</li>
              <li>Verify your professional status</li>
              <li>Communicate with you about our services</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 With Venues</h3>
            <p>
              We share your name and booking details with venues when you make a reservation. Venues see limited information necessary to fulfill your booking (name, party size, date/time, and any special notes).
            </p>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">4.2 With Service Providers</h3>
            <p>We share information with third-party service providers who perform services on our behalf:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Payment processing (Stripe)</li>
              <li>Email delivery services</li>
              <li>Analytics providers</li>
              <li>Hosting and infrastructure providers</li>
            </ul>
  
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">4.3 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law or in response to valid legal requests.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict certain processing</li>
              <li>Withdraw consent at any time</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at privacy@clientdining.com
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Booking history may be retained for accounting and legal purposes even after account closure.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to improve your experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect information from children.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email: support@clientdining.com<br />
              Address: [Business Address]
            </p>
          </section>
        </div>
      </div>
    )
  }