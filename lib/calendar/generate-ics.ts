import { createEvent, EventAttributes } from 'ics'

interface GenerateIcsParams {
  venueName: string
  venueAddress: string
  startTime: string
  partySize: number
  bookingId: string
}

export function generateIcs({
  venueName,
  venueAddress,
  startTime,
  partySize,
  bookingId
}: GenerateIcsParams): string | null {
  try {
    const start = new Date(startTime)
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)

    const event: EventAttributes = {
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes()
      ],
      end: [
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
        end.getHours(),
        end.getMinutes()
      ],
      title: `Dinner at ${venueName}`,
      description: `Business dinner for ${partySize} guests\\nBooking ID: ${bookingId}`,
      location: `${venueName}, ${venueAddress}`,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'ClientDining', email: 'notifications@clientdining.com' }
    }

    const { error, value } = createEvent(event)
    
    if (error) {
      console.error('ICS generation error:', error)
      return null
    }

    return value || null
  } catch (error) {
    console.error('Error generating ICS:', error)
    return null
  }
}