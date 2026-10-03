import { useCallback, useEffect, useState } from 'react';
import { getLatestReading } from './api';
import { useAuth } from './AuthContext';
import { useSocket } from './useSocket';

// Loads the latest reading once, then keeps it live via the WebSocket.
export function useSensors() {
  const { token } = useAuth();
  const [reading, setReading] = useState(null);

  useEffect(() => {
    if (token) getLatestReading(token).then(setReading).catch(() => {});
  }, [token]);

  useSocket(useCallback((msg) => {
    if (msg.type === 'reading') setReading(msg.reading);
  }, []));

  return reading; // { ph, temperature, humidity, water_level, shade_net_active, created_at } | null
}
