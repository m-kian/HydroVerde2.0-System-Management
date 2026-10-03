import { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

// Derive ws:// URL from the same env var used for the REST API.
const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';
const WS_URL = API.replace(/^http/, 'ws').replace(/\/api\/?$/, '/ws/');

// Connects while signed in, auto-reconnects, calls onMessage(obj) for each server message.
export function useSocket(onMessage) {
  const { token } = useAuth();
  const handler = useRef(onMessage);
  handler.current = onMessage;

  useEffect(() => {
    if (!token) return;
    let ws;
    let retry;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(`${WS_URL}?token=${token}`);
      ws.onmessage = (e) => {
        try { handler.current?.(JSON.parse(e.data)); } catch {}
      };
      ws.onclose = (e) => {
        if (!closed && e.code !== 4401) retry = setTimeout(connect, 3000);
      };
    };
    connect();

    return () => {
      closed = true;
      clearTimeout(retry);
      ws?.close();
    };
  }, [token]);
}
