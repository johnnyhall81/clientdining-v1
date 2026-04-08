#!/usr/bin/env node
/**
 * ClientDining — Orphaned Image Finder & Deleter
 * 
 * Lists all files in the venue-images bucket, cross-references against
 * image_hero, image_food, logo_url columns in the venues table, and
 * lets you delete orphans one venue-prefix group at a time.
 * 
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   node find-orphans.mjs
 * 
 *   Add --delete to enable interactive deletion mode
 *   Add --delete-all to delete all orphans without prompting
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
  // Handle full public URLs: .../storage/v1/object/public/venue-images/filename.jpg
  const match = url.match(/\/venue-images\/(.+)$/)
  if (match) return decodeURIComponent(match[1])
  // Handle bare filenames already
  if (!url.startsWith('http')) return url
  return null
}

function getVenuePrefix(filename) {
  // Group by the prefix before the first hyphen or underscore that's followed by a keyword
  // e.g. "12hh_logo.png" -> "12hh", "34mayfair-logo.png" -> "34mayfair"
  // Strategy: take everything up to the last hyphen/underscore segment that looks like a descriptor
  const descriptors = ['logo', 'hero', 'food', 'bar', 'all', 'restaurant', 'emin', 'ground',
    'library', 'lower', 'upper', 'private', 'room', 'exterior', 'interior', 'dining',
    'terrace', 'garden', 'pdr', 'gd', '1', '2', '3', '4', '5']
  
  // Remove extension
  const base = filename.replace(/\.[^.]+$/, '')
  
  // Try splitting on hyphen first, then underscore
  for (const sep of ['-', '_']) {
    const parts = base.split(sep)
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].toLowerCase()
      if (descriptors.some(d => lastPart === d || lastPart.startsWith(d))) {
        return parts.slice(0, -1).join(sep)
      }
    }
  }
  
  // Fallback: everything before first separator
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
    
    files.push(...data.filter(f => f.name)) // exclude folders
    if (data.length < limit) break
    offset += limit
  }
  
  return files
}

async function getUsedFilenames() {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, image_hero, image_food, logo_url')
  
  if (error) throw error
  
  const used = new Set()
  const urlToVenue = {}
  
  for (const venue of data) {
    for (const col of ['image_hero', 'image_food', 'logo_url']) {
      const filename = extractFilename(venue[col])
      if (filename) {
        used.add(filename)
        urlToVenue[filename] = venue.name
      }
    }
  }
  
  return { used, urlToVenue, venues: data }
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
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .remove(filenames)
  
  if (error) throw error
  return data
}

async function main() {
  console.log('🔍 Fetching all files in venue-images bucket...')
  const allFiles = await listAllFiles()
  console.log(`   Found ${allFiles.length} files\n`)
  
  console.log('🔍 Fetching all image URLs from venues table...')
  const { used, urlToVenue, venues } = await getUsedFilenames()
  console.log(`   Found ${used.size} referenced images across ${venues.length} venues\n`)
  
  // Find orphans
  const orphans = allFiles.filter(f => !used.has(f.name))
  const inUse = allFiles.filter(f => used.has(f.name))
  
  console.log(`✅ In use:   ${inUse.length} files`)
  console.log(`🗑  Orphaned: ${orphans.length} files\n`)
  
  if (orphans.length === 0) {
    console.log('No orphaned files found. Bucket is clean!')
    return
  }
  
  // Group orphans by venue prefix
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
    console.log(`\n📁 ${prefix} (${files.length} files, ~${sizeMB} MB)`)
    for (const f of files) {
      const size = f.metadata?.size ? `${(f.metadata.size / 1024).toFixed(0)} KB` : 'size unknown'
      console.log(`   • ${f.name} (${size})`)
    }
  }
  
  // Summary
  const totalOrphanSize = orphans.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
  console.log('\n' + '─'.repeat(60))
  console.log(`Total orphaned: ${orphans.length} files (~${(totalOrphanSize / 1024 / 1024).toFixed(2)} MB)`)
  console.log('─'.repeat(60))
  
  if (!DELETE_MODE && !DELETE_ALL) {
    console.log('\nRun with --delete to interactively delete by venue group.')
    console.log('Run with --delete-all to delete everything above.\n')
    return
  }
  
  if (DELETE_ALL) {
    const answer = await prompt(`\n⚠️  Delete ALL ${orphans.length} orphaned files? (yes/no): `)
    if (answer === 'yes') {
      await deleteFiles(orphans.map(f => f.name))
      console.log(`✅ Deleted ${orphans.length} files.`)
    } else {
      console.log('Aborted.')
    }
    return
  }
  
  // Interactive per-group deletion
  console.log('\n' + '─'.repeat(60))
  console.log('INTERACTIVE DELETION (venue by venue)')
  console.log('Type "y" to delete a group, "n" to skip, "q" to quit')
  console.log('─'.repeat(60) + '\n')
  
  let totalDeleted = 0
  
  for (const prefix of sortedPrefixes) {
    const files = groups[prefix]
    const names = files.map(f => f.name).join(', ')
    const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2)
    
    console.log(`\n📁 ${prefix} — ${files.length} files (~${sizeMB} MB)`)
    for (const f of files) console.log(`   ${f.name}`)
    
    const answer = await prompt(`   Delete these ${files.length} files? (y/n/q): `)
    
    if (answer === 'q') {
      console.log('Quitting. No further deletions.')
      break
    }
    
    if (answer === 'y') {
      await deleteFiles(files.map(f => f.name))
      console.log(`   ✅ Deleted ${files.length} files.`)
      totalDeleted += files.length
    } else {
      console.log('   ⏭  Skipped.')
    }
  }
  
  if (totalDeleted > 0) {
    console.log(`\n✅ Done. Deleted ${totalDeleted} orphaned files total.`)
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
