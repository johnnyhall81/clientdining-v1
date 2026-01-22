# GoDaddy Deployment Guide for ClientDining

## ⚠️ Important Limitations

**Static Export Limitations**: Next.js static export does NOT support:
- API routes
- Server-side rendering (SSR)
- Incremental Static Regeneration (ISR)
- Dynamic routes at runtime
- Middleware

This means you'll need alternative solutions for server-side functionality.

## 🎯 Recommended Architecture for GoDaddy

### Option 1: Hybrid Approach (Recommended)
- **Frontend**: Deploy static Next.js site to GoDaddy
- **Backend API**: Deploy to Vercel/Railway/Render (free tiers available)
- **Database**: Supabase (handles auth + data)

### Option 2: Supabase-First Approach
- **Frontend**: Deploy static site to GoDaddy
- **Backend Logic**: Use Supabase Edge Functions + RPC
- **Database**: Supabase

## 📦 Building for GoDaddy

### Step 1: Prepare the Build

```bash
# Install dependencies
npm install

# Build the static export
npm run build

# The 'out' folder contains your static site
```

### Step 2: Upload to GoDaddy

#### Via FTP/SFTP:
1. Connect to your GoDaddy hosting via FTP client (FileZilla, etc.)
   - Host: Your domain or FTP address from GoDaddy
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (FTP) or 22 (SFTP)

2. Navigate to your web root directory:
   - Usually `public_html` or `www`

3. Upload ALL contents of the `out` folder to your web root

4. Ensure file permissions are correct (usually 644 for files, 755 for directories)

#### Via GoDaddy File Manager:
1. Log into GoDaddy hosting control panel
2. Navigate to File Manager
3. Go to `public_html` directory
4. Upload all files from the `out` folder
5. Extract if uploaded as ZIP

### Step 3: Configure Domain

1. Ensure your domain points to the correct directory
2. In GoDaddy hosting settings, set the web root to where you uploaded files
3. Wait for DNS propagation (up to 48 hours, usually much faster)

## 🔧 Handling Server-Side Features

### Authentication (Supabase)
Use Supabase client-side auth - already configured in the code.

```typescript
// This works in static export
import { supabase } from '@/lib/supabase'

await supabase.auth.signIn({ email, password })
```

### Booking Creation
Use Supabase RPC (Remote Procedure Calls):

```sql
-- Create this function in Supabase SQL Editor
CREATE OR REPLACE FUNCTION book_slot(
  p_slot_id UUID,
  p_party_size INT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_booking_id UUID;
  v_eligibility JSON;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Business logic here
  -- Check eligibility, create booking, etc.
  
  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_id
  );
END;
$$;
```

Then call from frontend:
```typescript
const { data, error } = await supabase.rpc('book_slot', {
  p_slot_id: slotId,
  p_party_size: partySize,
  p_notes: notes
})
```

### Stripe Webhooks
You MUST deploy webhook handler separately:

**Option A: Use Vercel (recommended)**
1. Create a Vercel account (free)
2. Deploy just the API routes to Vercel
3. Point Stripe webhooks to Vercel URL

**Option B: Use Supabase Edge Functions**
```typescript
// Create edge function for webhooks
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0'

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
  
  // Handle webhook
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
    
    // Handle event
    // Update subscription status in database
    
    return new Response(JSON.stringify({ received: true }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})
```

## 📝 Environment Variables

Since you can't use `.env` files in static export, you have two options:

### Option 1: Build-time Environment Variables
Set them when building:
```bash
NEXT_PUBLIC_SUPABASE_URL=xxx npm run build
```

### Option 2: Runtime Configuration
Create a config file that loads at runtime:
```typescript
// public/config.js
window.ENV = {
  SUPABASE_URL: 'your_url',
  SUPABASE_ANON_KEY: 'your_key',
  // Only public keys here!
}
```

Load in your app:
```typescript
const config = (window as any).ENV
```

⚠️ **NEVER** expose secret keys in frontend code!

## 🔄 Update Process

When you need to update the site:

1. Make changes to your code
2. Build: `npm run build`
3. Upload new `out` folder to GoDaddy
4. Clear browser cache to see changes

## ✅ Testing Checklist

Before going live:

- [ ] Test on GoDaddy staging subdomain first
- [ ] Verify all static pages load correctly
- [ ] Test Supabase authentication
- [ ] Verify database queries work
- [ ] Test booking flow with Supabase RPC
- [ ] Confirm Stripe webhooks hit your separate endpoint
- [ ] Check mobile responsiveness
- [ ] Test in multiple browsers
- [ ] Verify SSL certificate is active

## 🐛 Common Issues

### Issue: Pages return 404
**Solution**: Ensure `trailingSlash: true` in `next.config.js` and all files are uploaded correctly.

### Issue: API routes don't work
**Solution**: API routes DON'T work in static export. Use Supabase RPC or deploy APIs separately.

### Issue: Images not loading
**Solution**: Check that `images.unoptimized: true` is in `next.config.js`

### Issue: Environment variables not working
**Solution**: Use build-time variables (NEXT_PUBLIC_*) or runtime config file

## 🎓 Recommended Learning Path

If this is your first deployment:

1. Deploy to Vercel first (easiest, full Next.js support)
2. Once working, export static version for GoDaddy
3. Keep complex server logic on Vercel/Supabase
4. Use GoDaddy only for static frontend

## 📞 Support Resources

- GoDaddy Support: https://www.godaddy.com/help
- Supabase Docs: https://supabase.com/docs
- Next.js Static Export: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
