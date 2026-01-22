'use client'

import { useState } from 'react'

const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is ClientDining?',
        a: 'ClientDining is a private members platform that provides exclusive access to premium dining reservations at London\'s finest restaurants and private members\' clubs.'
      },
      {
        q: 'How do I sign up?',
        a: 'Click "Sign Up" in the navigation, create an account with your email, and complete the professional verification process. Once verified, you can start browsing and booking immediately.'
      },
      {
        q: 'What is professional verification?',
        a: 'We verify that all members work in professional City roles to maintain the quality and exclusivity of our community. Verification is completed by our team after you sign up.'
      }
    ]
  },
  {
    category: 'Bookings',
    questions: [
      {
        q: 'How do I make a booking?',
        a: 'Browse venues, click on a restaurant or club, view available time slots, and click "Book" on your preferred slot. You\'ll receive instant confirmation.'
      },
      {
        q: 'Can I cancel a booking?',
        a: 'Yes, you can cancel any active booking from your "My Bookings" page. We recommend canceling as early as possible to allow others to book the slot.'
      },
      {
        q: 'What\'s the 24-hour rule?',
        a: 'Any slot starting within 24 hours can be booked by any member (Free or Premium), regardless of tier restrictions or booking limits. This helps fill last-minute availability.'
      },
      {
        q: 'How many bookings can I have?',
        a: 'Free members can hold up to 3 future bookings (more than 24 hours away). Premium members can hold up to 10 future bookings. Last-minute bookings (within 24 hours) don\'t count toward these limits.'
      },
      {
        q: 'What happens if I have overlapping bookings?',
        a: 'The system prevents you from booking two tables within 2 hours of each other to avoid conflicts.'
      }
    ]
  },
  {
    category: 'Membership Tiers',
    questions: [
      {
        q: 'What\'s the difference between Free and Premium?',
        a: 'Free members can book standard restaurant tables and any slot within 24 hours, with up to 3 future bookings. Premium members (£49/month) can book premium slots more than 24 hours in advance and hold up to 10 future bookings.'
      },
      {
        q: 'What are premium slots?',
        a: 'Premium slots are high-demand time slots at popular venues, typically prime dining times like Friday/Saturday evenings. These require a Premium membership to book in advance.'
      },
      {
        q: 'Can I upgrade to Premium anytime?',
        a: 'Yes, you can upgrade from your Account page at any time. Your Premium benefits activate immediately upon payment.'
      },
      {
        q: 'Can I downgrade from Premium?',
        a: 'Yes, you can cancel your Premium subscription at any time. You\'ll retain Premium benefits until the end of your billing period.'
      }
    ]
  },
  {
    category: 'Alerts',
    questions: [
      {
        q: 'How do alerts work?',
        a: 'If a slot you want is unavailable, click "Alert Me" to get notified when it becomes available. We\'ll email you immediately when the slot opens up.'
      },
      {
        q: 'What happens when I receive an alert?',
        a: 'For slots more than 24 hours away, you\'ll have a 15-minute exclusive window to book. For last-minute slots (within 24 hours), all alert holders are notified at once and it\'s first-come, first-served.'
      },
      {
        q: 'Can I set multiple alerts?',
        a: 'Yes, you can set alerts on as many slots as you like. Manage all your active alerts from the "My Alerts" page.'
      },
      {
        q: 'Do alerts guarantee I get the booking?',
        a: 'No, alerts give you notification and priority, but normal booking rules still apply. You must still be eligible to book the slot (correct tier, not at booking limit, etc.).'
      }
    ]
  },
  {
    category: 'Venues',
    questions: [
      {
        q: 'How do you choose which venues to include?',
        a: 'We carefully curate every venue on the platform, focusing on Michelin-starred restaurants and exclusive private members\' clubs. Quality over quantity is our priority.'
      },
      {
        q: 'Can I request a venue be added?',
        a: 'Yes, please contact us with your suggestions. We review all venue requests and add them if they meet our quality standards.'
      },
      {
        q: 'Why can\'t I see availability at some venues?',
        a: 'Venues control their own availability. If a venue shows no slots, they haven\'t released availability yet, or all slots are booked.'
      }
    ]
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        q: 'How do I update my payment method?',
        a: 'Go to your Account page and click "Manage Subscription" to update your payment details through our secure payment provider.'
      },
      {
        q: 'What happens if my payment fails?',
        a: 'You\'ll receive an email notification and have a grace period to update your payment method. If not resolved, your account will be downgraded to Free tier.'
      },
      {
        q: 'How do I delete my account?',
        a: 'Contact us at support@clientdining.com to request account deletion. Please note you must cancel any active bookings first.'
      }
    ]
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenIndex(openIndex === key ? null : key)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600">
          Everything you need to know about ClientDining
        </p>
      </div>

      <div className="space-y-8">
        {FAQ_ITEMS.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
            
            <div className="space-y-3">
              {category.questions.map((item, questionIndex) => {
                const key = `${categoryIndex}-${questionIndex}`
                const isOpen = openIndex === key
                
                return (
                  <div key={questionIndex} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 pr-8">{item.q}</span>
                      <span className="text-gray-400 text-xl flex-shrink-0">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-700">{item.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 text-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
        <p className="text-gray-300 mb-6">
          Can't find the answer you're looking for? Our support team is here to help.
        </p>
        <a 
          href="mailto:support@clientdining.com" 
          className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}