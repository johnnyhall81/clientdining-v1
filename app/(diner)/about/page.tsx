import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — ClientDining',
  description: 'ClientDining is a private booking platform for professionals who host business dining in London. Membership is verified for City professionals.',
}

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-12 tracking-tight">
          About
        </h1>

        <div className="max-w-2xl space-y-8 text-zinc-500 font-light leading-relaxed">
          <p>
            ClientDining is a private booking platform for professionals who host business dining in London.
          </p>
          <p>
            It provides access to a deliberately small group of established restaurants and private members&apos; clubs suited to professional hosting.
          </p>
          <p>
            Business dining remains a normal part of working life in the City. The way it is arranged has never been designed for it.
          </p>
          <p>
            Emails. Personal contacts. General reservation platforms built for something else.
          </p>
          <p>
            ClientDining formalises what already happens.
          </p>
          <p>
            A defined circle. Not a directory.
          </p>
          <p>
            Membership is verified and intended for professionals who host as part of their role. The venue list is controlled and expanded deliberately.
          </p>
        </div>


        <div className="mt-16">
          <p className="text-sm font-light text-zinc-400 mb-5">Membership is by application.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-900 text-sm font-light rounded-lg border border-zinc-300 hover:bg-zinc-50 transition-colors duration-300"
          >
            Apply for membership
          </Link>
        </div>





      </section>
    </div>
  )
}
