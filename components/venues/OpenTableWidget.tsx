'use client'

interface OpenTableWidgetProps {
  rid: string
  slug: string
  venueName: string
}

export default function OpenTableWidget({ rid, slug, venueName }: OpenTableWidgetProps) {
  const widgetUrl = `https://www.opentable.co.uk/widget/reservation/canvas?rid=${rid}&type=standard&theme=standard&color=1&dark=false&iframe=true&domain=couk&lang=en-GB&newtab=false&ot_source=Restaurant%20website`

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
