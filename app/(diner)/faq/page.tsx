'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  q: string
  a: string
}

interface FAQCategory {
  title: string
  questions: FAQItem[]
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const faqData: FAQCategory[] = [
    {
      title: 'Getting Started',
      questions: [
        {
          q: 'How do I sign up?',
          a: 'Select “Sign Up”, enter your details, and submit your work email for verification. Once verified, you can book immediately.'
        },
        {
          q: 'Do I need to verify my professional status?',
          a: 'Yes. ClientDining is a closed network for City professionals. Verification helps protect discretion and maintains the quality of the network.'
        },
        {
          q: 'How long does professional verification take?',
          a: 'Verification is typically completed within 1–2 business days. You can browse before verification; booking requires approval.'
        },
        {
          q: 'What qualifies as a “City professional”?',
          a: 'We verify professionals in finance, law, consulting, technology, and related sectors, typically based in London’s business districts. If you’re unsure, email support@clientdining.com.'
        },
        {
          q: 'What information do I need to provide for verification?',
          a: 'Company name, role, and a work email address. In some cases we may request a LinkedIn profile or other documentation. Verification information is treated as confidential and used only for access control.'
        },
        {
          q: 'Is there a free trial?',
          a: 'All members start on the Free tier. You can upgrade to Premium (£49/month) at any time.'
        }
      ]
    },
    {
      title: 'Bookings',
      questions: [
        {
          q: 'How far in advance can I book?',
          a: 'Free members can hold up to 3 future bookings. Premium members can hold up to 10, and can access premium slots in advance.'
        },
        {
          q: 'What is the 24-hour rule?',
          a: 'Any slot within the next 24 hours is available to all members, regardless of tier.'
        },
        {
          q: 'How many bookings can I have at once?',
          a: 'Free: up to 3 future bookings. Premium: up to 10 future bookings. Bookings within 24 hours do not count towards these limits.'
        },
        {
          q: 'Can I cancel a booking?',
          a: 'Yes — cancellations are managed in your account. Late cancellations (within 24 hours) may reduce access to that venue’s availability in the future.'
        },
        {
          q: 'What happens if I don’t show up?',
          a: 'No-shows materially impact venues and other members. Repeated no-shows may result in booking restrictions or account suspension.'
        },
        {
          q: "Can I modify my booking after it’s confirmed?",
          a: 'If you need to change the time or party size, cancel and rebook if availability allows. For special requests, contact the venue directly.'
        }
      ]
    },
    {
      title: 'Membership Tiers',
      questions: [
        {
          q: "What’s the difference between Free and Premium?",
          a: 'Free members can book standard restaurant tables and any slot within 24 hours, holding up to 3 future bookings. Premium members (£49/month) can access premium slots in advance and hold up to 10 future bookings.'
        },
        {
          q: 'What are premium slots?',
          a: 'Premium slots are higher-demand reservations at popular venues, typically at peak dining times. Premium members receive priority access when booking more than 24 hours in advance.'
        },
        {
          q: 'Can I try Premium before committing?',
          a: 'We don’t offer a Premium trial. You can upgrade or downgrade at any time. Billing starts immediately on upgrade.'
        },
        {
          q: 'How do I upgrade to Premium?',
          a: 'From your Account page, select “Upgrade to Premium”. Your benefits apply immediately.'
        },
        {
          q: 'Can I downgrade from Premium to Free?',
          a: 'Yes. Premium benefits remain until the end of your billing period, after which the account reverts to Free.'
        }
      ]
    },
    {
      title: 'Alerts',
      questions: [
        {
          q: 'How do alerts work?',
          a: 'Set an alert on a fully booked slot. If it becomes available, we notify you by email. For slots more than 24 hours away, you have a short window to claim the booking before it is offered to the next member.'
        },
        {
          q: 'How many alerts can I set?',
          a: 'There is no hard limit, but we recommend setting alerts only for slots you are prepared to book.'
        },
        {
          q: 'What happens if I don’t respond to an alert?',
          a: 'For slots more than 24 hours away, the booking is offered to the next member after your claim window expires. For slots within 24 hours, notifications may be sent more broadly.'
        },
        {
          q: 'Can I cancel an alert?',
          a: 'Yes. Manage alerts from “My Alerts” at any time.'
        }
      ]
    },
    {
      title: 'Venues',
      questions: [
        {
          q: 'What types of venues are on ClientDining?',
          a: 'A curated selection of leading restaurants and private members’ clubs in London.'
        },
        {
          q: 'Can I book any venue as a Free member?',
          a: 'Free members can book standard restaurant tables and access any availability within 24 hours across all venues. Premium membership is required to access premium slots in advance.'
        },
        {
          q: 'How often are new venues added?',
          a: 'We add venues deliberately to maintain consistency and quality. Check back regularly for additions.'
        },
        {
          q: 'Do venues know I booked through ClientDining?',
          a: 'Yes. Venues see that bookings are placed via ClientDining, which supports reliable table management.'
        },
        {
          q: 'How do I suggest a venue to add to ClientDining?',
          a: 'Email support@clientdining.com with the venue name and why it should be included. We review suggestions as we expand.'
        },
        {
          q: 'I own or manage a restaurant/club. How can I partner with ClientDining?',
          a: 'Email support@clientdining.com with your venue details and the type of availability you would like to make available. We will follow up with next steps.'
        },
        {
          q: 'Why aren’t all London restaurants on ClientDining?',
          a: 'ClientDining is intentionally curated. We partner with venues that meet a consistent standard and can support a reliable booking experience.'
        }
      ]
    },
    {
      title: 'Account & Billing',
      questions: [
        {
          q: 'How do I update my payment method?',
          a: 'From your Account page, go to Billing and select “Update Payment Method”. Payments are processed securely via Stripe.'
        },
        {
          q: 'When am I charged for Premium membership?',
          a: 'You are charged immediately on upgrade, then monthly on the same date. You can cancel at any time; benefits remain until the end of the billing period.'
        },
        {
          q: 'Do you offer refunds?',
          a: 'We do not offer refunds for membership fees. You can cancel at any time to prevent future charges.'
        },
        {
          q: 'How do I delete my account?',
          a: 'Request deletion by emailing support@clientdining.com. Any active bookings will be cancelled.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes. Stripe handles payment processing and we do not store full card details on our servers.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Clear answers on membership, bookings, and how ClientDining works.
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {category.title}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, itemIndex) => {
                  const itemId = `${categoryIndex}-${itemIndex}`
                  const isOpen = openItems.includes(itemId)

                  return (
                    <div
                      key={itemId}
                      className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full flex items-start justify-between text-left group"
                      >
                        <span className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 pr-4">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                            isOpen ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="mt-3 text-gray-600 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-gray-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-gray-300 mb-6">
            If you need anything else, email our team.
          </p>
          <a
            href="mailto:support@clientdining.com"
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
