'use client'

import React from 'react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-12 tracking-tight">
          About ClientDining
        </h1>

        <div className="max-w-2xl space-y-8 text-zinc-500 font-light leading-relaxed">
          <p>
            ClientDining is a private booking platform for professionals who host business dining in London.
          </p>
          <p>
            It provides access to a small group of established restaurants and private members' clubs suited to professional hosting.
          </p>
          <p>
            Business dining remains a normal part of working life in the City. Yet arranging these tables often relies on informal emails, personal contacts, or general reservation platforms not designed for this purpose.
          </p>
          <p>
            ClientDining formalises that coordination.
          </p>
          <p>
            The platform is selective by design. Membership is verified and intended for professionals who host as part of their role. Venue participation is controlled and expanded deliberately.
          </p>
          <p>
            ClientDining focuses on weekday business dining in London.
          </p>
        </div>

        <div className="mt-16">
          <Link
            href="/signup"
            className="inline-block bg-zinc-900 text-zinc-50 px-8 py-4 text-sm font-light rounded-lg hover:bg-zinc-800 transition-colors duration-200"
          >
            Enter
          </Link>
        </div>
      </section>
    </div>
  )
}
