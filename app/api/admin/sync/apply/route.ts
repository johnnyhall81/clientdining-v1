import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BATCH_SIZE = 100

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { proposalIds, action } = await request.json()

    let query = supabase
      .from('slot_proposals')
      .select('*')
      .eq('status', 'pending')

    if (proposalIds?.length) {
      query = query.in('id', proposalIds)
    }

    const { data: proposals, error } = await query
    if (error) throw error
    if (!proposals?.length) {
      return NextResponse.json({ success: true, message: 'No pending proposals', applied: 0 })
    }

    const isApproving = action === 'approve_all' || action === 'approve'
    let applied = 0
    let failed = 0

    if (isApproving) {
      const toAdd = proposals.filter((p: any) => p.action === 'add')
      const toRemove = proposals.filter((p: any) => p.action === 'remove')

      // Process removes individually (need conditional .eq('status', 'available'))
      for (const proposal of toRemove) {
        await supabase
          .from('slots')
          .delete()
          .eq('venue_id', proposal.venue_id)
          .eq('start_at', proposal.start_at)
          .eq('status', 'available')
      }

      // Batch inserts
      for (let i = 0; i < toAdd.length; i += BATCH_SIZE) {
        const batch = toAdd.slice(i, i + BATCH_SIZE)
        const { error: insertError } = await supabase
          .from('slots')
          .upsert(
            batch.map((p: any) => ({
              venue_id: p.venue_id,
              start_at: p.start_at,
              party_min: p.party_min,
              party_max: p.party_max,
              slot_tier: p.slot_tier,
              session_name: p.session_name,
              status: 'available',
            })),
            { onConflict: 'venue_id,start_at', ignoreDuplicates: false }
          )
        if (insertError) {
          console.error(`Batch insert error (batch ${i / BATCH_SIZE + 1}):`, insertError.message)
          failed += batch.length
        } else {
          applied += batch.length
        }
      }
      applied += toRemove.length
    }

    // Mark all proposals as approved/rejected in batches
    const allIds = proposals.map((p: any) => p.id)
    for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
      await supabase
        .from('slot_proposals')
        .update({ status: isApproving ? 'approved' : 'rejected' })
        .in('id', allIds.slice(i, i + BATCH_SIZE))
    }

    return NextResponse.json({
      success: true,
      applied,
      failed,
      total: proposals.length,
    })
  } catch (error: any) {
    console.error('Sync apply error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
