export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { sendBookingConfirmation } from '@/lib/email/send-booking-confirmation'
import { sendCancellationConfirmation } from '@/lib/email/send-cancellation-confirmation'
import { sendAlertNotification } from '@/lib/email/send-alert-notification'
import { sendVerificationConfirmation } from '@/lib/email/send-verification-confirmation'
import { sendAdminBookingAlert } from '@/lib/email/send-admin-booking-alert'

const TEST_EMAIL = 'john@clientdining.com'

const DUMMY = {
  userEmail: TEST_EMAIL,
  userName: 'John Hall',
  venueName: 'Alain Ducasse at The Dorchester',
  venueArea: 'Mayfair',
  venueAddress: 'The Dorchester, 53 Park Lane',
  venuePostcode: 'W1K 1QA',
  venuePhone: '+44 20 7629 8866',
  venueEmail: 'adtd@alainducasse.com',
  venueImageUrl: 'https://xdgpwhfsbquczvttlsgw.supabase.co/storage/v1/object/public/venue-images/homehouse_8.jpg',
  slotTime: 'Tuesday 17 March · 19:15',
  slotStartISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  partySize: 4,
  bookingId: 'test-0000-0000-0000-000000000001',
  guestNames: ['John Hall', 'Sarah Chen', 'Marcus Webb', 'Priya Nair'],
  venueId: '111d4c4f-2516-44de-a8f4-36181fe54222',
  slotId: 'test-slot-id',
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { type } = await request.json()

  try {
    switch (type) {
      case 'booking':
        await sendBookingConfirmation(DUMMY)
        break

      case 'cancellation':
        await sendCancellationConfirmation({
          userEmail: DUMMY.userEmail,
          userName: DUMMY.userName,
          venueName: DUMMY.venueName,
          venueArea: DUMMY.venueArea,
          venueAddress: DUMMY.venueAddress,
          venuePostcode: DUMMY.venuePostcode,
          venueImageUrl: DUMMY.venueImageUrl,
          slotTime: DUMMY.slotTime,
          partySize: DUMMY.partySize,
          bookingId: DUMMY.bookingId,
        })
        break

      case 'alert':
        await sendAlertNotification({
          userEmail: DUMMY.userEmail,
          userName: DUMMY.userName,
          venueName: DUMMY.venueName,
          venueArea: DUMMY.venueArea,
          venueAddress: DUMMY.venueAddress,
          venueImageUrl: DUMMY.venueImageUrl,
          slotTime: DUMMY.slotTime,
          partySize: '2–6 guests',
          slotId: DUMMY.slotId,
          venueId: DUMMY.venueId,
        })
        break

      case 'verification':
        await sendVerificationConfirmation({
          userEmail: DUMMY.userEmail,
          userName: DUMMY.userName,
        })
        break

      case 'admin':
        await sendAdminBookingAlert({
          userName: DUMMY.userName,
          userEmail: DUMMY.userEmail,
          venueName: DUMMY.venueName,
          venueArea: DUMMY.venueArea,
          slotTime: DUMMY.slotTime,
          partySize: DUMMY.partySize,
          bookingId: DUMMY.bookingId,
          notes: 'Celebrating a deal close. Prefer a quiet corner table.',
          guestNames: DUMMY.guestNames,
        })
        break

      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, type })
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
