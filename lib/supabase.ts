import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (use only in API routes)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export type UserRole = 'diner' | 'venue_admin' | 'platform_admin'
export type DinerTier = 'free' | 'premium'
export type VenueType = 'restaurant' | 'club'
export type SlotTier = 'free' | 'premium'
export type BookingStatus = 'active' | 'cancelled' | 'completed'
export type SlotStatus = 'available' | 'booked'
export type AlertStatus = 'active' | 'notified' | 'booked' | 'expired' | 'cancelled'

export interface Profile {
  user_id: string
  role: UserRole
  diner_tier: DinerTier
  is_professionally_verified: boolean
  is_disabled: boolean
  created_at: string
}

export interface Venue {
  id: string
  name: string
  area: string
  venue_type: VenueType
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Slot {
  id: string
  venue_id: string
  start_at: string
  party_min: number
  party_max: number
  slot_tier: SlotTier
  status: SlotStatus
  reserved_for_user_id: string | null
  reserved_until: string | null
  created_at: string
}

export interface Booking {
  id: string
  slot_id: string
  diner_user_id: string
  party_size: number
  status: BookingStatus
  notes_private: string | null
  created_at: string
  cancelled_at: string | null
}

export interface SlotAlert {
  id: string
  slot_id: string
  diner_user_id: string
  status: AlertStatus
  created_at: string
  notified_at: string | null
}
