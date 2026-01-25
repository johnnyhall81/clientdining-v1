import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slotId = searchParams.get('slot')
  const redirectPath = searchParams.get('redirect') || '/bookings'

  if (!slotId) {
    return redirect('/search')
  }

  // Call the regular booking API
  const bookingResponse = await fetch(`${request.headers.get('origin')}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('cookie') || '',
    },
    body: JSON.stringify({ slotId }),
  })

  if (bookingResponse.ok) {
    return redirect(`${redirectPath}?booked=true`)
  } else {
    const error = await bookingResponse.json()
    return redirect(`/search?error=${encodeURIComponent(error.error || 'Booking failed')}`)
  }
}
