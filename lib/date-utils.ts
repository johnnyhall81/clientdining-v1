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
  return format(date, 'EEE, MMM d, yyyy at h:mm a')
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  return formatDistance(date, new Date(), { addSuffix: true })
}

export function isWithin24Hours(dateString: string): boolean {
  const slotDate = new Date(dateString)
  const now = new Date()
  const twentyFourHoursFromNow = addHours(now, 24)
  
  return isWithinInterval(slotDate, {
    start: now,
    end: twentyFourHoursFromNow
  })
}

export function getHoursUntilSlot(dateString: string): number {
  const slotDate = new Date(dateString)
  const now = new Date()
  const diff = slotDate.getTime() - now.getTime()
  return diff / (1000 * 60 * 60)
}
