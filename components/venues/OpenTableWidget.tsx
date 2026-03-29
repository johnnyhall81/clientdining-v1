'use client'

import { useState } from 'react'

interface OpenTableWidgetProps {
  rid: string
  venueName: string
}

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
]

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

function getNext14Days() {
  const days = []
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

export default function OpenTableWidget({ rid, venueName }: OpenTableWidgetProps) {
  const [partySize, setPartySize] = useState(2)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState('19:00')

  const days = getNext14Days()

  const handleFindTable = () => {
    const dateStr = formatDate(selectedDate)
    const dateTime = `${dateStr}T${selectedTime}`
    const url = `https://www.opentable.co.uk/restref/client/?rid=${rid}&covers=${partySize}&datetime=${encodeURIComponent(dateTime)}&lang=en-GB`
    window.open(
      url,
      'opentable_booking',
      'width=480,height=640,left=200,top=100,resizable=yes,scrollbars=yes'
    )
  }

  return (
    <div>
      <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase mb-6 font-light">Book a table</p>

      <div className="space-y-5">

        {/* Party size */}
        <div>
          <p className="text-[9px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-2.5">Guests</p>
          <div className="flex flex-wrap gap-2">
            {PARTY_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setPartySize(size)}
                className="w-9 h-9 rounded-full text-sm font-light transition-all duration-150"
                style={{
                  background: partySize === size ? '#18181B' : 'transparent',
                  color: partySize === size ? '#ffffff' : '#71717a',
                  border: partySize === size ? '1px solid #18181B' : '1px solid #E4E4E7',
                }}
              >
                {size}
              </button>
            ))}
            <button
              onClick={() => setPartySize(13)}
              className="px-3 h-9 rounded-full text-sm font-light transition-all duration-150"
              style={{
                background: partySize === 13 ? '#18181B' : 'transparent',
                color: partySize === 13 ? '#ffffff' : '#71717a',
                border: partySize === 13 ? '1px solid #18181B' : '1px solid #E4E4E7',
              }}
            >
              13+
            </button>
          </div>
        </div>

        {/* Date */}
        <div>
          <p className="text-[9px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-2.5">Date</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {days.map((day, i) => {
              const isSelected = formatDate(day) === formatDate(selectedDate)
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-light transition-all duration-150 text-center"
                  style={{
                    background: isSelected ? '#18181B' : 'transparent',
                    color: isSelected ? '#ffffff' : '#71717a',
                    border: isSelected ? '1px solid #18181B' : '1px solid #E4E4E7',
                    minWidth: '60px',
                  }}
                >
                  <span className="block text-[10px] opacity-70">
                    {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </span>
                  <span className="block">
                    {day.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time */}
        <div>
          <p className="text-[9px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-2.5">Time</p>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map(time => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className="px-3 h-9 rounded-lg text-sm font-light transition-all duration-150"
                style={{
                  background: selectedTime === time ? '#18181B' : 'transparent',
                  color: selectedTime === time ? '#ffffff' : '#71717a',
                  border: selectedTime === time ? '1px solid #18181B' : '1px solid #E4E4E7',
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleFindTable}
          className="w-full py-3.5 text-xs tracking-[0.2em] uppercase font-light text-white transition-opacity hover:opacity-80"
          style={{ background: '#18181B', borderRadius: '4px' }}
        >
          Find a table
        </button>

        <p className="text-[10px] font-light text-zinc-300 text-center">
          You'll complete your booking on OpenTable
        </p>

      </div>
    </div>
  )
}
