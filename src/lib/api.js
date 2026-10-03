// Replaces db.js. Talks to the Django backend.
// Set EXPO_PUBLIC_API_URL in .env, e.g. http://192.168.1.10:8000/api
// (Android emulator: http://10.0.2.2:8000/api — physical phone: your PC's LAN IP)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';

function firstError(data) {
  if (!data) return 'Something went wrong.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const v = Object.values(data)[0];
  return Array.isArray(v) ? v[0] : String(v);
}

async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection.');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(firstError(data));
    err.status = res.status;
    throw err;
  }
  return data;
}

export const registerUser = (details) => request('/auth/register/', { method: 'POST', body: details });
export const loginUser = (credentials) => request('/auth/login/', { method: 'POST', body: credentials });
export const getMe = (token) => request('/auth/me/', { token });
export const logoutUser = (token) => request('/auth/logout/', { method: 'POST', token });

export const getLatestReading = (token) => request('/readings/latest/', { token });
export const getReadingHistory = (token, limit = 100) => request(`/readings/?limit=${limit}`, { token });
