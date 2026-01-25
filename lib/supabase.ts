// Supabase types

export type DinerTier = 'free' | 'premium'
export type SlotTier = 'free' | 'premium'
export type SlotStatus = 'available' | 'booked' | 'cancelled'

export interface Venue {
  id: string
  name: string
  slug: string
  area: string
  venue_type: 'restaurant' | 'club'
  description: string
  address?: string
  image_venue?: string
  image_food?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Slot {
  id: string
  venue_id: string
  start_at: string
  duration_minutes?: number
  party_min: number
  party_max: number
  slot_tier: SlotTier
  status: SlotStatus
  created_at: string
  updated_at?: string
}

export interface Booking {
  id: string
  slot_id: string
  user_id: string
  venue_id: string
  party_size: number
  notes?: string
  status: 'active' | 'cancelled' | 'completed' | 'no_show'
  bill_amount_gbp?: number
  commission_amount_gbp?: number
  commission_paid: boolean
  created_at: string
  updated_at?: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  role: 'diner' | 'venue_admin' | 'platform_admin'
  tier: DinerTier
  avatar_url?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_status?: string
  subscription_expires_at?: string
  is_professionally_verified: boolean
  verification_method?: string
  verified_at?: string
  created_at: string
  updated_at?: string
}
