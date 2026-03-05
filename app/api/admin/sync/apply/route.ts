import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { proposalIds, action } = await request.json()

    // action = 'approve_all' | 'reject_all' | 'approve' | 'reject'
    // proposalIds = array of IDs, or omit for all pending

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

    for (const proposal of proposals) {
      try {
        if (isApproving) {
          if (proposal.action === 'add') {
            // Create the slot
            const { error: insertError } = await supabase
              .from('slots')
              .insert({
                venue_id: proposal.venue_id,
                start_at: proposal.start_at,
                party_min: proposal.party_min,
                party_max: proposal.party_max,
                slot_tier: proposal.slot_tier,
                status: 'available',
              })
            if (insertError) {
              // Ignore duplicate slots
              if (!insertError.message.includes('duplicate')) throw insertError
            }
          } else if (proposal.action === 'remove') {
            // Only remove if still available (not booked)
            await supabase
              .from('slots')
              .delete()
              .eq('venue_id', proposal.venue_id)
              .eq('start_at', proposal.start_at)
              .eq('status', 'available')
          }
        }

        // Mark proposal as approved or rejected
        await supabase
          .from('slot_proposals')
          .update({ status: isApproving ? 'approved' : 'rejected' })
          .eq('id', proposal.id)

        applied++
      } catch (err: any) {
        console.error(`Error applying proposal ${proposal.id}:`, err.message)
        failed++
      }
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
