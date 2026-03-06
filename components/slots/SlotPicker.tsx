'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Slot } from '@/lib/supabase'
import AlertToggle from './AlertToggle'
import { isWithin24Hours } from '@/lib/date-utils'

interface SlotPickerProps {
  slots: Slot[]
  onBook: (slotId: string) => void
  isAlertActive: (slotId: string) => boolean
  onToggleAlert: (slotId: string) => void
  bookedSlots: Set<string>
}

function toLocalDateKey(isoString: string): string {
  // Parse as London local time — slots are stored as UTC but represent London times
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).split('/').reverse().join('-') // → YYYY-MM-DD
}

function formatDayLabel(dateKey: string): { short: string; day: string } {
  const d = new Date(dateKey + 'T12:00:00Z')
  return {
    short: d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }),
    day: d.toLocaleDateString('en-GB', { day: 'numeric', timeZone: 'UTC' }),
  }
}

function formatMonthLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T12:00:00Z')
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London',
    hour12: false,
  })
}

export default function SlotPicker({
  slots,
  onBook,
  isAlertActive,
  onToggleAlert,
  bookedSlots,
}: SlotPickerProps) {
  const stripRef = useRef<HTMLDivElement>(null)

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const slot of slots) {
      const key = toLocalDateKey(slot.start_at)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(slot)
    }
    // Sort each day's slots by time
    map.forEach(daySlots => daySlots.sort((a, b) => a.start_at.localeCompare(b.start_at)))
    return map
  }, [slots])

  const dates = useMemo(() => Array.from(slotsByDate.keys()).sort(), [slotsByDate])

  const [selectedDate, setSelectedDate] = useState<string>(() => dates[0] || '')

  // When slots change (e.g. navigation), reset to first date
  useEffect(() => {
    if (dates.length && !slotsByDate.has(selectedDate)) {
      setSelectedDate(dates[0])
    }
  }, [dates])

  // Scroll selected date into view in the strip
  useEffect(() => {
    if (!stripRef.current) return
    const active = stripRef.current.querySelector('[data-active="true"]') as HTMLElement
    if (active) {
      active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedDate])

  if (slots.length === 0) {
    return <p className="text-zinc-400 font-light text-sm">No tables available at this time.</p>
  }

  const daySlots = slotsByDate.get(selectedDate) || []
  const currentMonth = selectedDate ? formatMonthLabel(selectedDate) : ''

  return (
    <div>
      {/* Month label */}
      <p className="text-xs font-light text-zinc-400 mb-3">{currentMonth}</p>

      {/* Date strip */}
      <div
        ref={stripRef}
        className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map(date => {
          const { short, day } = formatDayLabel(date)
          const isActive = date === selectedDate
          const hasBooking = (slotsByDate.get(date) || []).some(s => bookedSlots.has(s.id))

          return (
            <button
              key={date}
              data-active={isActive}
              onClick={() => setSelectedDate(date)}
              className={[
                'flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl transition-all text-center border',
                isActive
                  ? 'bg-zinc-900 border-zinc-900 text-white'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400',
              ].join(' ')}
            >
              <span className="text-[11px] font-light leading-none mb-1 opacity-70">{short}</span>
              <span className="text-lg font-light leading-none">{day}</span>
              {hasBooking && (
                <span className="mt-1 w-1 h-1 rounded-full bg-emerald-500 block" />
              )}
            </button>
          )
        })}
      </div>

      {/* Time tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {daySlots.map(slot => {
          const isBookedByMe = bookedSlots.has(slot.id)
          const within24h = isWithin24Hours(slot.start_at)
          const canBook = slot.status === 'available' && !within24h
          const partyLabel = slot.party_min === slot.party_max
            ? `${slot.party_min} guests`
            : `${slot.party_min}–${slot.party_max} guests`

          if (isBookedByMe) {
            return (
              <div
                key={slot.id}
                className="flex flex-col items-center justify-center h-16 rounded-xl border border-emerald-200 bg-emerald-50 text-center px-2"
              >
                <span className="text-base font-light text-emerald-700">{formatTime(slot.start_at)}</span>
                <span className="text-[11px] font-light text-emerald-600 mt-0.5">Confirmed</span>
              </div>
            )
          }

          if (canBook) {
            return (
              <button
                key={slot.id}
                onClick={() => onBook(slot.id)}
                className="flex flex-col items-center justify-center h-16 rounded-xl border border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50 transition-all text-center px-2"
              >
                <span className="text-base font-light text-zinc-900">{formatTime(slot.start_at)}</span>
                <span className="text-[11px] font-light text-zinc-400 mt-0.5">{partyLabel}</span>
              </button>
            )
          }

          // Within 24h — show alert toggle
          return (
            <div
              key={slot.id}
              className="flex flex-col items-center justify-center h-16 rounded-xl border border-zinc-100 bg-zinc-50 text-center px-2"
            >
              <span className="text-base font-light text-zinc-400">{formatTime(slot.start_at)}</span>
              <div className="mt-1">
                <AlertToggle isActive={isAlertActive(slot.id)} onToggle={() => onToggleAlert(slot.id)} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
