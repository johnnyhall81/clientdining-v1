# API Implementation Guide

This document explains how to implement the server-side booking logic, whether you choose Supabase RPC or a separate API server.

## 🎯 Core Booking Logic

The booking creation MUST enforce these rules:

### 1. Authentication & Verification
```typescript
// User must be:
- Authenticated (has valid session)
- Professionally verified (profiles.is_professionally_verified = true)
- Not disabled (profiles.is_disabled = false)
```

### 2. 24-Hour Cutover Rule
```typescript
function isWithin24Hours(slotStartAt: string): boolean {
  const slotDate = new Date(slotStartAt)
  const now = new Date()
  const diff = slotDate.getTime() - now.getTime()
  const hours = diff / (1000 * 60 * 60)
  return hours <= 24 && hours > 0
}

// If within 24h: BYPASS tier check and booking cap
// If >24h: ENFORCE tier check and booking cap
```

### 3. Tier Eligibility
```typescript
if (!isWithin24Hours(slot.start_at)) {
  // Only check tier for >24h bookings
  if (slot.slot_tier === 'premium' && diner.diner_tier === 'free') {
    throw new Error('Premium subscription required')
  }
}
```

### 4. Booking Cap
```typescript
if (!isWithin24Hours(slot.start_at)) {
  // Only check cap for >24h bookings
  const futureBookings = await countFutureBookings(userId)
  // futureBookings = COUNT of bookings where:
  //   - status = 'active'
  //   - start_at > NOW()
  //   - start_at - NOW() > 24 hours
  
  const limit = diner.diner_tier === 'premium' ? 10 : 3
  
  if (futureBookings >= limit) {
    throw new Error(`Booking limit reached (${limit} future bookings)`)
  }
}
```

### 5. Overlap Prevention
```typescript
// Prevent booking if user has another active booking within 2 hours
const overlappingBooking = await checkOverlap(userId, slotStartAt)
if (overlappingBooking) {
  throw new Error('You have another booking too close to this time')
}
```

## 📝 Supabase RPC Implementation

### Complete book_slot Function

```sql
CREATE OR REPLACE FUNCTION public.book_slot(
  p_slot_id UUID,
  p_party_size INT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_booking_id UUID;
  v_slot RECORD;
  v_profile RECORD;
  v_future_bookings INT;
  v_hours_until NUMERIC;
  v_within_24h BOOLEAN;
  v_booking_limit INT;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get user profile
  SELECT * INTO v_profile FROM profiles WHERE user_id = v_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  
  IF NOT v_profile.is_professionally_verified THEN
    RAISE EXCEPTION 'Professional verification required';
  END IF;
  
  IF v_profile.is_disabled THEN
    RAISE EXCEPTION 'Account is disabled';
  END IF;
  
  -- Get slot
  SELECT * INTO v_slot FROM slots WHERE id = p_slot_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not found';
  END IF;
  
  IF v_slot.status != 'available' THEN
    RAISE EXCEPTION 'Slot is not available';
  END IF;
  
  -- Check if reserved for someone else
  IF v_slot.reserved_for_user_id IS NOT NULL 
     AND v_slot.reserved_for_user_id != v_user_id THEN
    RAISE EXCEPTION 'Slot is reserved for another user';
  END IF;
  
  -- Calculate hours until slot
  v_hours_until := EXTRACT(EPOCH FROM (v_slot.start_at - NOW())) / 3600;
  v_within_24h := v_hours_until <= 24 AND v_hours_until > 0;
  
  -- If NOT within 24h, enforce tier and cap
  IF NOT v_within_24h THEN
    -- Check tier eligibility
    IF v_slot.slot_tier = 'premium' AND v_profile.diner_tier = 'free' THEN
      RAISE EXCEPTION 'Premium subscription required for this slot';
    END IF;
    
    -- Count future bookings (>24h from now)
    SELECT COUNT(*) INTO v_future_bookings
    FROM bookings b
    JOIN slots s ON s.id = b.slot_id
    WHERE b.diner_user_id = v_user_id
      AND b.status = 'active'
      AND s.start_at > NOW()
      AND EXTRACT(EPOCH FROM (s.start_at - NOW())) / 3600 > 24;
    
    -- Check booking limit
    v_booking_limit := CASE WHEN v_profile.diner_tier = 'premium' THEN 10 ELSE 3 END;
    
    IF v_future_bookings >= v_booking_limit THEN
      RAISE EXCEPTION 'Booking limit reached (% future bookings)', v_booking_limit;
    END IF;
  END IF;
  
  -- Check for overlapping bookings (within 2 hours)
  IF EXISTS (
    SELECT 1 FROM bookings b
    JOIN slots s ON s.id = b.slot_id
    WHERE b.diner_user_id = v_user_id
      AND b.status = 'active'
      AND ABS(EXTRACT(EPOCH FROM (s.start_at - v_slot.start_at))) < 7200
  ) THEN
    RAISE EXCEPTION 'You have another booking too close to this time';
  END IF;
  
  -- Create booking (atomic)
  INSERT INTO bookings (slot_id, diner_user_id, party_size, notes_private)
  VALUES (p_slot_id, v_user_id, p_party_size, p_notes)
  RETURNING id INTO v_booking_id;
  
  -- Update slot status
  UPDATE slots 
  SET status = 'booked',
      reserved_for_user_id = NULL,
      reserved_until = NULL
  WHERE id = p_slot_id;
  
  -- Mark any active alerts as booked
  UPDATE slot_alerts
  SET status = 'booked'
  WHERE slot_id = p_slot_id 
    AND diner_user_id = v_user_id
    AND status IN ('active', 'notified');
  
  -- Audit log
  INSERT INTO audit_log (actor_user_id, actor_role, action, object_type, object_id, metadata)
  VALUES (
    v_user_id,
    v_profile.role,
    'create_booking',
    'booking',
    v_booking_id,
    json_build_object('slot_id', p_slot_id, 'party_size', p_party_size)
  );
  
  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'slot_start_at', v_slot.start_at,
    'venue_id', v_slot.venue_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
```

