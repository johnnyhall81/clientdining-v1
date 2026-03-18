// Supabase types

export type DinerTier = 'free' | 'premium'
export type SlotTier = 'free' | 'premium'
export type SlotStatus = 'available' | 'booked'  // Matches database enum

export interface Venue {
  id: string
  name: string
  slug: string
  area: string
  venue_type: 'restaurant' | 'club'
  description: string
  private_hire_available?: boolean
  address?: string
  postcode?: string
  phone?: string
  booking_email?: string
  image_hero?: string
  is_active: boolean
  requires_guest_names: boolean
  menus?: { label: string; url: string }[] | null
  menu_highlights?: {
    cuisine_style: string
    price_range: string
    sample_dishes: string[]
    dietary_options: string[]
    note: string | null
  } | null
  created_at: string
  updated_at?: string
}

export interface VenueImage {
  id: string
  venue_id: string
  url: string
  sort_order: number
  alt_text?: string
  created_at: string
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
  private_notes?: string
  guest_names?: string[]
  status: 'active' | 'cancelled' | 'completed' | 'no_show'
  bill_amount_gbp?: number
  commission_amount_gbp?: number
  commission_paid: boolean
  created_at: string
  updated_at?: string
}

export interface Profile {
  user_id: string  // Changed from 'id' to match database schema
  email: string
  full_name?: string
  role: 'diner' | 'venue_admin' | 'platform_admin'
  diner_tier: DinerTier  // Changed from 'tier' to match database schema
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
