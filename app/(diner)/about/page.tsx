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
            ClientDining is a private booking network for professionals who host business dining in London.
          </p>
          <p>
            Members book within a defined circle of established restaurants and private members&apos; houses. Trusted venues. Clear standards. Built for professional hosting.
          </p>
          <p>
            Business dining remains a normal part of working life in the City. The way it is arranged has never been particularly structured. Email chains. Personal contacts. Consumer reservation platforms designed for something else.
          </p>
          <p>
            ClientDining formalises what already happens. A defined circle. Not a directory. Membership is verified and intended for professionals who host as part of their role. The venue group expands deliberately.
          </p>
          <p>
            When the table matters.
          </p>
        </div>


        <div className="mt-16">
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
