'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  GUEST_RANGES,
  PrivateHireFilters,
  privateHireActiveCount,
} from '@/lib/privateHireBrowseFilters'

interface Props {
  open: boolean
  onClose: () => void
  filters: PrivateHireFilters
  onChange: (next: PrivateHireFilters) => void
  availableAreas: string[]
  availableOccasions: string[]
}

const PRIORITY_AREAS = ['Canary Wharf', 'The City', 'Mayfair', 'Belgravia', 'Soho', 'Marylebone']
const PRIORITY_OCCASIONS = ['Summer party', 'Christmas party', 'Board meeting', 'Networking']

const pillStyle = (active: boolean): React.CSSProperties => ({
  borderRadius: '20px',
  border: '1px solid',
  borderColor: active ? '#18181B' : 'var(--divider)',
  backgroundColor: active ? '#18181B' : 'transparent',
  color: active ? 'white' : '#52525B',
  fontSize: '12px',
  fontWeight: 300,
  padding: '6px 14px',
  whiteSpace: 'nowrap' as const,
  cursor: 'pointer',
  transition: 'all 150ms',
})

export default function PrivateHireFilterModal({
  open,
  onClose,
  filters,
  onChange,
  availableAreas,
  availableOccasions,
}: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted || !open) return null

  const orderedAreas = [
    ...PRIORITY_AREAS.filter(a => availableAreas.includes(a)),
    ...availableAreas.filter(a => !PRIORITY_AREAS.includes(a)).sort(),
  ]

  const orderedOccasions = [
    ...PRIORITY_OCCASIONS.filter(o => availableOccasions.includes(o)),
    ...availableOccasions.filter(o => !PRIORITY_OCCASIONS.includes(o)).sort(),
  ]

  const toggleArea = (area: string) =>
    onChange({
      ...filters,
      areas: filters.areas.includes(area)
        ? filters.areas.filter(a => a !== area)
        : [...filters.areas, area],
    })

  const toggleOccasion = (occasion: string) =>
    onChange({
      ...filters,
      occasions: filters.occasions.includes(occasion)
        ? filters.occasions.filter(o => o !== occasion)
        : [...filters.occasions, occasion],
    })

  const clearAll = () =>
    onChange({ areas: [], guest: '', occasions: [] })

  const activeCount = privateHireActiveCount(filters)

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--divider-soft)' }}
        >
          <h2 className="text-base font-light text-zinc-900">Filter</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 space-y-8">
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-[10px] tracking-[0.15em] text-zinc-400 uppercase font-light">Group size</p>
              {filters.guest && (
                <button
                  onClick={() => onChange({ ...filters, guest: '' })}
                  className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GUEST_RANGES.map(range => (
                <button
                  key={range.label}
                  onClick={() => onChange({ ...filters, guest: filters.guest === range.label ? '' : range.label })}
                  style={pillStyle(filters.guest === range.label)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </section>

          {orderedAreas.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-[10px] tracking-[0.15em] text-zinc-400 uppercase font-light">Location</p>
                {filters.areas.length > 0 && (
                  <button
                    onClick={() => onChange({ ...filters, areas: [] })}
                    className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {orderedAreas.map(area => (
                  <button key={area} onClick={() => toggleArea(area)} style={pillStyle(filters.areas.includes(area))}>
                    {area}
                  </button>
                ))}
              </div>
            </section>
          )}

          {orderedOccasions.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-[10px] tracking-[0.15em] text-zinc-400 uppercase font-light">Occasion</p>
                {filters.occasions.length > 0 && (
                  <button
                    onClick={() => onChange({ ...filters, occasions: [] })}
                    className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {orderedOccasions.map(occasion => (
                  <button
                    key={occasion}
                    onClick={() => toggleOccasion(occasion)}
                    style={pillStyle(filters.occasions.includes(occasion))}
                  >
                    {occasion}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--divider-soft)' }}
        >
          <button
            onClick={clearAll}
            className="text-sm font-light text-zinc-500 hover:text-zinc-900 transition-colors"
            disabled={activeCount === 0}
            style={{ opacity: activeCount === 0 ? 0.4 : 1 }}
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="h-9 px-6 text-xs font-light tracking-widest uppercase text-white bg-zinc-900 hover:bg-zinc-700 transition-colors"
            style={{ borderRadius: '3px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
