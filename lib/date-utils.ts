import { format, formatDistance, isWithinInterval, addHours } from 'date-fns'

export function formatSlotDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, 'EEE, MMM d')
}

export function formatSlotTime(dateString: string): string {
  const date = new Date(dateString)
  return format(date, 'h:mm a')
}

export function formatFullDateTime(dateString: string): string {
  const date = new Date(dateString)
  const datePart = format(date, 'EEE, MMM d, yyyy')
  const timePart = format(date, 'h:mm a')
  return `${datePart} at ${timePart}`
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  return formatDistance(date, new Date(), { addSuffix: true })
}

export function isWithin24Hours(dateString: string): boolean {
  const now = new Date()
  const slotTime = new Date(dateString)
  const in24Hours = addHours(now, 24)
  
  return isWithinInterval(slotTime, { start: now, end: in24Hours })
}
