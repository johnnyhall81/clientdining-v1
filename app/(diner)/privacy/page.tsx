export default function PrivacyPage() {
  return (
    <div className="">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 font-light">Last updated: February 2026</p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 1. Introduction */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">1. Introduction</h2>
        <p className="text-zinc-600 leading-relaxed mb-4">
          CLIENTDINING LIMITED ("ClientDining", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
        </p>
        <p className="text-sm text-zinc-600 leading-relaxed">
          CLIENTDINING LIMITED is a company registered in England and Wales.<br />
          Company Registration No: 17018817<br />
          Registered in England and Wales
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 2. Information We Collect */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">2. Information We Collect</h2>
        
        <h3 className="text-2xl font-light text-zinc-900 mb-6">2.1 Personal Information</h3>
        <p className="text-zinc-600 leading-relaxed mb-6">
          We collect information that you provide directly to us, including:
        </p>
        <div className="space-y-3 text-zinc-600 leading-relaxed mb-8">
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Name and email address</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Professional verification details</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Payment information (processed securely through Stripe)</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Booking preferences and history</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Communications with us</span>
          </p>
        </div>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">2.2 Automatically Collected Information</h3>
        <div className="space-y-3 text-zinc-600 leading-relaxed">
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Device and browser information</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>IP address and location data</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Usage data and analytics</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Cookies and similar technologies</span>
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 3. How We Use Your Information */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">3. How We Use Your Information</h2>
        <p className="text-zinc-600 leading-relaxed mb-6">
          We use the information we collect to:
        </p>
        <div className="space-y-3 text-zinc-600 leading-relaxed">
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Provide, maintain, and improve our services</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Process your bookings and transactions</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Send you booking confirmations and alerts</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Verify your professional status</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Communicate with you about our services</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Detect and prevent fraud or abuse</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Comply with legal obligations</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Analyze usage patterns to improve user experience</span>
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 4. Information Sharing */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">4. Information Sharing</h2>
        
        <h3 className="text-2xl font-light text-zinc-900 mb-6">4.1 With Venues</h3>
        <p className="text-zinc-600 leading-relaxed mb-8">
          We share your name and booking details with venues when you make a reservation. Venues see limited information necessary to fulfill your booking (name, party size, date/time, and any special notes).
        </p>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">4.2 With Service Providers</h3>
        <p className="text-zinc-600 leading-relaxed mb-6">
          We share information with third-party service providers who perform services on our behalf:
        </p>
        <div className="space-y-3 text-zinc-600 leading-relaxed mb-8">
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Payment processing (Stripe)</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Email delivery services</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Analytics providers</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Hosting and infrastructure providers</span>
          </p>
        </div>

        <h3 className="text-2xl font-light text-zinc-900 mb-6">4.3 Legal Requirements</h3>
        <p className="text-zinc-600 leading-relaxed">
          We may disclose your information if required by law or in response to valid legal requests.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 5. Data Security */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">5. Data Security</h2>
        <p className="text-zinc-600 leading-relaxed">
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 6. Your Rights */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">6. Your Rights</h2>
        <p className="text-zinc-600 leading-relaxed mb-6">
          Under UK GDPR, you have the right to:
        </p>
        <div className="space-y-3 text-zinc-600 leading-relaxed mb-8">
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Access the personal information we hold about you</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Correct inaccurate or incomplete information</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Request deletion of your personal information</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Object to or restrict certain processing</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Withdraw consent at any time</span>
          </p>
          <p className="flex items-start">
            <span className="mr-3 text-zinc-400">•</span>
            <span>Data portability</span>
          </p>
        </div>
        <p className="text-zinc-600 leading-relaxed">
          To exercise these rights, contact us at support@clientdining.com
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 7. Data Retention */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">7. Data Retention</h2>
        <p className="text-zinc-600 leading-relaxed">
          We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Booking history may be retained for accounting and legal purposes even after account closure.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 8. Cookies */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">8. Cookies</h2>
        <p className="text-zinc-600 leading-relaxed">
          We use cookies and similar tracking technologies to improve your experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 9. Children's Privacy */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">9. Children's Privacy</h2>
        <p className="text-zinc-600 leading-relaxed">
          Our services are not intended for individuals under 18 years of age. We do not knowingly collect information from children.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 10. International Data Transfers */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">10. International Data Transfers</h2>
        <p className="text-zinc-600 leading-relaxed">
          Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers in accordance with UK GDPR requirements.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 11. Changes to This Policy */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">11. Changes to This Policy</h2>
        <p className="text-zinc-600 leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      {/* 12. Contact Us */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-zinc-900 mb-8">12. Contact Us</h2>
        <p className="text-zinc-600 leading-relaxed mb-4">
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p className="text-zinc-600 leading-relaxed">
          CLIENTDINING LIMITED<br />
          Email: privacy@clientdining.com<br />
          
          Company Registration No: 17018817
        </p>
      </section>

      {/* Bottom Spacing */}
      <div className="h-24"></div>
    </div>
  )
}
