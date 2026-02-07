'use client'

interface VenueAgreementProps {
  showCheckbox?: boolean
  isChecked?: boolean
  onCheckChange?: (checked: boolean) => void
}

export default function VenueAgreement({ 
  showCheckbox = false, 
  isChecked = false, 
  onCheckChange 
}: VenueAgreementProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold mb-2">Venue Participation Agreement</h2>
        <p className="text-gray-300 text-sm">Light Version - 2026</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-lg p-6 max-h-[600px] overflow-y-auto">
        <div className="prose prose-sm max-w-none space-y-6">
          <div className="text-sm text-gray-600 mb-6">
            <p className="font-medium text-gray-900">This Agreement is entered into between:</p>
            <p className="mt-2"><strong>CLIENTDINING LIMITED</strong></p>
            <p className="text-xs">Company Registration No: 17018817</p>
            <p className="text-xs">Registered Office: 2 The Topiary, Ashtead, KT21 2TE</p>
            <p className="text-xs mb-4">Registered in England and Wales</p>
            <p>("ClientDining", "we", "us")</p>
            <p className="mt-2">and</p>
            <p className="mt-2"><strong>The Venue</strong> ("Venue", "you")</p>
            <p className="mt-2">by electronic acceptance or written confirmation.</p>
          </div>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">1. What ClientDining Does</h3>
            <p className="text-gray-700 mb-2">
              ClientDining operates a private dining availability platform connecting selected restaurants and private members' clubs with City professionals hosting client dinners.
            </p>
            <p className="text-gray-700 mb-2">We facilitate:</p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>presentation of available tables,</li>
              <li>reservation requests and confirmations,</li>
              <li>communication related to bookings.</li>
            </ul>
            <p className="text-gray-700 mt-2">
              We do not operate as a concierge or agent, and we do not control your service, pricing, menus, or policies.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">2. Your Control as a Venue</h3>
            <p className="text-gray-700 mb-2">You retain full control over:</p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>which tables are made available,</li>
              <li>when availability is published or withdrawn,</li>
              <li>acceptance of bookings,</li>
              <li>pricing, menus, and guest policies.</li>
            </ul>
            <p className="text-gray-700 mt-2">
              <strong>There is no exclusivity and no minimum volume commitment.</strong>
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">3. The Booking Relationship</h3>
            <p className="text-gray-700 mb-2">
              Each reservation made via ClientDining is a direct agreement between you and the diner.
            </p>
            <p className="text-gray-700 mb-2">
              CLIENTDINING LIMITED is not a party to the dining contract and is not responsible for:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>service delivery,</li>
              <li>guest conduct,</li>
              <li>cancellations or no-shows.</li>
            </ul>
          </section>

          <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">4. Commission</h3>
            <p className="text-gray-700 mb-3">
              In consideration of bookings introduced via ClientDining, the Venue agrees to pay:
            </p>
            <div className="bg-white border border-amber-300 rounded-lg p-4 mb-3">
              <p className="text-2xl font-bold text-amber-600 mb-2">20% Commission</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Calculated on the final food & beverage bill</li>
                <li>✓ Exclusive of VAT</li>
                <li>✓ Exclusive of service charge</li>
                <li>✓ Payable only where the diner attends and is billed</li>
              </ul>
            </div>
            <p className="text-gray-700 text-sm">
              CLIENTDINING LIMITED will invoice monthly. Payment is due within 30 days of invoice date.
            </p>
            <p className="text-gray-700 text-sm mt-2">
              CLIENTDINING LIMITED does not collect or hold diner payments or deposits unless separately agreed in writing.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">5. Cancellations & No-Shows</h3>
            <p className="text-gray-700 mb-2">
              Your existing cancellation and no-show policies apply.
            </p>
            <p className="text-gray-700 mb-2">
              If a booking does not proceed and no bill is raised: <strong>no commission is payable.</strong>
            </p>
            <p className="text-gray-700">
              CLIENTDINING LIMITED does not guarantee replacement bookings.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">6. Data & Confidentiality</h3>
            <p className="text-gray-700 mb-2">
              Both parties will comply with applicable UK GDPR and data protection laws.
            </p>
            <p className="text-gray-700 mb-2">
              Diner information provided via ClientDining must be used solely for booking fulfilment and treated as confidential.
            </p>
            <p className="text-gray-700">
              Neither party will make public statements about the other or this agreement without consent, unless legally required.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">7. Liability</h3>
            <p className="text-gray-700 mb-2">CLIENTDINING LIMITED is not liable for:</p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>acts or omissions of diners,</li>
              <li>quality of food, service, or experience,</li>
              <li>operational issues, delays, or cancellations.</li>
            </ul>
            <p className="text-gray-700 mt-2 text-sm">
              Nothing in this agreement limits liability that cannot be excluded under English law.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">8. Term & Termination</h3>
            <p className="text-gray-700 mb-2">
              This agreement begins on acceptance and continues on a rolling basis.
            </p>
            <p className="text-gray-700 mb-2">
              Either party may terminate with <strong>30 days' written notice.</strong>
            </p>
            <p className="text-gray-700">
              CLIENTDINING LIMITED may suspend or terminate immediately if continued participation risks reputational or operational harm.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">9. Legal</h3>
            <p className="text-gray-700 mb-2">
              This agreement is governed by the laws of <strong>England and Wales.</strong>
            </p>
            <p className="text-gray-700 mb-2">
              Acceptance via click-to-accept onboarding is legally binding.
            </p>
            <p className="text-gray-700 text-sm mt-3">
              This agreement is between the Venue and CLIENTDINING LIMITED (Company Registration No: 17018817), a company registered in England and Wales with its registered office at 2 The Topiary, Ashtead, KT21 2TE.
            </p>
          </section>
        </div>
      </div>

      {showCheckbox && (
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onCheckChange?.(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded mt-1 flex-shrink-0"
            />
            <span className="text-sm text-gray-900">
              <strong>I have read and agree to the Venue Participation Agreement</strong> on behalf of the venue. 
              I confirm that I have the authority to enter into this agreement with CLIENTDINING LIMITED and that the venue will comply with all terms, 
              including the payment of 20% commission on food & beverage bills for bookings introduced via ClientDining.
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
