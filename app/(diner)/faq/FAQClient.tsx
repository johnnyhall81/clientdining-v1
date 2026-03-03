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

export default function FAQClient() {
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
          a: 'Apply via LinkedIn. This lets us confirm your professional background quickly and discreetly. Once approved, you can book immediately.'
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
          q: 'Who qualifies for membership?',
          a: 'Professionals working in finance, law, consulting, and related sectors, primarily in London\'s business districts. Membership is free. If you are unsure whether you qualify, contact support@clientdining.com.'
        }
      ]
    },
    {
      title: 'Bookings',
      questions: [
        {
          q: 'How do I make a booking?',
          a: 'Search by date, area, or party size. Select a slot and confirm your party size. You will receive an email confirmation and the booking will appear in your account.'
        },
        {
          q: 'Can I book for larger groups or private dining?',
          a: 'Tables accommodate various party sizes as shown on each listing. For larger groups or private dining, use the enquiry link on the venue page.'
        },
        {
          q: 'I am booking on behalf of colleagues or directors. Can I make multiple bookings at the same time?',
          a: 'The platform is designed for single hosts booking one table at a time. If you need to arrange simultaneous bookings for different people, contact support@clientdining.com and we will assist directly.'
        },
        {
          q: 'Can I change a booking?',
          a: 'Yes. Use the Change booking option on your bookings page or in your confirmation email. This cancels your existing booking and returns you to the venue to select a new time.'
        },
        {
          q: 'Can I cancel a booking?',
          a: 'Yes. Cancellations are handled through your account. Late cancellations may affect future access to that venue.'
        },
        {
          q: 'What happens if I don\'t show up?',
          a: 'No-shows affect venues and other members. Repeated no-shows may result in booking restrictions or account suspension.'
        },
        {
          q: 'Who pays for the meal?',
          a: 'The member who makes the booking is responsible for the bill. ClientDining is intended for professionals hosting clients or colleagues.'
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
          a: 'There is no hard limit. Set alerts only for slots you are genuinely prepared to book.'
        },
        {
          q: 'What happens if I miss an alert notification?',
          a: 'If the claim window expires, the slot is released to the next member in the queue.'
        },
        {
          q: 'Can I remove an alert?',
          a: 'Yes. Alerts can be removed from the venue page at any time.'
        }
      ]
    },
    {
      title: 'Venues',
      questions: [
        {
          q: 'What types of venues are listed?',
          a: 'A carefully chosen set of London restaurants and private members\' clubs. Each is selected for the quality of its food, the comfort of its rooms, and its suitability for a conversation you wouldn\'t want overheard.'
        },
        {
          q: 'How are venues selected?',
          a: 'Every venue on ClientDining has been assessed for the things that matter at a client dinner — reliable cooking, attentive but unobtrusive service, and tables spaced far enough apart. We add venues slowly and remove them if standards slip.'
        },
        {
          q: 'Do venues know I booked through ClientDining?',
          a: 'Yes. Venues receive bookings through the platform and understand how it works.'
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
          q: 'Can I invite a colleague?',
          a: 'Yes, if your account has nomination rights enabled. All nominations are reviewed before approval.'
        },
        {
          q: 'How do I delete my account?',
          a: 'Email support@clientdining.com. Any active bookings will be cancelled before deletion.'
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
                      <div className="mt-3 text-sm text-zinc-500 font-light leading-relaxed">
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
