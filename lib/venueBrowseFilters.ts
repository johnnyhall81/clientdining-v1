import type { Venue } from '@/lib/supabase'
import type { VenueFilters, VenueMode, SortOrder } from '@/components/venues/VenueFilterModal'

export const DEFAULT_VENUE_FILTERS: VenueFilters = {
  mode: 'all',
  areas: [],
  sort: 'featured',
}

const VALID_MODES: VenueMode[] = ['all', 'tables', 'spaces']
const VALID_SORTS: SortOrder[] = ['featured', 'alphabetical', 'newest']

function toParams(input?: { toString(): string } | string | null) {
  if (!input) return new URLSearchParams()
  if (typeof input === 'string') return new URLSearchParams(input)
  return new URLSearchParams(input.toString())
}

export function parseVenueFilters(input?: { toString(): string } | string | null): VenueFilters {
  const params = toParams(input)

  const rawMode = params.get('mode') as VenueMode | null
  const rawSort = params.get('sort') as SortOrder | null
  const rawAreas = params.get('areas')

  const mode = VALID_MODES.includes(rawMode as VenueMode) ? (rawMode as VenueMode) : 'all'
  const sort = VALID_SORTS.includes(rawSort as SortOrder) ? (rawSort as SortOrder) : 'featured'
  const areas = Array.from(
    new Set(
      (rawAreas || '')
        .split(',')
        .map((area) => area.trim())
        .filter(Boolean)
    )
  )

  return { mode, sort, areas }
}

export function serialiseVenueFilters(
  filters: VenueFilters,
  existing?: { toString(): string } | string | null
) {
  const params = toParams(existing)

  params.delete('mode')
  params.delete('areas')
  params.delete('sort')

  if (filters.mode !== 'all') params.set('mode', filters.mode)
  if (filters.areas.length > 0) params.set('areas', filters.areas.join(','))
  if (filters.sort !== 'featured') params.set('sort', filters.sort)

  return params
}

export function countActiveVenueFilters(filters: VenueFilters) {
  return (
    (filters.mode !== 'all' ? 1 : 0) +
    filters.areas.length +
    (filters.sort !== 'featured' ? 1 : 0)
  )
}

export function applyVenueFilters<T extends Venue & { hire_only?: boolean | null; private_hire_available?: boolean | null }>(
  venues: T[],
  filters: VenueFilters
): T[] {
  let result = [...venues]

  if (filters.mode === 'tables') {
    result = result.filter((v) => !v.hire_only)
  }

  if (filters.mode === 'spaces') {
    result = result.filter((v) => !!v.private_hire_available || !!v.hire_only)
  }

  if (filters.areas.length > 0) {
    result = result.filter((v) => filters.areas.includes(v.area))
  }

  if (filters.sort === 'alphabetical') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else if (filters.sort === 'newest') {
    result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  return result
}

export function buildVenueBrowseHref(
  pathname: string,
  input?: { toString(): string } | string | null
) {
  const filters = parseVenueFilters(input)
  const params = serialiseVenueFilters(filters)
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
