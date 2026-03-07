'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { formatFullDateTime } from '@/lib/date-utils'

interface Proposal {
  id: string
  venue_id: string
  action: 'add' | 'remove'
  start_at: string
  party_min: number
  party_max: number
  slot_tier: string
  source: string
  status: string
  created_at: string
  venue?: { name: string; area: string }
}

type GroupedProposals = Record<string, { venue: { name: string; area: string }; adds: Proposal[]; removes: Proposal[] }>

export default function SyncPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)

  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('slot_proposals')
      .select('*, venue:venues(name, area)')
      .eq('status', 'pending')
      .order('start_at', { ascending: true })

    if (!error) {
      setProposals(data || [])
      if (data?.length) {
        setLastRun(data[0].created_at)
      }
    }
    setLoading(false)
  }

  const applyAll = async (action: 'approve_all' | 'reject_all') => {
    setApplying(true)
    try {
      const res = await fetch('/api/admin/sync/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await loadProposals()
    } catch (err: any) {
      alert('Failed to apply: ' + err.message)
    } finally {
      setApplying(false)
    }
  }

  const applyVenue = async (venueId: string, action: 'approve' | 'reject') => {
    const ids = proposals.filter(p => p.venue_id === venueId).map(p => p.id)
    setApplying(true)
    try {
      const res = await fetch('/api/admin/sync/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, proposalIds: ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await loadProposals()
    } catch (err: any) {
      alert('Failed to apply: ' + err.message)
    } finally {
      setApplying(false)
    }
  }

  // Group by venue
  const grouped: GroupedProposals = {}
  for (const p of proposals) {
    if (!grouped[p.venue_id]) {
      grouped[p.venue_id] = {
        venue: p.venue as any,
        adds: [],
        removes: [],
      }
    }
    if (p.action === 'add') grouped[p.venue_id].adds.push(p)
    else grouped[p.venue_id].removes.push(p)
  }

  const venueIds = Object.keys(grouped)

  return (
    <div className="max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Slot Sync</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Review proposed changes from venue booking systems before applying.
          </p>
          {lastRun && (
            <p className="text-xs text-zinc-400 mt-1">
              Last sync: {new Date(lastRun).toLocaleString('en-GB')}
            </p>
          )}
        </div>

        {proposals.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={() => applyAll('reject_all')}
              disabled={applying}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-zinc-50 disabled:opacity-50"
            >
              Reject all
            </button>
            <button
              onClick={() => applyAll('approve_all')}
              disabled={applying}
              className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50"
            >
              {applying ? 'Applying...' : `Apply all (${proposals.length})`}
            </button>
          </div>
        )}
      </div>

      {/* How to run */}
      <div className="bg-zinc-50 rounded-lg border p-4">
        <p className="text-sm font-medium text-zinc-900 mb-2">Run a sync</p>
        <code className="text-xs text-zinc-500 block">
          npx ts-node scripts/sync-slots.ts
        </code>
        <code className="text-xs text-zinc-500 block mt-1">
          # Options: --venue=home-house --days=14
        </code>
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-400">Loading...</div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-zinc-400 font-light">No pending proposals.</p>
          <p className="text-sm text-zinc-300 mt-1">Run the sync script to check for changes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {venueIds.map(venueId => {
            const { venue, adds, removes } = grouped[venueId]
            return (
              <div key={venueId} className="bg-white rounded-xl border overflow-hidden">

                {/* Venue header */}
                <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-medium text-zinc-900">{venue?.name}</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      <span className="text-green-600">+{adds.length} add</span>
                      {removes.length > 0 && (
                        <span className="text-red-500 ml-2">−{removes.length} remove</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyVenue(venueId, 'reject')}
                      disabled={applying}
                      className="px-3 py-1.5 text-xs border rounded-lg hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => applyVenue(venueId, 'approve')}
                      disabled={applying}
                      className="px-3 py-1.5 text-xs bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Proposals list */}
                <div className="divide-y divide-zinc-50">
                  {[...adds, ...removes].map(p => (
                    <div key={p.id} className="px-6 py-3 flex items-center gap-4">
                      <span className={`w-12 text-xs font-medium ${p.action === 'add' ? 'text-green-600' : 'text-red-500'}`}>
                        {p.action === 'add' ? '+ add' : '− remove'}
                      </span>
                      <span className="text-sm text-zinc-900 font-light flex-1">
                        {formatFullDateTime(p.start_at)}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {p.party_min}–{p.party_max} guests
                      </span>
                      <span className="text-xs text-zinc-300 capitalize">
                        {p.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
