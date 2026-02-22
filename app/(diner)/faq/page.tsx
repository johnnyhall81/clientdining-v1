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
          q: 'How do I join?',
          a: 'Apply via LinkedIn. This allows us to confirm your professional background quickly and discreetly. Once approved, you can book immediately.'
        },
        {
          q: 'Why is LinkedIn required?',
          a: 'ClientDining is a private network for verified City professionals. LinkedIn provides a straightforward way to confirm professional roles without additional paperwork.'
        },
        {
          q: 'How long does approval take?',
          a: 'Applications are typically reviewed within one business day.'
        },
        {
          q: 'What qualifies as a City professional?',
          a: 'Professionals working in finance, law, consulting, and related sectors, primarily in London\'s business districts. If you are unsure, contact support@clientdining.com.'
        },
        {
          q: 'Is membership free?',
          a: 'Yes. Membership is free. ClientDining generates revenue through a commission on bookings, paid by venues.'
        }
      ]
    },
    {
      title: 'Bookings',
      questions: [
        {
          q: 'How many bookings can I hold at once?',
          a: 'Members may hold up to 10 future bookings at any one time.'
        },
        {
          q: 'Can I book for larger groups?',
          a: 'Yes. Tables accommodate various party sizes as indicated on each slot. For larger gatherings or private dining rooms, contact support@clientdining.com.'
        },
        {
          q: 'Can I cancel a booking?',
          a: 'Yes. Cancellations are managed through your account. Late cancellations may affect future access to that venue.'
        },
        {
          q: 'What happens if I don\'t show up?',
          a: 'No-shows affect venues and other members. Repeated no-shows may result in booking restrictions or account suspension.'
        },
        {
          q: 'Can I modify a booking?',
          a: 'Cancel and rebook if availability allows. For assistance, contact support@clientdining.com.'
        },
        {
          q: 'Who pays for the meal?',
          a: 'The member who makes the booking is responsible for the bill. ClientDining is designed for professionals hosting clients or colleagues.'
        }
      ]
    },
    {
      title: 'Alerts',
      questions: [
        {
          q: 'How do alerts work?',
          a: 'Set an alert on a fully booked slot. If it becomes available, you will be notified by email and have a short window to claim the booking.'
        },
        {
          q: 'How many alerts can I set?',
          a: 'There is no hard limit. Alerts should only be set for slots you are genuinely prepared to book.'
        },
        {
          q: 'What happens if I miss an alert?',
          a: 'If the claim window expires, the slot is offered to the next member in the queue.'
        },
        {
          q: 'Can I cancel an alert?',
          a: 'Yes. Alerts can be removed from the venue page at any time.'
        }
      ]
    },
    {
      title: 'Venues',
      questions: [
        {
          q: 'What types of venues are on ClientDining?',
          a: 'A small, curated selection of London\'s leading restaurants and private members\' clubs, chosen for their suitability for professional business dining.'
        },
        {
          q: 'How are venues selected?',
          a: 'Venues are chosen for consistency, discretion, and their ability to host business conversations comfortably. The list is expanded carefully over time.'
        },
        {
          q: 'Do venues know I booked through ClientDining?',
          a: 'Yes. Venues receive bookings via ClientDining and are familiar with how the platform works.'
        },
        {
          q: 'How do I suggest a venue?',
          a: 'Email support@clientdining.com with the venue name. Suggestions are reviewed as the platform grows.'
        }
      ]
    },
    {
      title: 'Account',
      questions: [
        {
          q: 'How do I delete my account?',
          a: 'Email support@clientdining.com. Any active bookings will be cancelled before deletion.'
        },
        {
          q: 'Can I invite a colleague?',
          a: 'Yes, if your account has nomination rights enabled. All invitations are reviewed before approval.'
        },
        {
          q: 'Who do I contact if something goes wrong?',
          a: 'Email support@clientdining.com. We aim to respond within one business day.'
        }
      ]
    }
  ]

  return (
    <div className="">
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tight">
          Questions
        </h1>
        <p className="text-xl text-zinc-500 font-light leading-relaxed">
          How ClientDining works.
        </p>
      </section>

      {faqData.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="border-t border-zinc-200"></div>
          </div>

          <section className="max-w-4xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-light text-zinc-900 mb-8">
              {category.title}
            </h2>

            <div className="space-y-4">
              {category.questions.map((item, itemIndex) => {
                const itemId = `${categoryIndex}-${itemIndex}`
                const isOpen = openItems.includes(itemId)

                return (
                  <div
                    key={itemId}
                    className="border-b border-zinc-200 last:border-0 pb-4 last:pb-0"
                  >
                    <button
                      onClick={() => toggleItem(itemId)}
                      className="w-full flex justify-between text-left"
                    >
                      <span className="text-base font-light text-zinc-900 pr-4">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-3 text-sm text-zinc-600 font-light leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      ))}

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-zinc-200"></div>
      </div>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-zinc-500 font-light leading-relaxed mb-6">
          Still have a question?
        </p>
        <a
          href="mailto:support@clientdining.com"
          className="text-zinc-900 font-light underline underline-offset-4 hover:no-underline"
        >
          support@clientdining.com
        </a>
      </section>
    </div>
  )
}
