'use client'

import { useEffect, useMemo } from 'react'

interface OpenTableWidgetProps {
  rid: string
  slug: string
  venueName: string
}

export default function OpenTableWidget({ rid, slug, venueName }: OpenTableWidgetProps) {
  // Default: tomorrow at 19:00, party of 2
  const defaultDateTime = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(19, 0, 0, 0)
    return tomorrow.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:MM"
  }, [])

  const widgetUrl = `https://www.opentable.co.uk/booking/restref/availability?rid=${rid}&restRef=${rid}&lang=en-GB&color=1&partySize=2&dateTime=${encodeURIComponent(defaultDateTime)}&otSource=Restaurant%20website`

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (typeof event.origin !== 'string') return

      if (event.origin.includes('opentable') || event.origin.includes('otstatic')) {
        console.log('[OpenTable postMessage] origin:', event.origin)
        console.log('[OpenTable postMessage] data:', JSON.stringify(event.data, null, 2))
      }

      // Catch-all for any unknown origin during debugging
      if (
        !event.origin.includes('clientdining') &&
        !event.origin.includes('localhost') &&
        !event.origin.includes('vercel') &&
        !event.origin.includes('supabase')
      ) {
        console.log('[postMessage unknown origin]', event.origin, event.data)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div>
      <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-7 font-light">Book a table</p>
      <div style={{ overflow: 'hidden', borderRadius: '3px' }}>
        <iframe
          src={widgetUrl}
          width="224"
          height="301"
          style={{ border: 'none', display: 'block' }}
          title={`Book at ${venueName}`}
        />
      </div>
    </div>
  )
}
