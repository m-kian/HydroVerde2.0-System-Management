import { createClient } from '@supabase/supabase-js';

// Optional: only used to receive live sensor readings via Supabase Realtime.
// Auth stays with the Django backend, so no Supabase session is stored.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const READINGS_TABLE = process.env.EXPO_PUBLIC_SUPABASE_READINGS_TABLE ?? 'sensors_reading';

export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : null;
