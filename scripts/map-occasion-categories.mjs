#!/usr/bin/env node
/**
 * scripts/map-occasion-categories.mjs
 *
 * Maps raw best_for tags on private_hire_rooms to curated occasion_categories.
 * Safe to re-run — always overwrites from the current best_for value.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   node scripts/map-occasion-categories.mjs
 *
 * Flags:
 *   --dry-run   Print results without writing
 *   --audit     After mapping, print rooms with no categories (unmapped tags)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_KEY
const DRY_RUN           = process.argv.includes('--dry-run')
const AUDIT             = process.argv.includes('--audit')

if (!SUPABASE_URL) { console.error('Missing SUPABASE_URL'); process.exit(1) }
if (!SUPABASE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Mapping table ────────────────────────────────────────────────────────────
// Raw tag (lowercase, trimmed) → Display category

const TAG_MAP = {
  // Business Dining
  'business dining':          'Business dining',
  'business breakfast':       'Business dining',
  'business lunch':           'Business dining',
  'business dinner':          'Business dining',
  'corporate dining':         'Business dining',
  'client lunch':             'Business dining',
  'client dinner':            'Business dining',
  'vip dining':               'Business dining',
  'discreet hosting':         'Business dining',
  'exclusive dining':         'Business dining',

  // Client Hosting
  'client entertaining':      'Client hosting',
  'business hosting':         'Client hosting',
  'hosted occasion':          'Client hosting',
  'corporate event':          'Client hosting',

  // Celebrations
  'evening event':            'Celebrations',

  // Team Dining
  'team lunch':               'Team dining',
  'team dinner':              'Team dining',
  'group dining':             'Team dining',
  'small group dining':       'Team dining',
  'large dinner':             'Team dining',
  'large group dining':       'Team dining',

  // Private Dining
  'private dining':           'Private dining',
  'private lunch':            'Private dining',
  'private dinner':           'Private dining',
  'exclusive hire':           'Private dining',
  'exclusive venue hire':     'Private dining',
  'full-venue hire':          'Private dining',
  'exclusive dinner':         'Private dining',

  // Drinks Reception
  'cocktail reception':       'Drinks reception',
  'drinks reception':         'Drinks reception',
  'reception':                'Drinks reception',
  'wine tasting':             'Drinks reception',

  // Meetings & Away Days
  'board meeting':            'Meetings & away days',
  'business meeting':         'Meetings & away days',
  'meeting':                  'Meetings & away days',
  'away day':                 'Meetings & away days',
  'breakfast event':          'Meetings & away days',
  'business event':           'Meetings & away days',
  'afternoon tea':            'Meetings & away days',

  // Presentations & Screenings
  'presentation':             'Presentations & screenings',
  'launch':                   'Presentations & screenings',
  'launch event':             'Presentations & screenings',
  'screening':                'Presentations & screenings',

  // Networking
  'networking':               'Networking',
  'networking event':         'Networking',
  'informal corporate event': 'Networking',

  // Celebrations
  'birthday':                 'Celebrations',
  'celebration':              'Celebrations',
  'small celebration':        'Celebrations',
  'party':                    'Celebrations',
  'personal event':           'Celebrations',
  'lunch party':              'Celebrations',
  'summer party':             'Celebrations',
  'christmas party':          'Celebrations',
  'large party':              'Celebrations',
  'large private event':      'Celebrations',
  'large reception':          'Celebrations',
  'private event':            'Celebrations',
  'corporate gathering':      'Celebrations',
  'business gathering':       'Celebrations',

  // Weddings
  'wedding':                  'Weddings',
  'wedding reception':        'Weddings',
}

// Ordered display categories (used for UI chip ordering)
export const OCCASION_CATEGORIES = [
  'Business dining',
  'Client hosting',
  'Team dining',
  'Private dining',
  'Drinks reception',
  'Meetings & away days',
  'Presentations & screenings',
  'Networking',
  'Celebrations',
  'Weddings',
]

function mapTags(bestFor) {
  if (!bestFor || !Array.isArray(bestFor) || bestFor.length === 0) return []
  const categories = new Set()
  const unmapped = []

  for (const tag of bestFor) {
    const key = tag.toLowerCase().trim()
    const category = TAG_MAP[key]
    if (category) {
      categories.add(category)
    } else {
      unmapped.push(tag)
    }
  }

  return { categories: [...categories], unmapped }
}

async function run() {
  const { data: rooms, error } = await supabase
    .from('private_hire_rooms')
    .select('id, name, best_for, occasion_categories')
    .eq('is_active', true)
    .order('name')

  if (error) { console.error('Fetch error:', error.message); process.exit(1) }

  console.log(`\nFound ${rooms.length} active rooms.\n`)
  if (DRY_RUN) console.log('DRY RUN — no writes.\n')

  let ok = 0, empty = 0, failed = 0
  const allUnmapped = []

  for (const room of rooms) {
    const { categories, unmapped } = mapTags(room.best_for)

    if (unmapped.length) allUnmapped.push({ room: room.name, tags: unmapped })

    const label = categories.length
      ? categories.join(', ')
      : '(none)'

    process.stdout.write(`  ${room.name.padEnd(45)} → ${label}\n`)

    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from('private_hire_rooms')
        .update({ occasion_categories: categories })
        .eq('id', room.id)

      if (updateError) {
        console.error(`    ↳ write error: ${updateError.message}`)
        failed++
      } else {
        categories.length > 0 ? ok++ : empty++
      }
    } else {
      categories.length > 0 ? ok++ : empty++
    }
  }

  console.log(`\nDone.  ${ok} mapped, ${empty} empty (no matching tags), ${failed} errors.\n`)

  if (AUDIT && allUnmapped.length) {
    console.log('── Unmapped tags (not in TAG_MAP) ──────────────────')
    for (const { room, tags } of allUnmapped) {
      console.log(`  ${room}: ${tags.join(', ')}`)
    }
    console.log('')
  }
}

run().catch(err => { console.error(err); process.exit(1) })
