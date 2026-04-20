#!/usr/bin/env node
/**
 * scripts/geocode-venues.mjs
 *
 * One-time backfill: geocodes every active venue that is missing lat/lng
 * and writes the result back to Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   MAPBOX_TOKEN=pk.eyJ... \
 *   node scripts/geocode-venues.mjs
 *
 * Safe to re-run — skips venues that already have coords.
 * Use --force to re-geocode everything.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = process.env.SUPABASE_URL      || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_KEY
const MAPBOX_TOKEN      = process.env.MAPBOX_TOKEN      || process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const FORCE             = process.argv.includes('--force')
const DRY_RUN           = process.argv.includes('--dry-run')

// ─── Validation ──────────────────────────────────────────────────────────────

if (!SUPABASE_URL)   { console.error('Missing SUPABASE_URL');        process.exit(1) }
if (!SUPABASE_KEY)   { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
if (!MAPBOX_TOKEN)   { console.error('Missing MAPBOX_TOKEN');         process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Geocoder ────────────────────────────────────────────────────────────────

async function geocode(venue) {
  const query = venue.address
    ? [venue.address, venue.postcode, 'London', 'UK'].filter(Boolean).join(', ')
    : [venue.name, venue.area, 'London', 'UK'].filter(Boolean).join(', ')

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
    `${encodeURIComponent(query)}.json` +
    `?access_token=${MAPBOX_TOKEN}&country=GB&limit=1&proximity=-0.1276,51.5074`

  const res  = await fetch(url)
  const data = await res.json()
  const feat = data.features?.[0]
  if (!feat) return null

  const [lng, lat] = feat.center
  return { lat, lng, place_name: feat.place_name }
}

// ─── Rate-limited runner ──────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function run() {
  // Fetch venues — use service key so RLS doesn't interfere
  let query = supabase
    .from('venues')
    .select('id, name, area, address, postcode, lat, lng')
    .eq('is_active', true)
    .order('name')

  if (!FORCE) query = query.or('lat.is.null,lng.is.null')

  const { data: venues, error } = await query
  if (error) { console.error('Supabase fetch error:', error.message); process.exit(1) }

  console.log(`\nFound ${venues.length} venue(s) to geocode${FORCE ? ' (--force)' : ''}.\n`)
  if (DRY_RUN) console.log('DRY RUN — no writes.\n')

  let ok = 0, failed = 0

  for (const venue of venues) {
    process.stdout.write(`  ${venue.name.padEnd(40)} `)

    const coords = await geocode(venue)

    if (!coords) {
      console.log('✗  no result')
      failed++
    } else {
      console.log(`✓  ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}  (${coords.place_name})`)
      if (!DRY_RUN) {
        const { error: updateError } = await supabase
          .from('venues')
          .update({ lat: coords.lat, lng: coords.lng })
          .eq('id', venue.id)

        if (updateError) {
          console.error(`    ↳ write error: ${updateError.message}`)
          failed++
          continue
        }
      }
      ok++
    }

    // Mapbox free tier: 600 req/min — 120ms gap is plenty
    await sleep(120)
  }

  console.log(`\nDone.  ${ok} geocoded, ${failed} failed.\n`)
  if (failed > 0) console.log('Re-run with --force to retry failed venues.\n')
}

run().catch(err => { console.error(err); process.exit(1) })
