'use client'

interface OpenTableWidgetProps {
  rid: string
  slug: string
  venueName: string
}

export default function OpenTableWidget({ rid, slug, venueName }: OpenTableWidgetProps) {
  const handleOpen = () => {
    const url = `https://www.opentable.co.uk/r/${slug}`
    window.open(
      url,
      'opentable_booking',
      'width=480,height=700,left=200,top=80,resizable=yes,scrollbars=yes'
    )
  }

  return (
    <div>
      <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-4 font-light">Reservations</p>
      <p className="text-sm font-light text-zinc-500 leading-relaxed mb-5">
        {venueName} takes reservations via OpenTable.
      </p>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 text-sm font-light text-zinc-900 hover:opacity-60 transition-opacity"
      >
        Search availability on OpenTable
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </button>
    </div>
  )
}
