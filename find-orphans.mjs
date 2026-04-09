#!/usr/bin/env node
/**
 * ClientDining — Orphaned Image Finder & Deleter
 * Checks: venues.image_hero, image_food, logo_url
 *         private_hire_rooms.images (JSONB array)
 *         venue_images.url (gallery images)
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BUCKET = 'venue-images'
const DELETE_MODE = process.argv.includes('--delete')
const DELETE_ALL = process.argv.includes('--delete-all')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function extractFilename(url) {
  if (!url) return null
  const match = url.match(/\/venue-images\/(.+)$/)
  if (match) return decodeURIComponent(match[1])
  if (!url.startsWith('http')) return url
  return null
}

function getVenuePrefix(filename) {
  const descriptors = ['logo', 'hero', 'food', 'bar', 'all', 'restaurant', 'emin', 'ground',
    'library', 'lower', 'upper', 'private', 'room', 'exterior', 'interior', 'dining',
    'terrace', 'garden', 'pdr', 'gd', '1', '2', '3', '4', '5']
  const base = filename.replace(/\.[^.]+$/, '')
  for (const sep of ['-', '_']) {
    const parts = base.split(sep)
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].toLowerCase()
      if (descriptors.some(d => lastPart === d || lastPart.startsWith(d))) {
        return parts.slice(0, -1).join(sep)
      }
    }
  }
  const firstSep = base.search(/[-_]/)
  return firstSep > -1 ? base.substring(0, firstSep) : base
}

async function listAllFiles() {
  const files = []
  let offset = 0
  const limit = 1000
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list('', { limit, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw error
    if (!data || data.length === 0) break
    files.push(...data.filter(f => f.name))
    if (data.length < limit) break
    offset += limit
  }
  return files
}

async function getUsedFilenames() {
  const { data: venues, error: venueError } = await supabase
    .from('venues')
    .select('id, name, image_hero, image_food, logo_url')
  if (venueError) throw venueError

  const { data: rooms, error: roomError } = await supabase
    .from('private_hire_rooms')
    .select('id, name, images')
  if (roomError) throw roomError

  const { data: gallery, error: galleryError } = await supabase
    .from('venue_images')
    .select('url')
  if (galleryError) throw galleryError

  const used = new Set()
  const urlToSource = {}

  for (const venue of (venues || [])) {
    for (const col of ['image_hero', 'image_food', 'logo_url']) {
      const filename = extractFilename(venue[col])
      if (filename) {
        used.add(filename)
        urlToSource[filename] = venue.name
      }
    }
  }

  for (const room of (rooms || [])) {
    if (!room.images || !Array.isArray(room.images)) continue
    for (const img of room.images) {
      const filename = extractFilename(img.url)
      if (filename) {
        used.add(filename)
        urlToSource[filename] = '[room] ' + room.name
      }
    }
  }

  for (const img of (gallery || [])) {
    const filename = extractFilename(img.url)
    if (filename) {
      used.add(filename)
      urlToSource[filename] = '[gallery]'
    }
  }

  return { used, urlToSource, venues: venues || [], rooms: rooms || [], gallery: gallery || [] }
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}

async function deleteFiles(filenames) {
  const { data, error } = await supabase.storage.from(BUCKET).remove(filenames)
  if (error) throw error
  return data
}

async function main() {
  console.log('Fetching all files in venue-images bucket...')
  const allFiles = await listAllFiles()
  console.log('   Found ' + allFiles.length + ' files\n')

  console.log('Fetching all image URLs from venues + private_hire_rooms + venue_images...')
  const { used, urlToSource, venues, rooms, gallery } = await getUsedFilenames()
  console.log('   Found ' + used.size + ' referenced images across ' + venues.length + ' venues, ' + rooms.length + ' rooms, ' + gallery.length + ' gallery images\n')

  const orphans = allFiles.filter(f => !used.has(f.name))
  const inUse = allFiles.filter(f => used.has(f.name))

  console.log('In use:   ' + inUse.length + ' files')
  console.log('Orphaned: ' + orphans.length + ' files\n')

  if (orphans.length === 0) {
    console.log('No orphaned files found. Bucket is clean!')
    return
  }

  const groups = {}
  for (const file of orphans) {
    const prefix = getVenuePrefix(file.name)
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(file)
  }

  const sortedPrefixes = Object.keys(groups).sort()

  console.log('─'.repeat(60))
  console.log('ORPHANED FILES BY VENUE PREFIX')
  console.log('─'.repeat(60))

  for (const prefix of sortedPrefixes) {
    const files = groups[prefix]
    const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2)
    console.log('\n' + prefix + ' (' + files.length + ' files, ~' + sizeMB + ' MB)')
    for (const f of files) {
      const size = f.metadata?.size ? (f.metadata.size / 1024).toFixed(0) + ' KB' : 'size unknown'
      console.log('   ' + f.name + ' (' + size + ')')
    }
  }

  const totalOrphanSize = orphans.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
  console.log('\n' + '─'.repeat(60))
  console.log('Total orphaned: ' + orphans.length + ' files (~' + (totalOrphanSize / 1024 / 1024).toFixed(2) + ' MB)')
  console.log('─'.repeat(60))

  if (!DELETE_MODE && !DELETE_ALL) {
    console.log('\nRun with --delete to interactively delete by venue group.')
    console.log('Run with --delete-all to delete everything above.\n')
    return
  }

  if (DELETE_ALL) {
    const answer = await prompt('\nDelete ALL ' + orphans.length + ' orphaned files? (yes/no): ')
    if (answer === 'yes') {
      await deleteFiles(orphans.map(f => f.name))
      console.log('Deleted ' + orphans.length + ' files.')
    } else {
      console.log('Aborted.')
    }
    return
  }

  console.log('\n' + '─'.repeat(60))
  console.log('INTERACTIVE DELETION (venue by venue)')
  console.log('Type "y" to delete a group, "n" to skip, "q" to quit')
  console.log('─'.repeat(60) + '\n')

  let totalDeleted = 0

  for (const prefix of sortedPrefixes) {
    const files = groups[prefix]
    const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2)

    console.log('\n' + prefix + ' - ' + files.length + ' files (~' + sizeMB + ' MB)')
    for (const f of files) console.log('   ' + f.name)

    const answer = await prompt('   Delete these ' + files.length + ' files? (y/n/q): ')

    if (answer === 'q') {
      console.log('Quitting.')
      break
    }

    if (answer === 'y') {
      await deleteFiles(files.map(f => f.name))
      console.log('   Deleted ' + files.length + ' files.')
      totalDeleted += files.length
    } else {
      console.log('   Skipped.')
    }
  }

  if (totalDeleted > 0) {
    console.log('\nDone. Deleted ' + totalDeleted + ' orphaned files total.')
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
