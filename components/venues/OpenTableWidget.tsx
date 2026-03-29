'use client'

interface OpenTableWidgetProps {
  rid: string
  venueName: string
}

export default function OpenTableWidget({ rid, venueName }: OpenTableWidgetProps) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-4 font-light">Book a table</p>
      <iframe
        src={`https://www.opentable.co.uk/widget/reservation/loader?rid=${rid}&type=standard&theme=standard&lang=en-GB&overlay=false&iframe=true`}
        width="100%"
        height="220"
        style={{ border: 'none', display: 'block' }}
        title={`Book at ${venueName}`}
      />
    </div>
  )
}
