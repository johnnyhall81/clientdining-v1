'use client'

interface OpenTableWidgetProps {
  rid: string
  slug: string
  venueName: string
}

export default function OpenTableWidget({ rid, slug, venueName }: OpenTableWidgetProps) {
  // Try iframe first — if OpenTable allows embedding for this venue it renders inline
  // The header "Make a booking" is clipped by negative margin + overflow hidden
  return (
    <div>
      <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-4 font-light">Book a table</p>
      <div style={{ overflow: 'hidden', height: '280px', borderRadius: '6px' }}>
        <iframe
          src={`https://www.opentable.co.uk/widget/reservation/loader?rid=${rid}&type=standard&theme=standard&lang=en-GB&overlay=false&iframe=true`}
          width="100%"
          height="340"
          style={{ border: 'none', display: 'block', marginTop: '-56px' }}
          title={`Book at ${venueName}`}
        />
      </div>
    </div>
  )
}
