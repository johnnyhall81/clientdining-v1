'use client'

import { useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
  sizes: string[]
  areas: string[]
  occasions: string[]
}

interface FilterGroup {
  key: keyof FilterState
  label: string
  options: string[]
  defaultVisible: number // how many to show collapsed
}

interface VenueFilterBarProps {
  areas: string[]            // derived from venue data
  filters: FilterState
  onChange: (filters: FilterState) => void
}

// ─── Static options ───────────────────────────────────────────────────────────

const SIZE_OPTIONS = ['Up to 10', 'Up to 20', 'Up to 40', 'Up to 80', '80+']

const OCCASION_OPTIONS = [
  'Client entertaining',
  'Private dining',
  'Drinks reception',
  'Summer party',
  'Corporate event',
  'Team lunch',
  'Networking',
  'Celebration',
  'Board dinner',
  'Working lunch',
]

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-light
        transition-all duration-150 whitespace-nowrap flex-shrink-0
        ${selected
          ? 'bg-zinc-900 text-white'
          : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-400'
        }
      `}
      style={{ fontSize: '0.8125rem', letterSpacing: '0.01em' }}
    >
      {label}
      {selected && (
        <span className="text-zinc-400 leading-none" style={{ fontSize: '0.625rem' }}>✕</span>
      )}
    </button>
  )
}

// ─── FilterGroup row ──────────────────────────────────────────────────────────

function FilterGroupRow({
  group,
  selected,
  isOpen,
  onToggleOpen,
  onToggleChip,
}: {
  group: FilterGroup
  selected: string[]
  isOpen: boolean
  onToggleOpen: () => void
  onToggleChip: (value: string) => void
}) {
  const unselected = group.options.filter(o => !selected.includes(o))

  // What to show collapsed:
  // selected (always) + enough unselected to fill defaultVisible slots
  const visibleUnselected = isOpen
    ? unselected
    : unselected.slice(0, Math.max(0, group.defaultVisible - selected.length))

  const hiddenCount = isOpen ? 0 : unselected.length - visibleUnselected.length

  return (
    <div className="flex items-start gap-3 min-h-[2rem]">
      {/* Group label — acts as toggle */}
      <button
        onClick={onToggleOpen}
        className="flex items-center gap-1.5 flex-shrink-0 mt-1.5"
        style={{ minWidth: '4.5rem' }}
      >
        <span
          className="text-zinc-500 font-light tracking-wide"
          style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {group.label}
        </span>
        {selected.length > 0 && (
          <span
            className="bg-zinc-900 text-white rounded-full flex items-center justify-center"
            style={{ fontSize: '0.625rem', minWidth: '1rem', height: '1rem', padding: '0 0.25rem' }}
          >
            {selected.length}
          </span>
        )}
      </button>

      {/* Chips */}
      <div className="flex flex-wrap gap-2 flex-1">
        {/* Selected always first */}
        {selected.map(val => (
          <Chip key={val} label={val} selected onClick={() => onToggleChip(val)} />
        ))}

        {/* Unselected visible */}
        {visibleUnselected.map(val => (
          <Chip key={val} label={val} selected={false} onClick={() => onToggleChip(val)} />
        ))}

        {/* + more / collapse */}
        {hiddenCount > 0 && (
          <button
            onClick={onToggleOpen}
            className="inline-flex items-center px-3 py-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
            style={{ fontSize: '0.8125rem', letterSpacing: '0.01em' }}
          >
            + {hiddenCount} more
          </button>
        )}
        {isOpen && (
          <button
            onClick={onToggleOpen}
            className="inline-flex items-center px-3 py-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
            style={{ fontSize: '0.8125rem', letterSpacing: '0.01em' }}
          >
            Less
          </button>
        )}

        {/* Per-group clear */}
        {selected.length > 0 && (
          <button
            onClick={() => selected.forEach(v => onToggleChip(v))}
            className="inline-flex items-center px-2 py-1.5 text-zinc-300 hover:text-zinc-500 transition-colors"
            style={{ fontSize: '0.75rem' }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VenueFilterBar({ areas, filters, onChange }: VenueFilterBarProps) {
  const [openGroup, setOpenGroup] = useState<keyof FilterState | null>(null)

  const groups: FilterGroup[] = [
    { key: 'sizes',     label: 'Size',     options: SIZE_OPTIONS,     defaultVisible: 5 },
    { key: 'areas',     label: 'Area',     options: areas,            defaultVisible: 4 },
    { key: 'occasions', label: 'Occasion', options: OCCASION_OPTIONS, defaultVisible: 4 },
  ]

  const toggleGroup = useCallback((key: keyof FilterState) => {
    setOpenGroup(prev => prev === key ? null : key)
  }, [])

  const toggleChip = useCallback((group: keyof FilterState, value: string) => {
    const current = filters[group] as string[]
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...filters, [group]: next })
  }, [filters, onChange])

  const totalSelected = filters.sizes.length + filters.areas.length + filters.occasions.length

  return (
    <div
      className="border-b border-zinc-100 pb-5 mb-8"
      style={{ paddingTop: '1rem' }}
    >
      <div className="space-y-3">
        {groups.map(group => (
          <FilterGroupRow
            key={group.key}
            group={group}
            selected={filters[group.key] as string[]}
            isOpen={openGroup === group.key}
            onToggleOpen={() => toggleGroup(group.key)}
            onToggleChip={val => toggleChip(group.key, val)}
          />
        ))}
      </div>

      {/* Global clear — only show when something is selected */}
      {totalSelected > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onChange({ sizes: [], areas: [], occasions: [] })}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
            style={{ fontSize: '0.8125rem' }}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
