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
          a: 'Click "Sign Up" in the navigation, provide your email and professional details for verification. Once verified (typically within 1-2 business days), you can start browsing and booking.'
        },
        {
          q: 'Do I need to verify my professional status?',
          a: 'Yes, ClientDining is exclusively for City professionals. We verify that all members work in professional City roles to maintain the quality and exclusivity of our community.'
        },
        {
          q: 'How long does professional verification take?',
          a: 'Professional verification typically takes 1-2 business days. We\'ll review your employment details and send you an email once your account is verified. You can then start browsing venues, but bookings require verification to be complete.'
        },
        {
          q: 'What qualifies as a "City professional"?',
          a: 'We verify professionals working in finance, legal, consulting, technology, and related industries primarily in London\'s business districts. This includes roles in investment banking, law firms, management consulting, fintech, private equity, and corporate services. If you\'re unsure whether your role qualifies, contact support@clientdining.com and we\'ll be happy to advise.'
        },
        {
          q: 'What information do I need to provide for verification?',
          a: 'During signup, you\'ll be asked to provide your company name, role, and work email address. We may also request LinkedIn verification or other professional documentation. All information is kept confidential and used solely for verification purposes.'
        },
        {
          q: 'Is there a free trial?',
          a: 'All new members start with a Free account that provides access to standard restaurant tables and last-minute bookings. You can upgrade to Premium (£49/month) at any time for access to premium slots and private clubs.'
        }
      ]
    },
    {
      title: 'Bookings',
      questions: [
        {
          q: 'How far in advance can I book?',
          a: 'Free members can book standard slots up to several weeks in advance, with a maximum of 3 future bookings at a time. Premium members can book premium slots and hold up to 10 future bookings.'
        },
        {
          q: 'What is the 24-hour rule?',
          a: 'Any slot starting within 24 hours can be booked by any member (Free or Premium), regardless of tier or booking limits. This helps fill last-minute availability and gives everyone equal access to immediate opportunities.'
        },
        {
          q: 'How many bookings can I have at once?',
          a: 'Free members can hold up to 3 future bookings (more than 24 hours away). Premium members can hold up to 10 future bookings. Last-minute bookings (within 24 hours) don\'t count toward these limits.'
        },
        {
          q: 'Can I cancel a booking?',
          a: 'Yes, you can cancel bookings through your account. However, please note that late cancellations (within 24 hours of your reservation) may affect your ability to book at that venue in the future. We encourage responsible booking behavior.'
        },
        {
          q: 'What happens if I don\'t show up?',
          a: 'No-shows are taken seriously as they affect both the venue and other members who could have used that slot. Multiple no-shows may result in booking restrictions or account suspension.'
        },
        {
          q: 'Can I modify my booking after it\'s confirmed?',
          a: 'You can cancel and rebook if availability allows, but you cannot directly modify party size or time. Contact the venue directly for special requests or changes.'
        }
      ]
    },
    {
      title: 'Membership Tiers',
      questions: [
        {
          q: 'What\'s the difference between Free and Premium?',
          a: 'Free members can book standard restaurant tables and any slot within 24 hours, with up to 3 future bookings. Premium members (£49/month) can book premium slots more than 24 hours in advance and hold up to 10 future bookings.'
        },
        {
          q: 'What are premium slots?',
          a: 'Premium slots are high-demand time slots at popular venues, typically prime dining times (7-9pm on weekends). Premium members get priority access to these slots when booking more than 24 hours in advance.'
        },
        {
          q: 'Can I try Premium before committing?',
          a: 'We don\'t offer a trial period for Premium, but you can upgrade and downgrade at any time. Your first month is charged immediately, and you can cancel before your next billing cycle to avoid further charges.'
        },
        {
          q: 'How do I upgrade to Premium?',
          a: 'Go to your Account page and click "Upgrade to Premium". You\'ll be charged £49/month and gain immediate access to premium features.'
        },
        {
          q: 'Can I downgrade from Premium to Free?',
          a: 'Yes, you can downgrade at any time. Your Premium benefits will continue until the end of your current billing period, after which your account will revert to Free tier.'
        }
      ]
    },
    {
      title: 'Alerts',
      questions: [
        {
          q: 'How do alerts work?',
          a: 'If a slot you want is fully booked, you can set an alert. If it becomes available (due to cancellation), we\'ll notify you by email. For slots more than 24 hours away, you\'ll have a 15-minute window to book before we notify the next person in the queue.'
        },
        {
          q: 'How many alerts can I set?',
          a: 'There\'s no limit to the number of alerts you can set, but be realistic about what you can actually book if notified.'
        },
        {
          q: 'What happens if I don\'t respond to an alert?',
          a: 'For slots more than 24 hours away, you have 15 minutes to claim the booking before it\'s offered to the next person in the queue. For last-minute slots (within 24 hours), all interested members are notified simultaneously.'
        },
        {
          q: 'Can I cancel an alert?',
          a: 'Yes, you can view and cancel your alerts from the "My Alerts" page at any time.'
        }
      ]
    },
    {
      title: 'Venues',
      questions: [
        {
          q: 'What types of venues are on ClientDining?',
          a: 'We feature high-end restaurants and exclusive private members\' clubs in London, carefully curated to match the preferences of City professionals.'
        },
        {
          q: 'Can I book any venue as a Free member?',
          a: 'Free members can book at any restaurant on the platform and access last-minute slots at all venues. Premium membership is required to book premium slots more than 24 hours in advance.'
        },
        {
          q: 'How often are new venues added?',
          a: 'We regularly expand our network of partner venues. Follow us or check back regularly to see new additions.'
        },
        {
          q: 'Do venues know I booked through ClientDining?',
          a: 'Yes, venues are aware that bookings come through our platform. This is part of our partnership agreement and ensures proper table management.'
        },
        {
          q: 'How do I suggest a venue to add to ClientDining?',
          a: 'We love hearing from our members about venues they\'d like to see on the platform! Email us at support@clientdining.com with the venue name, location, and why you think it would be a great addition. While we can\'t guarantee every suggestion will be added, we carefully review all recommendations as we expand our network.'
        },
        {
          q: 'I own or manage a restaurant/club. How can I partner with ClientDining?',
          a: 'We\'re always interested in partnering with high-quality venues that align with our members\' preferences. Please reach out to support@clientdining.com with your venue details, typical clientele, and available time slots. Our team will review your inquiry and discuss partnership opportunities, including our commission structure and booking management tools.'
        },
        {
          q: 'Why aren\'t all London restaurants on ClientDining?',
          a: 'We carefully curate our venue selection to ensure quality and consistency for our members. We partner with establishments that offer exceptional dining experiences and can accommodate our booking requirements. This selective approach helps maintain the premium nature of the platform and ensures reliability for both members and venue partners.'
        }
      ]
    },
    {
      title: 'Account & Billing',
      questions: [
        {
          q: 'How do I update my payment method?',
          a: 'Go to your Account page, scroll to the Billing section, and click "Update Payment Method". Your card details are securely processed through Stripe.'
        },
        {
          q: 'When am I charged for Premium membership?',
          a: 'You\'re charged £49 immediately upon upgrading, then every month on the same date. You can cancel at any time, and your benefits continue until the end of your current billing period.'
        },
        {
          q: 'Do you offer refunds?',
          a: 'Due to the nature of our service, we don\'t offer refunds for Premium membership fees. However, you can cancel at any time to prevent future charges.'
        },
        {
          q: 'How do I delete my account?',
          a: 'You can request account deletion by contacting support@clientdining.com. Note that any active bookings will be cancelled, and Premium membership fees are non-refundable.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes, all payment processing is handled by Stripe, a PCI-compliant payment processor. We never store your full card details on our servers.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about ClientDining, bookings, and membership.
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
            Can't find what you're looking for? Our support team is here to help.
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