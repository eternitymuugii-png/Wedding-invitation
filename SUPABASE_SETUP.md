# Supabase RSVP setup

1. Open the Supabase SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
2. In the Supabase dashboard, copy the project URL from **Integrations → Data API**.
3. Copy the **publishable key** from **Settings → API Keys**.
4. Replace the two placeholders in [`supabase-config.js`](supabase-config.js).

The website inserts into `public.wedding_rsvps`. Row Level Security permits
anonymous inserts only; visitors cannot select, update, or delete RSVP rows.

Never place a secret key or `service_role` key in browser code.
