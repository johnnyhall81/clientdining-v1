# ClientDining v1 - Premium Dining Availability Platform

A private, login-only dining availability platform for City professionals to browse and book premium restaurants and private members' clubs.

## 🎯 Project Overview

ClientDining allows users to:
- Browse premium restaurants and private members' clubs
- View real availability
- Book tables subject to time- and tier-based rules
- Set alerts on unavailable slots

### Key Features

- **Two-tier subscription model**: Free and Premium (£49/month)
- **24-hour cutover rule**: All slots within 24 hours are bookable regardless of tier
- **Booking limits**: Free (3 future bookings), Premium (10 future bookings)
- **Smart alerts**: FIFO queue for >24h slots, blast notifications for <24h slots
- **Admin-curated venues**: Platform admins manage all venue profiles
- **Exactly 2 venue admins per venue** (enforced in database)

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Static export for GoDaddy hosting

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- GoDaddy hosting account

## 🚀 Getting Started

### 1. Clone and Install

\`\`\`bash
cd clientdining-v1
npm install
\`\`\`

### 2. Environment Setup

Create a \`.env.local\` file:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PREMIUM_PRICE_ID=your_stripe_price_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
\`\`\`

### 3. Database Setup

#### Apply the schema to your Supabase project:

1. Go to your Supabase project > SQL Editor
2. Copy and paste the complete schema from \`DATABASE_SCHEMA.sql\`
3. Execute the SQL

The schema includes:
- All tables with proper constraints
- Row Level Security (RLS) policies
- Triggers for business logic
- Helper functions

### 4. Stripe Setup

1. Create a Premium subscription product in Stripe (£49/month)
2. Copy the Price ID to your environment variables
3. Set up webhook endpoint: \`https://yourdomain.com/api/webhooks/stripe\`
4. Add webhook events: \`customer.subscription.created\`, \`customer.subscription.updated\`, \`customer.subscription.deleted\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Building for Production

### Static Export for GoDaddy

\`\`\`bash
# Build the static site
npm run build

# The output will be in the 'out' directory
\`\`\`

### Deploy to GoDaddy

1. Build the project: \`npm run build\`
2. Locate the \`out\` folder in your project directory
3. Upload the contents of the \`out\` folder to your GoDaddy hosting:
   - Via FTP/SFTP to your \`public_html\` or \`www\` directory
   - Via GoDaddy's File Manager
4. Ensure your domain points to the correct directory

⚠️ **Important**: Next.js API routes will NOT work with static export. You need to:
- Use Supabase Edge Functions for server-side logic, OR
- Deploy the API routes separately (e.g., Vercel, Railway), OR
- Migrate to a platform that supports Next.js fully (recommended: Vercel)

## 🔐 User Roles & Permissions

### Diners
- Free tier: Book standard tables, limited to 3 future bookings
- Premium tier (£49/mo): Book premium slots and clubs, up to 10 future bookings
- 24h rule: All users can book any available slot within 24 hours

### Venue Admins
- Exactly 2 per venue (database enforced)
- Can add/remove availability
- Can view and cancel bookings
- Cannot edit venue profiles or change tiering

### Platform Admins
- Full control over venues
- Set slot tiering
- Manage venue admins
- Override access rules

## 🎨 Project Structure

\`\`\`
clientdining-v1/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (diner)/         # Main diner interface
│   ├── (venue)/         # Venue admin interface
│   ├── (admin)/         # Platform admin interface
│   └── api/             # API routes (for non-static deployment)
├── components/          # Reusable UI components
├── lib/                 # Utilities and helpers
│   ├── supabase.ts     # Database client and types
│   ├── date-utils.ts   # Date formatting utilities
│   └── booking-rules.ts # Business logic
└── public/              # Static assets
\`\`\`

## 🔑 Key Business Rules

### 24-Hour Cutover Rule (CRITICAL)
If a slot starts within 24 hours:
- Ignores subscription tier
- Ignores booking caps
- Allows booking if slot is available

This rule **overrides all other rules**.

### Booking Limits
- Count only future bookings (start_at > now)
- Last-minute bookings (<24h) do NOT count toward limit
- Free: 3 future bookings
- Premium: 10 future bookings

### Alerts
- Any user can set alerts on any slot
- >24h before slot: FIFO queue with 15-minute reservation window
- ≤24h before slot: Email blast to all alert holders
- Alerts never override booking rules

### No Expiry Timers
- Slots do NOT expire automatically
- Slots remain visible until booked or manually removed
- Only time-based mechanism: FIFO reservation window (system-managed)

## 🛠️ Required Server-Side Jobs

A scheduled job must run every 1-2 minutes to:
1. Release expired FIFO reservations
2. Notify next user in queue
3. Handle alert state transitions

Implementation options:
- Vercel Cron (if using Vercel)
- Supabase Edge Functions + pg_cron
- External cron service hitting API endpoint

## 📊 Database Tables

Core tables:
- \`profiles\` - User profiles and tiers
- \`venues\` - Restaurant/club information
- \`venue_users\` - Venue admin accounts (max 2 per venue)
- \`slots\` - Available time slots
- \`bookings\` - User reservations
- \`slot_alerts\` - Alert subscriptions
- \`audit_log\` - All destructive actions
- \`venue_images\` - Venue photography

## 🚨 Known Limitations (Static Export)

When deployed as a static site:
- API routes won't work
- Server-side rendering won't work
- Need alternative for:
  - Authentication (use Supabase client-side auth)
  - Booking creation (use Supabase RPC)
  - Payment webhooks (need separate server)

**Recommended**: Deploy to Vercel for full Next.js functionality.

## 📝 Todo Before Launch

- [ ] Set up Supabase project and apply schema
- [ ] Configure Stripe subscription product
- [ ] Set up professional verification process
- [ ] Create initial venue data
- [ ] Set up email templates for alerts
- [ ] Configure scheduled job for FIFO queue
- [ ] Test all booking rules thoroughly
- [ ] Set up monitoring and error tracking

## 🤝 Support

For issues or questions, contact the platform admin.

## 📄 License

Proprietary - All rights reserved
# Cron configured
# Alert system with automated cron processing
