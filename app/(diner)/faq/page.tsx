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
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const faqData: FAQCategory[] = [
    {
      title: 'Getting Started',
      questions: [
        {
          q: 'How do I sign up?',
          a: 'Sign up using LinkedIn. This allows us to verify your professional background quickly and discreetly. Once verified, you can book immediately.'
        },
        {
          q: 'Why is LinkedIn required?',
          a: 'ClientDining is a closed network for City professionals. LinkedIn provides a consistent and reliable way to verify professional roles while keeping the process simple and low-friction.'
        },
        {
          q: 'Do I need to verify my professional status?',
          a: 'Yes. All members are verified to maintain discretion, reliability, and the overall quality of the network.'
        },
        {
          q: 'How long does verification take?',
          a: 'Verification is typically completed within one business day. You can browse venues before verification, but booking requires approval.'
        },
        {
          q: 'What qualifies as a "City professional"?',
          a: 'We verify professionals working in finance, law, consulting, technology, and related sectors, primarily in London's business districts. If you are unsure, contact support@clientdining.com.'
        },
        {
          q: 'Is there a free trial?',
          a: 'All members begin on the Standard tier. You can upgrade to Premium (£49/month) at any time.'
        }
      ]
    },
    {
      title: 'Bookings',
      questions: [
        {
          q: 'How far in advance can I book?',
          a: 'Standard members can hold up to 3 future bookings. Premium members can hold up to 10 and access premium slots further in advance.'
        },
        {
          q: 'What is the 24-hour rule?',
          a: 'Any slot within the next 24 hours is available to all members, regardless of tier.'
        },
        {
          q: 'How many bookings can I have at once?',
          a: 'Standard members may hold up to 3 future bookings. Premium members may hold up to 10. Bookings within 24 hours do not count toward these limits.'
        },
        {
          q: 'Can I book for larger groups or corporate events?',
          a: 'Yes. Tables accommodate various party sizes as indicated in each slot. For larger corporate gatherings or private dining rooms, contact support@clientdining.com and we can arrange suitable options with our venue partners.'
        },
        {
          q: 'Can I cancel a booking?',
          a: 'Yes. Cancellations are managed through your account. Late cancellations may affect future access to that venue's availability.'
        },
        {
          q: 'What happens if I don't show up?',
          a: 'No-shows impact venues and other members. Repeated no-shows may result in booking restrictions or account suspension.'
        },
        {
          q: 'Can I modify a booking?',
          a: 'If you need to change a booking, cancel and rebook if availability allows. Any booking-related requests should be handled via support@clientdining.com.'
        },
        {
          q: 'Who pays for the booking?',
          a: 'The member who makes the booking is responsible. ClientDining is designed for professionals hosting clients, organizing team dinners, or arranging corporate events — one person books and settles the bill.'
        }
      ]
    },
    {
      title: 'Membership Tiers',
      questions: [
        {
          q: 'What's the difference between Standard and Premium?',
          a: 'Standard members can book standard tables and any slot within 24 hours, holding up to 3 future bookings. Premium members (£49/month) can access premium slots in advance and hold up to 10 future bookings.'
        },
        {
          q: 'What are premium slots?',
          a: 'Premium slots are higher-demand reservations at popular venues, typically at peak dining times.'
        },
        {
          q: 'Is Premium worth it for frequent business dining?',
          a: 'Premium is designed for professionals who regularly host clients or organize team events. With 10 future bookings and early access to premium slots, it provides the flexibility needed for consistent business entertainment.'
        },
        {
          q: 'Can I try Premium before committing?',
          a: 'There is no trial period. You can upgrade or downgrade at any time.'
        },
        {
          q: 'How do I upgrade?',
          a: 'From your Account page, select "Upgrade to Premium". Benefits apply immediately.'
        },
        {
          q: 'Can I downgrade?',
          a: 'Yes. Premium benefits continue until the end of your billing period, after which the account reverts to Standard.'
        }
      ]
    },
    {
      title: 'Alerts',
      questions: [
        {
          q: 'How do alerts work?',
          a: 'Set an alert on a fully booked slot. If it becomes available, you will be notified by email. For slots more than 24 hours away, you have a short window to claim the booking.'
        },
        {
          q: 'How many alerts can I set?',
          a: 'There is no hard limit, but alerts should only be set for slots you are prepared to book.'
        },
        {
          q: 'What happens if I miss an alert?',
          a: 'If the claim window expires, the slot is offered to the next member.'
        },
        {
          q: 'Can I cancel an alert?',
          a: 'Yes. Alerts can be managed from your account at any time.'
        }
      ]
    },
    {
      title: 'Venues',
      questions: [
        {
          q: 'What types of venues are on ClientDining?',
          a: 'A curated selection of leading restaurants and private members' clubs in London, suitable for client meetings, team celebrations, and corporate events.'
        },
        {
          q: 'Can I book any venue as a Standard member?',
          a: 'Standard members can book standard restaurant tables and access any availability within 24 hours. Premium membership is required for premium slots booked further in advance.'
        },
        {
          q: 'How often are new venues added?',
          a: 'Venues are added deliberately to maintain consistency and quality.'
        },
        {
          q: 'Do venues know I booked through ClientDining?',
          a: 'Yes. Venues see that bookings are placed via ClientDining.'
        },
        {
          q: 'How do I suggest a venue?',
          a: 'Email support@clientdining.com with the venue name and details. Suggestions are reviewed as the platform expands.'
        }
      ]
    },
    {
      title: 'Account & Billing',
      questions: [
        {
          q: 'How do I update my payment method?',
          a: 'From your Account page, go to Billing and update your payment method. Payments are processed securely via Stripe.'
        },
        {
          q: 'When am I charged?',
          a: 'Premium membership is billed immediately on upgrade, then monthly on the same date.'
        },
        {
          q: 'Do you offer refunds?',
          a: 'We do not offer refunds for membership fees. You may cancel at any time to prevent future charges.'
        },
        {
          q: 'Can my company pay for my membership?',
          a: 'Yes. Many members expense their Premium membership as a business tool for client entertainment. We provide receipts for all payments via email.'
        },
        {
          q: 'How do I delete my account?',
          a: 'Request deletion by emailing support@clientdining.com. Any active bookings will be cancelled.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600">
          Clear answers on membership, bookings, and how ClientDining works.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
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
                      className="w-full flex justify-between text-left"
                    >
                      <span className="text-lg font-semibold text-gray-900 pr-4">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
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

        <div className="bg-gray-900 text-white rounded-lg p-8 text-center">
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
