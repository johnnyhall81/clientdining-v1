export type GuestRangeLabel = '' | 'Up to 10' | 'Up to 20' | 'Up to 40' | 'Up to 80' | '80+'

export interface PrivateHireFilters {
  areas: string[]
  guest: GuestRangeLabel
  occasions: string[]
}

export const DEFAULT_PRIVATE_HIRE_FILTERS: PrivateHireFilters = {
  areas: [],
  guest: '',
  occasions: [],
}

export const GUEST_RANGES: { label: Exclude<GuestRangeLabel, ''>; max: number }[] = [
  { label: 'Up to 10', max: 10 },
  { label: 'Up to 20', max: 20 },
  { label: 'Up to 40', max: 40 },
  { label: 'Up to 80', max: 80 },
  { label: '80+', max: Infinity },
]

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

export function parsePrivateHireFilters(searchParams: URLSearchParams | ReadonlyURLSearchParamsLike): PrivateHireFilters {
  const areas = unique((searchParams.get('areas') || '').split(',').map(v => v.trim()).filter(Boolean))
  const occasions = unique((searchParams.get('occasions') || '').split(',').map(v => v.trim()).filter(Boolean))
  const guestParam = (searchParams.get('guest') || '').trim() as GuestRangeLabel
  const guest = GUEST_RANGES.some(r => r.label === guestParam) ? guestParam : ''

  return { areas, guest, occasions }
}

export function serializePrivateHireFilters(filters: PrivateHireFilters): string {
  const params = new URLSearchParams()
  if (filters.areas.length > 0) params.set('areas', filters.areas.join(','))
  if (filters.guest) params.set('guest', filters.guest)
  if (filters.occasions.length > 0) params.set('occasions', filters.occasions.join(','))
  return params.toString()
}

export function privateHireActiveCount(filters: PrivateHireFilters): number {
  return filters.areas.length + (filters.guest ? 1 : 0) + filters.occasions.length
}

type ReadonlyURLSearchParamsLike = {
  get(name: string): string | null
}
