import { useCallback, useEffect, useState } from 'react';
import { getLatestReading } from './api';
import { useAuth } from './AuthContext';
import { READINGS_TABLE, supabase } from './supabase';
import { useSocket } from './useSocket';

const time = (r) => (r?.created_at ? new Date(r.created_at).getTime() : 0);

// Readings can arrive from several sources (and the Supabase sync replays old rows),
// so only ever move forward in time.
const newest = (current, next) => (next && time(next) >= time(current) ? next : current);

// Live INSERTs on the Supabase readings table (e.g. ESP32 writing straight to Supabase).
// No-op unless EXPO_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY are set.
function useSupabaseReadings(onReading) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase
      .from(READINGS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => active && data && onReading(data));

    const channel = supabase
      .channel(`realtime:${READINGS_TABLE}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: READINGS_TABLE }, (payload) =>
        onReading(payload.new)
      )
      .subscribe((status) => active && setConnected(status === 'SUBSCRIBED'));

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [onReading]);

  return connected;
}

// Loads the latest reading once, then keeps it live via the Django WebSocket and/or Supabase Realtime.
export function useSensors() {
  const { token } = useAuth();
  const [reading, setReading] = useState(null);
  const push = useCallback((r) => setReading((cur) => newest(cur, r)), []);

  useEffect(() => {
    if (token) getLatestReading(token).then(push).catch(() => {});
  }, [token, push]);

  const socketLive = useSocket(useCallback((msg) => {
    if (msg.type === 'reading') push(msg.reading);
  }, [push]));
  const supabaseLive = useSupabaseReadings(push);

  // reading: { ph, temperature, humidity, water_level, shade_net_active, source, device_id, created_at } | null
  return { reading, live: socketLive || supabaseLive };
}
