#!/usr/bin/env npx ts-node
/**
 * ClientDining — Slot Sync Agent
 * 
 * Run with: npx ts-node scripts/sync-slots.ts
 * Or:       npx ts-node scripts/sync-slots.ts --venue home-house --days 14
 * 
 * What it does:
 *   1. Fetches active venues with a booking_widget_url
 *   2. Calls the booking system API to get available times (next N days)
 *   3. Compares against existing slots in Supabase
 *   4. Writes proposed adds/removes to slot_proposals table
 *   5. Prints a summary — then you approve via /admin/sync
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require('@supabase/supabase-js')

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const DAYS_AHEAD = parseInt(process.argv.find(a => a.startsWith('--days='))?.split('=')[1] || '30')
const VENUE_FILTER = process.argv.find(a => a.startsWith('--venue='))?.split('=')[1]

// Party sizes to query — we check each to get full availability picture
const PARTY_SIZES = [2, 4, 6]

// Filter slots at or after this UTC hour. Use 14 during BST (Apr–Oct), 15 in GMT winter.
const MAX_HOUR_UTC = parseInt(process.argv.find(a => a.startsWith('--max-hour='))?.split('=')[1] || '99')

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateRange(days: number): string[] {
  const dates: string[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function toUTC(date: string, time: string): string {
  // SevenRooms returns times in venue local time (London = UTC+0/+1)
  // We store as UTC in Supabase
  return new Date(`${date}T${time}:00Z`).toISOString()
}

// ─── Scrapers ─────────────────────────────────────────────────────────────────

async function fetchSevenRoomsSlots(
  venueId: string,
  dates: string[],
  baseEndpoint = 'https://www.sevenrooms.com/api-yoa/availability/widget/range'
): Promise<{ start_at: string; party_min: number; party_max: number; session_name: string | null }[]> {
  const slots: Map<string, { party_min: number; party_max: number; session_name: string | null }> = new Map()

  // SevenRooms widget API: num_days is not supported — must query one day at a time.
  // To avoid rate limiting (which caused the barbell pattern), we query by time slot first
  // across all dates, with a generous delay between requests.
  const TIME_SLOTS = ['12:00', '19:00']

  for (const partySize of PARTY_SIZES) {
    for (const timeSlot of TIME_SLOTS) {
      for (const date of dates) {
        const url = `${baseEndpoint}` +
          `?venue=${venueId}` +
          `&time_slot=${timeSlot}` +
          `&party_size=${partySize}` +
          `&halo_size_interval=16` +
          `&start_date=${date}` +
          `&channel=SEVENROOMS_WIDGET`

        try {
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              'Accept': 'application/json',
            }
          })

          if (!res.ok) {
            const rawErr = await res.text()
            console.warn(`  ⚠ SevenRooms returned ${res.status} for ${date} party:${partySize} time:${timeSlot}`)
            console.warn(`  ⚠ Raw:`, rawErr.slice(0, 200))
            continue
          }

          const rawText = await res.text()
          if (!rawText.trimStart().startsWith('{') && !rawText.trimStart().startsWith('[')) {
            console.warn(`  ⚠ Non-JSON for ${date} party:${partySize} time:${timeSlot}`)
            continue
          }

          const data: any = JSON.parse(rawText)
          const shifts = data?.data?.availability?.[date] || []

          for (const shift of shifts) {
            for (const slot of (shift.times || [])) {
              const start_at = slot.utc_datetime
                ? new Date(slot.utc_datetime.replace(' ', 'T') + 'Z').toISOString()
                : toUTC(date, slot.time)
              const existing = slots.get(start_at)
              const sessionName = slot.public_time_slot_description || null

              if (!existing) {
                slots.set(start_at, { party_min: partySize, party_max: partySize, session_name: sessionName })
              } else {
                slots.set(start_at, {
                  party_min: Math.min(existing.party_min, partySize),
                  party_max: Math.max(existing.party_max, partySize),
                  session_name: existing.session_name || sessionName,
                })
              }
            }
          }
        } catch (err) {
          console.warn(`  ⚠ Error fetching ${date} party:${partySize} time:${timeSlot}:`, err)
        }

        // 500ms delay — enough to avoid SevenRooms rate limiting
        await new Promise(r => setTimeout(r, 500))
      }
    }
  }

  return Array.from(slots.entries()).map(([start_at, sizes]) => ({
    start_at,
    ...sizes,
  }))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const dates = dateRange(DAYS_AHEAD)
  const cutoff = new Date().toISOString()
  const horizon = new Date()
  horizon.setDate(horizon.getDate() + DAYS_AHEAD)

  console.log(`\n🔍 ClientDining Slot Sync`)
  console.log(`   Checking ${DAYS_AHEAD} days ahead (${dates[0]} → ${dates[dates.length - 1]})`)
  if (VENUE_FILTER) console.log(`   Filtering to venue: ${VENUE_FILTER}`)

  // 1. Load venues
  let venueQuery = supabase
    .from('venues')
    .select('id, name, slug, booking_system, booking_widget_url')
    .eq('is_active', true)
    .not('booking_widget_url', 'is', null)

  if (VENUE_FILTER) venueQuery = venueQuery.eq('slug', VENUE_FILTER)

  const { data: venues, error: venueError } = await venueQuery
  if (venueError) throw venueError
  if (!venues?.length) {
    console.log('\n⚠ No venues with booking_widget_url found.')
    return
  }

  console.log(`\n   Found ${venues.length} venue(s) to sync\n`)

  let totalAdds = 0
  let totalRemoves = 0

  for (const venue of venues) {
    console.log(`\n📍 ${venue.name} (${venue.booking_system})`)

    // 2. Extract venue ID from widget URL — handles both query-param (?venue=boha)
    //    and path-based (/explore/aragawa/) SevenRooms URLs
    const widgetUrl = new URL(venue.booking_widget_url)
    const venueId = widgetUrl.searchParams.get('venue') ||
      widgetUrl.pathname.match(/\/explore\/([^/]+)/)?.[1] || ''
    const baseEndpoint = 'https://www.sevenrooms.com/api-yoa/availability/widget/range'

    // 3. Fetch live availability
    console.log(`   Fetching availability...`)
    let liveSlots: { start_at: string; party_min: number; party_max: number; session_name: string | null }[] = []

    if (venue.booking_system === 'sevenrooms') {
      liveSlots = await fetchSevenRoomsSlots(venueId, dates, baseEndpoint)
    } else {
      console.log(`   ⚠ Booking system '${venue.booking_system}' not yet supported, skipping`)
      continue
    }

    console.log(`   Found ${liveSlots.length} live available slots`)

    // Filter out slots at or after MAX_HOUR_UTC (e.g. 3pm for lunch-only venues)
    if (MAX_HOUR_UTC < 99) {
      liveSlots = liveSlots.filter(s => new Date(s.start_at).getUTCHours() < MAX_HOUR_UTC)
      console.log(`   After <${MAX_HOUR_UTC}:00 UTC filter: ${liveSlots.length} slots`)
    }

    // 4. Load existing slots from Supabase
    const { data: existingSlots } = await supabase
      .from('slots')
      .select('id, start_at, party_min, party_max, status')
      .eq('venue_id', venue.id)
      .eq('status', 'available')
      .gte('start_at', cutoff)
      .lte('start_at', horizon.toISOString())

    const existingMap = new Map((existingSlots || []).map((s: any) => [s.start_at, s]))
    const liveMap = new Map(liveSlots.map(s => [s.start_at, s]))

    // 5. Diff: what's new?
    const toAdd = liveSlots.filter(s => !existingMap.has(s.start_at))

    // 6. Diff: what's gone?
    const toRemove = (existingSlots || []).filter((s: any) => !liveMap.has(s.start_at))

    console.log(`   +${toAdd.length} new slots to add, -${toRemove.length} slots to remove`)

    // 7. Clear existing pending proposals for this venue
    await supabase
      .from('slot_proposals')
      .delete()
      .eq('venue_id', venue.id)
      .eq('status', 'pending')

    // 8. Write new proposals
    if (toAdd.length > 0) {
      const { error } = await supabase.from('slot_proposals').insert(
        toAdd.map(s => ({
          venue_id: venue.id,
          action: 'add',
          start_at: s.start_at,
          party_min: s.party_min,
          party_max: s.party_max,
          slot_tier: 'free',
          source: venue.booking_system,
          session_name: s.session_name,
        }))
      )
      if (error) console.error(`   ❌ Error writing add proposals:`, error.message)
    }

    if (toRemove.length > 0) {
      const { error } = await supabase.from('slot_proposals').insert(
        toRemove.map((s: any) => ({
          venue_id: venue.id,
          action: 'remove',
          start_at: s.start_at,
          party_min: s.party_min,
          party_max: s.party_max,
          slot_tier: 'free',
          source: venue.booking_system,
        }))
      )
      if (error) console.error(`   ❌ Error writing remove proposals:`, error.message)
    }

    totalAdds += toAdd.length
    totalRemoves += toRemove.length
  }

  console.log(`\n✅ Sync complete`)
  console.log(`   ${totalAdds} slots to add, ${totalRemoves} slots to remove`)
  console.log(`\n👉 Review and apply at: https://clientdining.com/admin/sync\n`)
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
