'use client'

import { useEffect } from 'react'

interface OpenTableWidgetProps {
  rid: string
  slug: string
  venueName: string
}

export default function OpenTableWidget({ rid, slug, venueName }: OpenTableWidgetProps) {
  const widgetUrl = `https://www.opentable.co.uk/widget/reservation/canvas?rid=${rid}&type=standard&theme=standard&color=1&dark=false&iframe=true&domain=couk&lang=en-GB&newtab=false&ot_source=Restaurant%20website`

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Log everything from OpenTable origins
      if (
        typeof event.origin === 'string' &&
        (event.origin.includes('opentable') || event.origin.includes('ot-cdn'))
      ) {
        console.log('[OpenTable postMessage] origin:', event.origin)
        console.log('[OpenTable postMessage] data:', event.data)
      }

      // Also log anything unknown during debugging — remove once confirmed
      if (
        typeof event.origin === 'string' &&
        !event.origin.includes('clientdining') &&
        !event.origin.includes('localhost') &&
        !event.origin.includes('vercel')
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
