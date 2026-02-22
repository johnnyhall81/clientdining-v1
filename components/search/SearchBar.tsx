'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, addMonths } from 'date-fns'
import 'react-day-picker/dist/style.css'

const AREAS = [
  'Mayfair', 'Soho', 'Covent Garden', 'Fitzrovia', 'Marylebone',
  'Knightsbridge', 'Chelsea', 'Notting Hill', 'Shoreditch',
  'City of London', 'Canary Wharf',
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
  const ref = useRef<HTMLDivElement>(null)

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
      <div className="flex items-stretch bg-white border border-zinc-200 rounded-xl overflow-visible shadow-sm">

        {/* Date */}
        <button
          type="button"
          onClick={() => toggle('date')}
          className={`flex-1 px-5 py-4 text-left transition-colors rounded-l-xl hover:bg-zinc-50 ${open === 'date' ? 'bg-zinc-50' : ''}`}
        >
          <span className="block text-xs text-zinc-400 font-light mb-0.5">Dates</span>
          <span className={`text-sm font-light ${dateLabel ? 'text-zinc-900' : 'text-zinc-400'}`}>
            {dateLabel || 'Any date'}
          </span>
        </button>

        <div className="w-px bg-zinc-200 my-3" />

        {/* Area */}
        <button
          type="button"
          onClick={() => toggle('area')}
          className={`flex-1 px-5 py-4 text-left transition-colors hover:bg-zinc-50 ${open === 'area' ? 'bg-zinc-50' : ''}`}
        >
          <span className="block text-xs text-zinc-400 font-light mb-0.5">Area</span>
          <span className={`text-sm font-light ${areaLabel ? 'text-zinc-900' : 'text-zinc-400'}`}>
            {areaLabel || 'All areas'}
          </span>
        </button>

        <div className="w-px bg-zinc-200 my-3" />

        {/* Guests */}
        <button
          type="button"
          onClick={() => toggle('guests')}
          className={`flex-1 px-5 py-4 text-left transition-colors hover:bg-zinc-50 ${open === 'guests' ? 'bg-zinc-50' : ''}`}
        >
          <span className="block text-xs text-zinc-400 font-light mb-0.5">Guests</span>
          <span className="text-sm font-light text-zinc-900">{guestsLabel}</span>
        </button>

        {/* Clear button */}
        {(filters.dateFrom || filters.area) && (
          <>
            <div className="w-px bg-zinc-200 my-3" />
            <button
              type="button"
              onClick={() => onChange({ ...filters, dateFrom: '', dateTo: '', area: '', partySize: 2, venueId: '' })}
              className="px-4 text-xs text-zinc-400 hover:text-zinc-600 font-light transition-colors rounded-r-xl"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Date panel */}
      {open === 'date' && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg p-4">
          <DayPicker
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              onChange({
                ...filters,
                dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
              })
              if (range?.from && range?.to) setOpen(null)
            }}
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
              nav_button: 'text-zinc-400 hover:text-zinc-900',
              day_selected: 'bg-zinc-900 text-white rounded',
              day_range_middle: 'bg-zinc-100 rounded-none',
              day_range_start: 'bg-zinc-900 text-white rounded-l',
              day_range_end: 'bg-zinc-900 text-white rounded-r',
              day_today: 'font-medium',
              day_outside: 'text-zinc-300',
              day_disabled: 'text-zinc-200',
            }}
          />
          {/* Anchored state prompt */}
          <div className="mt-3 pt-3 border-t border-zinc-100 text-center">
            {filters.dateFrom && !filters.dateTo ? (
              <p className="text-sm font-light text-zinc-400 animate-pulse">Select an end date</p>
            ) : filters.dateFrom && filters.dateTo ? (
              <p className="text-sm font-light text-zinc-400">
                {format(new Date(filters.dateFrom), 'd MMM')} – {format(new Date(filters.dateTo), 'd MMM')}
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, dateFrom: '', dateTo: '' })}
                  className="ml-3 text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  ×
                </button>
              </p>
            ) : (
              <p className="text-sm font-light text-zinc-400">Select a start date</p>
            )}
          </div>
        </div>
      )}

      {/* Area panel */}
      {open === 'area' && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg p-2 min-w-[200px]">
          <button
            type="button"
            onClick={() => { onChange({ ...filters, area: '' }); setOpen(null) }}
            className={`w-full text-left px-4 py-2.5 text-sm font-light rounded-lg transition-colors ${!filters.area ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            All areas
          </button>
          {AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => { onChange({ ...filters, area }); setOpen(null) }}
              className={`w-full text-left px-4 py-2.5 text-sm font-light rounded-lg transition-colors ${filters.area === area ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              {area}
            </button>
          ))}
        </div>
      )}

      {/* Guests panel */}
      {open === 'guests' && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg p-6 min-w-[200px]">
          <p className="text-sm text-zinc-500 font-light mb-4">Party size</p>
          <div className="flex items-center justify-between gap-6">
            <button
              type="button"
              onClick={() => onChange({ ...filters, partySize: Math.max(2, filters.partySize - 1) })}
              disabled={filters.partySize <= 2}
              className="w-9 h-9 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              −
            </button>
            <span className="text-xl font-light text-zinc-900 w-8 text-center">{filters.partySize}</span>
            <button
              type="button"
              onClick={() => onChange({ ...filters, partySize: Math.min(10, filters.partySize + 1) })}
              disabled={filters.partySize >= 10}
              className="w-9 h-9 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
