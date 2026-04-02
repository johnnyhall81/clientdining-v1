'use client'

import { useEffect, useRef, useState } from 'react'

interface OpenTableWidgetProps {
  rid: string
  slug: string
  venueName: string
}

function getTomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDates() {
  const dates = []
  for (let i = 1; i <= 60; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function getTimes() {
  const times = []
  for (let h = 12; h <= 22; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 22) times.push(`${String(h).padStart(2, '0')}:30`)
  }
  return times
}

const DATES = getDates()
const TIMES = getTimes()
const PARTY_SIZES = Array.from({ length: 10 }, (_, i) => i + 1)

export default function OpenTableWidget({ rid, slug, venueName }: OpenTableWidgetProps) {
  const [date, setDate] = useState(getTomorrow())
  const [time, setTime] = useState('19:00')
  const [partySize, setPartySize] = useState(2)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [iframeHeight, setIframeHeight] = useState(900)

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (typeof event.origin !== 'string') return

      const isOT = event.origin.includes('opentable') || event.origin.includes('otstatic')

      if (isOT) {
        console.log('[OpenTable postMessage] origin:', event.origin)
        console.log('[OpenTable postMessage] data:', JSON.stringify(event.data, null, 2))

        // Dynamic height adjustment
        const data = event.data
        if (data && typeof data === 'object') {
          const h = data.height || data.iframeHeight || data.frameHeight || data.size?.height
          if (h && typeof h === 'number' && h > 100) {
            setIframeHeight(h + 40) // 40px buffer
          }
        }
      }

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

  function handleSearch() {
    const dateTime = encodeURIComponent(`${date}T${time}`)
    const url = `https://www.opentable.co.uk/booking/restref/availability?rid=${rid}&restRef=${rid}&lang=en-GB&color=1&partySize=${partySize}&dateTime=${dateTime}&otSource=Restaurant%20website`
    setIframeUrl(url)
    setIframeHeight(900)
  }

  const selectClass = "w-full bg-transparent border-b border-zinc-200 text-zinc-800 text-sm py-2 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-zinc-400"

  return (
    <div>
      <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-7 font-light">Book a table</p>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <label className="block text-[9px] tracking-[0.2em] text-zinc-400 uppercase mb-1">Date</label>
          <select value={date} onChange={e => setDate(e.target.value)} className={selectClass}>
            {DATES.map(d => (
              <option key={d} value={d}>{formatDateLabel(d)}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-0 bottom-2.5 text-zinc-400">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>

        <div className="relative">
          <label className="block text-[9px] tracking-[0.2em] text-zinc-400 uppercase mb-1">Time</label>
          <select value={time} onChange={e => setTime(e.target.value)} className={selectClass}>
            {TIMES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-0 bottom-2.5 text-zinc-400">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>

        <div className="relative">
          <label className="block text-[9px] tracking-[0.2em] text-zinc-400 uppercase mb-1">Guests</label>
          <select value={partySize} onChange={e => setPartySize(Number(e.target.value))} className={selectClass}>
            {PARTY_SIZES.map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-0 bottom-2.5 text-zinc-400">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full mt-2 py-2.5 text-[10px] tracking-[0.2em] uppercase text-white bg-zinc-900 hover:bg-zinc-700 transition-colors"
          style={{ borderRadius: '3px' }}
        >
          Find a table
        </button>
      </div>

      {iframeUrl && (
        <div style={{ overflow: 'hidden', borderRadius: '3px', marginTop: '8px' }}>
          <iframe
            key={iframeUrl}
            src={iframeUrl}
            width="100%"
            height={iframeHeight}
            style={{ border: 'none', display: 'block' }}
            title={`Book at ${venueName}`}
          />
        </div>
      )}
    </div>
  )
}
