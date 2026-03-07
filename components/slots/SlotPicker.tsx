'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Slot } from '@/lib/supabase'

interface SlotPickerProps {
  slots: Slot[]
  onBook: (slotId: string) => void
  isAlertActive: (slotId: string) => boolean
  onToggleAlert: (slotId: string) => void
  bookedSlots: Set<string>
  userAvatarUrl?: string | null
  userInitials?: string
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
  userAvatarUrl,
  userInitials,
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

  // Group dates by month
  const months = useMemo(() => {
    const map = new Map<string, string[]>() // monthKey → dates[]
    for (const date of dates) {
      const monthKey = date.slice(0, 7) // YYYY-MM
      if (!map.has(monthKey)) map.set(monthKey, [])
      map.get(monthKey)!.push(date)
    }
    return map
  }, [dates])

  const monthKeys = useMemo(() => Array.from(months.keys()).sort(), [months])

  const [selectedMonth, setSelectedMonth] = useState<string>(() => 
    dates[0]?.slice(0, 7) || ''
  )

  // When month changes, jump to first available date in that month
  const handleSelectMonth = (monthKey: string) => {
    setSelectedMonth(monthKey)
    const first = months.get(monthKey)?.[0]
    if (first) setSelectedDate(first)
  }

  // Keep selectedMonth in sync if selectedDate changes
  useEffect(() => {
    if (selectedDate) setSelectedMonth(selectedDate.slice(0, 7))
  }, [selectedDate])

  const datesInMonth = months.get(selectedMonth) || []

  if (slots.length === 0) {
    return <p className="text-zinc-400 font-light text-sm">No tables available at this time.</p>
  }

  const daySlots = slotsByDate.get(selectedDate) || []

  return (
    <div>
      {/* Month pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {monthKeys.map(monthKey => {
          const label = new Date(monthKey + '-15T12:00:00Z').toLocaleDateString('en-GB', {
            month: 'long', year: 'numeric', timeZone: 'UTC'
          })
          const isActive = monthKey === selectedMonth
          return (
            <button
              key={monthKey}
              onClick={() => handleSelectMonth(monthKey)}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-light transition-all border',
                isActive
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-200',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Date strip — filtered to selected month */}
      <div
        ref={stripRef}
        className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {datesInMonth.map(date => {
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
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-200',
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
          const partyLabel = slot.party_min === slot.party_max
            ? `${slot.party_min} guests`
            : `${slot.party_min}–${slot.party_max} guests`

          if (isBookedByMe) {
            return (
              <div
                key={slot.id}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border h-16"
                style={{ backgroundColor: '#F7FBF9', borderColor: '#D4EDE2' }}
              >
                {userAvatarUrl ? (
                  <img src={userAvatarUrl} alt="" className="w-[22px] h-[22px] rounded-full object-cover opacity-90 flex-shrink-0" />
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-medium flex-shrink-0" style={{ backgroundColor: '#C8E6D4', color: '#2D7A57' }}>
                    {userInitials || '?'}
                  </div>
                )}
                <span className="flex flex-col">
                  <span className="text-sm font-light leading-tight" style={{ color: '#2A6B4A' }}>{formatTime(slot.start_at)}</span>
                  <span className="text-[11px] font-light leading-tight mt-1" style={{ color: '#7BB89A' }}>Your table</span>
                </span>
              </div>
            )
          }

          if (slot.status === 'available') {
            return (
              <button
                key={slot.id}
                onClick={() => onBook(slot.id)}
                className="flex flex-col items-center justify-center h-16 rounded-xl border border-zinc-200 bg-white hover:border-zinc-200 hover:bg-zinc-50 transition-all text-center px-2"
              >
                <span className="text-base font-light text-zinc-900">{formatTime(slot.start_at)}</span>
                <span className="text-[11px] font-light text-zinc-400 mt-0.5">{partyLabel}</span>
              </button>
            )
          }

          // Booked by someone else — alert tile
          return (
            <button
              key={slot.id}
              onClick={() => onToggleAlert(slot.id)}
              className={[
                'flex flex-col items-center justify-center h-16 rounded-xl border transition-all text-center px-2',
                isAlertActive(slot.id)
                  ? 'border-zinc-200 bg-zinc-50'
                  : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200',
              ].join(' ')}
            >
              <span className="text-base font-light text-zinc-300">{formatTime(slot.start_at)}</span>
              <span className={[
                'text-[11px] font-light mt-0.5',
                isAlertActive(slot.id) ? 'text-zinc-500' : 'text-zinc-300',
              ].join(' ')}>
                {isAlertActive(slot.id) ? '🔔 Alert on' : 'Alert me'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
