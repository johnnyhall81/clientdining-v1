-- ClientDining v1 Database Schema
-- This schema implements all business rules from the specification

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE public.user_role AS ENUM ('diner', 'venue_admin', 'platform_admin');
CREATE TYPE public.diner_tier AS ENUM ('free', 'premium');
CREATE TYPE public.venue_type AS ENUM ('restaurant', 'club');
CREATE TYPE public.slot_tier AS ENUM ('free', 'premium');
CREATE TYPE public.booking_status AS ENUM ('active', 'cancelled', 'completed');
CREATE TYPE public.slot_status AS ENUM ('available', 'booked');
CREATE TYPE public.alert_status AS ENUM ('active', 'notified', 'booked', 'expired', 'cancelled');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'diner',
  diner_tier public.diner_tier NOT NULL DEFAULT 'free',
  is_professionally_verified BOOLEAN NOT NULL DEFAULT false,
  is_disabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Venues (admin-managed)
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  venue_type public.venue_type NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Venue Admin Users (exactly 2 per venue)
CREATE TABLE public.venue_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Venue Images
CREATE TABLE public.venue_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Slots (NO expiry timers)
CREATE TABLE public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  party_min INT NOT NULL,
  party_max INT NOT NULL,
  slot_tier public.slot_tier NOT NULL DEFAULT 'free',
  status public.slot_status NOT NULL DEFAULT 'available',
  -- FIFO reservation window fields (system only)
  reserved_for_user_id UUID REFERENCES auth.users(id),
  reserved_until TIMESTAMPTZ,
  created_by_role public.user_role NOT NULL DEFAULT 'venue_admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX slots_start_at_idx ON public.slots (start_at);
CREATE INDEX slots_status_idx ON public.slots (status);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE RESTRICT,
  diner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  party_size INT NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'active',
  notes_private TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX bookings_diner_idx ON public.bookings (diner_user_id, status);

-- Alerts
CREATE TABLE public.slot_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  diner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.alert_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ
);

-- One active alert per user per slot
CREATE UNIQUE INDEX slot_alerts_unique_active
ON public.slot_alerts(slot_id, diner_user_id)
WHERE status IN ('active','notified');

-- Audit Log (mandatory)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id),
  actor_role public.user_role NOT NULL,
  venue_id UUID REFERENCES public.venues(id),
  action TEXT NOT NULL,
  object_type TEXT,
  object_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Enforce max 2 active venue admins per venue
CREATE OR REPLACE FUNCTION public.enforce_two_venue_admins()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  cnt INT;
BEGIN
  IF (NEW.is_active = true) THEN
    SELECT COUNT(*) INTO cnt
    FROM public.venue_users
    WHERE venue_id = NEW.venue_id 
      AND is_active = true
      AND (TG_OP = 'INSERT' OR id <> NEW.id);
    
    IF cnt >= 2 THEN
      RAISE EXCEPTION 'Venue already has 2 active venue admins';
    END IF;
  END IF;
  
  RETURN NEW;
END $$;

CREATE TRIGGER trg_enforce_two_venue_admins
BEFORE INSERT OR UPDATE ON public.venue_users
FOR EACH ROW EXECUTE FUNCTION public.enforce_two_venue_admins();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.user_role LANGUAGE SQL STABLE AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.current_diner_tier()
RETURNS public.diner_tier LANGUAGE SQL STABLE AS $$
  SELECT diner_tier FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Profiles
CREATE POLICY profiles_read_own ON public.profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Venues + images (read for all logged-in users)
CREATE POLICY venues_read_all_logged_in ON public.venues
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY venue_images_read_all_logged_in ON public.venue_images
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Slots (read for all logged-in users)
CREATE POLICY slots_read_all_logged_in ON public.slots
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Bookings (read own + venue admin read their venue's bookings)
CREATE POLICY bookings_read_own ON public.bookings
FOR SELECT USING (diner_user_id = auth.uid());

CREATE POLICY bookings_read_venue ON public.bookings
FOR SELECT USING (
  public.current_role() IN ('venue_admin','platform_admin')
  AND EXISTS (
    SELECT 1
    FROM public.slots s
    JOIN public.venue_users vu ON vu.venue_id = s.venue_id
    WHERE s.id = bookings.slot_id
      AND vu.user_id = auth.uid()
      AND vu.is_active = true
  )
);

-- Alerts (diner manages own)
CREATE POLICY alerts_read_own ON public.slot_alerts
FOR SELECT USING (diner_user_id = auth.uid());

CREATE POLICY alerts_insert_own ON public.slot_alerts
FOR INSERT WITH CHECK (diner_user_id = auth.uid());

CREATE POLICY alerts_update_own ON public.slot_alerts
FOR UPDATE USING (diner_user_id = auth.uid())
WITH CHECK (diner_user_id = auth.uid());

-- Audit log (only platform admin reads)
CREATE POLICY audit_read_admin ON public.audit_log
FOR SELECT USING (public.current_role() = 'platform_admin');

-- ============================================================================
-- RPC FUNCTIONS (called from server-side with service role)
-- ============================================================================

-- Note: These should be implemented in your API routes with proper business logic
-- This is a placeholder structure showing the required functions

-- book_slot(slot_id, party_size, notes_private)
-- cancel_booking(booking_id, reason)
-- toggle_alert(slot_id, enabled)
-- fifo_advance() -- scheduled job

-- ============================================================================
-- INITIAL DATA (optional - for testing)
-- ============================================================================

-- You can add initial venues, test users, etc. here

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE public.venues IS 'Restaurant and club venues (admin-curated)';
COMMENT ON TABLE public.venue_users IS 'Exactly 2 admin users per venue (enforced)';
COMMENT ON TABLE public.slots IS 'Available time slots (no expiry timers)';
COMMENT ON TABLE public.bookings IS 'User reservations';
COMMENT ON TABLE public.slot_alerts IS 'Alert subscriptions for unavailable slots';
COMMENT ON TABLE public.audit_log IS 'Audit trail for all destructive actions';