### Cancel Booking Function

```sql
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_booking RECORD;
  v_slot_id UUID;
  v_hours_until NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get booking
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Check permission (user owns booking OR is venue admin OR platform admin)
  IF v_booking.diner_user_id != v_user_id THEN
    -- Check if user is venue admin for this venue or platform admin
    IF NOT EXISTS (
      SELECT 1 FROM profiles WHERE user_id = v_user_id 
      AND role IN ('platform_admin', 'venue_admin')
    ) THEN
      RAISE EXCEPTION 'Not authorized to cancel this booking';
    END IF;
  END IF;
  
  IF v_booking.status != 'active' THEN
    RAISE EXCEPTION 'Booking is not active';
  END IF;
  
  v_slot_id := v_booking.slot_id;
  
  -- Update booking
  UPDATE bookings
  SET status = 'cancelled', cancelled_at = NOW()
  WHERE id = p_booking_id;
  
  -- Reopen slot
  UPDATE slots
  SET status = 'available'
  WHERE id = v_slot_id;
  
  -- Trigger alert logic
  SELECT EXTRACT(EPOCH FROM (start_at - NOW())) / 3600 INTO v_hours_until
  FROM slots WHERE id = v_slot_id;
  
  IF v_hours_until <= 24 THEN
    -- Blast notification (handle in application)
    UPDATE slot_alerts
    SET status = 'notified', notified_at = NOW()
    WHERE slot_id = v_slot_id AND status = 'active';
  ELSE
    -- Start FIFO (handle in scheduled job)
    -- Do nothing here, let the job handle it
  END IF;
  
  -- Audit
  INSERT INTO audit_log (actor_user_id, action, object_type, object_id, metadata)
  VALUES (
    v_user_id,
    'cancel_booking',
    'booking',
    p_booking_id,
    json_build_object('reason', p_reason, 'slot_id', v_slot_id)
  );
  
  RETURN json_build_object('success', true);
END;
$$;
```

## 🔄 FIFO Queue Worker

Must run every 1-2 minutes:

```typescript
async function processFIFOQueue() {
  // 1. Find expired reservations
  const expiredReservations = await supabase
    .from('slots')
    .select('*')
    .eq('status', 'available')
    .not('reserved_until', 'is', null)
    .lt('reserved_until', new Date().toISOString())
  
  for (const slot of expiredReservations.data || []) {
    // Clear reservation
    await supabase
      .from('slots')
      .update({
        reserved_for_user_id: null,
        reserved_until: null
      })
      .eq('id', slot.id)
    
    // Mark current alert as expired
    await supabase
      .from('slot_alerts')
      .update({ status: 'expired' })
      .eq('slot_id', slot.id)
      .eq('status', 'notified')
    
    // Get next user in FIFO
    const nextAlert = await supabase
      .from('slot_alerts')
      .select('*')
      .eq('slot_id', slot.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    
    if (nextAlert.data) {
      // Reserve for next user (15 minutes)
      const reserveUntil = new Date(Date.now() + 15 * 60 * 1000)
      
      await supabase
        .from('slots')
        .update({
          reserved_for_user_id: nextAlert.data.diner_user_id,
          reserved_until: reserveUntil.toISOString()
        })
        .eq('id', slot.id)
      
      await supabase
        .from('slot_alerts')
        .update({ 
          status: 'notified',
          notified_at: new Date().toISOString()
        })
        .eq('id', nextAlert.data.id)
      
      // Send email notification
      await sendEmail({
        to: nextAlert.data.diner_user_id,
        subject: 'Your table is available!',
        template: 'slot_available',
        data: { slot }
      })
    }
  }
}
```

## 📧 Email Notifications

Implement email sending for:

1. **FIFO notification** (>24h slots)
2. **Blast notification** (<24h slots)
3. **Booking confirmation**
4. **Booking cancellation**

Use a service like SendGrid, Postmark, or Resend.

## ✅ Testing Your Implementation

```typescript
// Test 1: Free user books standard slot >24h
// Expected: Success

// Test 2: Free user books premium slot >24h
// Expected: Error - Premium required

// Test 3: Free user books premium slot <24h
// Expected: Success (24h cutover)

// Test 4: User at booking cap tries to book >24h
// Expected: Error - Limit reached

// Test 5: User at booking cap books <24h
// Expected: Success (24h cutover)

// Test 6: FIFO queue progression
// Expected: Users notified in order, 15min windows
```
