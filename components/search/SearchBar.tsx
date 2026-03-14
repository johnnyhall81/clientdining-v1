'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, addMonths } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { supabase } from '@/lib/supabase-client'

const ALL_AREAS = [
  'Mayfair', 'Soho', 'Covent Garden', 'Fitzrovia', 'Marylebone',
  'Knightsbridge', 'Chelsea', 'Notting Hill', 'Shoreditch',
  'City of London', 'Canary Wharf', 'Portman Square', 'St. James\'s',
  'London Bridge',
]

export interface SearchFilters {
  dateFrom: string
  dateTo: string
  area: string
  partySize: number
  venueId: string
}

interface SearchBarProps {
  filters: SearchFilters
  venues: { id: string; name: string }[]
  onChange: (filters: SearchFilters) => void
}

type Panel = 'date' | 'area' | 'guests' | null

export default function SearchBar({ filters, venues, onChange }: SearchBarProps) {
  const [open, setOpen] = useState<Panel>(null)
  const [hoverDate, setHoverDate] = useState<Date | undefined>(undefined)
  const [availableAreas, setAvailableAreas] = useState<string[]>(ALL_AREAS)
  const ref = useRef<HTMLDivElement>(null)

  // Fetch areas with available slots when date changes
  useEffect(() => {
    const from = filters.dateFrom
      ? new Date(filters.dateFrom + 'T00:00:00')
      : new Date()
    const to = filters.dateTo
      ? new Date(filters.dateTo + 'T23:59:59')
      : new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000)

    supabase
      .rpc('get_available_areas', {
        from_date: from.toISOString(),
        to_date: to.toISOString(),
      })
      .then(({ data, error }) => {
        if (error || !data) {
          setAvailableAreas(ALL_AREAS)
          return
        }
        const areas = data.map((r: any) => r.area).filter(Boolean) as string[]
        setAvailableAreas(areas.length ? areas : ALL_AREAS)
        // Clear selected area if it no longer has availability
        if (filters.area && areas.length && !areas.includes(filters.area)) {
          onChange({ ...filters, area: '' })
        }
      })
  }, [filters.dateFrom, filters.dateTo])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (panel: Panel) => setOpen(open === panel ? null : panel)

  const dateRange: DateRange = {
    from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
    to: filters.dateTo ? new Date(filters.dateTo) : undefined,
  }

  const dateLabel = (() => {
    if (filters.dateFrom && filters.dateTo) {
      const from = new Date(filters.dateFrom)
      const to = new Date(filters.dateTo)
      if (filters.dateFrom === filters.dateTo) return format(from, 'd MMM')
      return `${format(from, 'd MMM')} – ${format(to, 'd MMM')}`
    }
    if (filters.dateFrom) return format(new Date(filters.dateFrom), 'd MMM')
    return null
  })()

  const areaLabel = filters.area || null
  const guestsLabel = `${filters.partySize} guests`

  return (
    <div ref={ref} className="relative">
      {/* Bar */}
      <div className="flex items-stretch bg-white border border-zinc-100 rounded-2xl overflow-visible">

        {/* Date */}
        <button
          type="button"
          onClick={() => toggle('date')}
          className={`flex-1 px-6 py-5 text-left transition-colors rounded-l-2xl ${open === 'date' ? 'bg-zinc-50/80' : 'hover:bg-zinc-50/60'}`}
        >
          <span className="block text-[10px] font-light text-zinc-400 uppercase tracking-widest mb-1">Dates</span>
          <span className={`text-sm font-light ${dateLabel ? 'text-zinc-900' : 'text-zinc-500'}`}>
            {dateLabel || 'Any date'}
          </span>
        </button>

        <div className="w-px bg-zinc-100 my-4" />

        {/* Area */}
        <button
          type="button"
          onClick={() => toggle('area')}
          className={`flex-1 px-6 py-5 text-left transition-colors ${open === 'area' ? 'bg-zinc-50/80' : 'hover:bg-zinc-50/60'}`}
        >
          <span className="block text-[10px] font-light text-zinc-400 uppercase tracking-widest mb-1">Area</span>
          <span className={`text-sm font-light ${areaLabel ? 'text-zinc-900' : 'text-zinc-500'}`}>
            {areaLabel || 'All areas'}
          </span>
        </button>

        <div className="w-px bg-zinc-100 my-4" />

        {/* Guests */}
        <button
          type="button"
          onClick={() => toggle('guests')}
          className={`flex-1 px-6 py-5 text-left transition-colors ${open === 'guests' ? 'bg-zinc-50/80' : 'hover:bg-zinc-50/60'}`}
        >
          <span className="block text-[10px] font-light text-zinc-400 uppercase tracking-widest mb-1">Guests</span>
          <span className="text-sm font-light text-zinc-900">{guestsLabel}</span>
        </button>

        {/* Clear button */}
        {(filters.dateFrom || filters.area) && (
          <>
            <div className="w-px bg-zinc-100 my-4" />
            <button
              type="button"
              onClick={() => onChange({ ...filters, dateFrom: '', dateTo: '', area: '', partySize: 2, venueId: '' })}
              className="px-5 text-xs text-zinc-400 hover:text-zinc-500 font-light transition-colors rounded-r-2xl"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Date panel */}
      {open === 'date' && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-zinc-100 rounded-2xl shadow-lg p-4">
          <style>{`
            .rdp { --rdp-accent-color: #3f3f46; --rdp-background-color: #f4f4f5; }
            .rdp-day_range_start .rdp-day_button,
            .rdp-day_range_end .rdp-day_button,
            .rdp-day_selected .rdp-day_button {
              background-color: #3f3f46 !important;
              color: white !important;
            }
            .rdp-day_range_start:not(.rdp-day_range_end) .rdp-day_button {
              border-radius: 50% 0 0 50% !important;
            }
            .rdp-day_range_end:not(.rdp-day_range_start) .rdp-day_button {
              border-radius: 0 50% 50% 0 !important;
            }
            .rdp-day_range_start.rdp-day_range_end .rdp-day_button {
              border-radius: 50% !important;
            }
            .rdp-day_range_middle .rdp-day_button {
              background-color: #f4f4f5 !important;
              color: #18181b !important;
              border-radius: 0 !important;
            }
            .rdp-day_hover_preview .rdp-day_button {
              background-color: #f4f4f5 !important;
              border-radius: 0 !important;
            }
            .rdp-day_hover_preview_end .rdp-day_button {
              background-color: #e4e4e7 !important;
              border-radius: 0 50% 50% 0 !important;
            }
            .rdp-button_reset.rdp-button:hover:not([disabled]) .rdp-day_button {
              background-color: #e4e4e7 !important;
              border-radius: 50% !important;
            }
          `}</style>
          <DayPicker
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              onChange({
                ...filters,
                dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
              })
              if (range?.from && range?.to) {
                setHoverDate(undefined)
                setOpen(null)
              }
            }}
            modifiers={{
              hover_preview: filters.dateFrom && !filters.dateTo && hoverDate
                ? [{ from: new Date(filters.dateFrom), to: hoverDate }]
                : [],
              hover_preview_end: filters.dateFrom && !filters.dateTo && hoverDate
                ? [hoverDate]
                : [],
            }}
            modifiersClassNames={{
              hover_preview: 'rdp-day_hover_preview',
              hover_preview_end: 'rdp-day_hover_preview_end',
            }}
            onDayMouseEnter={(day) => {
              if (filters.dateFrom && !filters.dateTo) {
                setHoverDate(day)
              }
            }}
            onDayMouseLeave={() => setHoverDate(undefined)}
            numberOfMonths={2}
            fromDate={new Date()}
            toDate={addMonths(new Date(), 2)}
            styles={{
              caption: { fontWeight: 300 },
              day: { fontWeight: 300 },
            }}
            classNames={{
              months: 'flex gap-8',
              caption_label: 'text-sm font-light text-zinc-900',
              nav_button: 'text-zinc-500 hover:text-zinc-900',
              day_today: 'font-medium',
              day_outside: 'text-zinc-400',
              day_disabled: 'text-zinc-400',
            }}
          />
          <div className="mt-3 pt-3 border-t border-zinc-100 text-center min-h-[24px]">
            {filters.dateFrom && !filters.dateTo ? (
              <p className="text-sm font-light text-zinc-500">Select an end date</p>
            ) : filters.dateFrom && filters.dateTo ? (
              <p className="text-sm font-light text-zinc-500">
                {format(new Date(filters.dateFrom), 'd MMM')} – {format(new Date(filters.dateTo), 'd MMM')}
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, dateFrom: '', dateTo: '' })}
                  className="ml-3 text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  ×
                </button>
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Area panel — filtered to areas with slots on selected date */}
      {open === 'area' && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-zinc-100 rounded-2xl shadow-lg p-2 min-w-[200px]">
          <button
            type="button"
            onClick={() => { onChange({ ...filters, area: '' }); setOpen(null) }}
            className={`w-full text-left px-4 py-2.5 text-sm font-light rounded-xl transition-colors ${!filters.area ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
          >
            All areas
          </button>
          {ALL_AREAS.filter(area => availableAreas.includes(area)).map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => { onChange({ ...filters, area }); setOpen(null) }}
              className={`w-full text-left px-4 py-2.5 text-sm font-light rounded-xl transition-colors ${filters.area === area ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
            >
              {area}
            </button>
          ))}
          {filters.dateFrom && availableAreas.length < ALL_AREAS.length && (
            <p className="px-4 pt-2 pb-1 text-[10px] font-light text-zinc-300">
              Showing areas with availability on selected date
            </p>
          )}
        </div>
      )}

      {/* Guests panel */}
      {open === 'guests' && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white border border-zinc-100 rounded-2xl shadow-lg p-6 min-w-[200px]">
          <p className="text-[10px] font-light text-zinc-400 uppercase tracking-widest mb-5">Party size</p>
          <div className="flex items-center justify-between gap-6">
            <button
              type="button"
              onClick={() => onChange({ ...filters, partySize: Math.max(2, filters.partySize - 1) })}
              disabled={filters.partySize <= 2}
              className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              −
            </button>
            <span className="text-xl font-light text-zinc-900 w-8 text-center">{filters.partySize}</span>
            <button
              type="button"
              onClick={() => onChange({ ...filters, partySize: Math.min(10, filters.partySize + 1) })}
              disabled={filters.partySize >= 10}
              className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
