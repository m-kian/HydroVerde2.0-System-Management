import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getMe, loginUser, logoutUser, registerUser } from '../../src/lib/api';

const TOKEN_KEY = 'hydroverde_token';
const defaultAuthContext = {
  user: /** @type {{ id: number, name: string, email: string } | null} */ (null),
  token: /** @type {string | null} */ (null),
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext(defaultAuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          setUser(await getMe(saved));
          setToken(saved);
        }
      } catch (e) {
        // Token rejected -> clear it. Network error -> stay signed out for now.
        if (e.status === 401) await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startSession = async ({ token: t, user: u }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  };

  const signIn = async (credentials) => startSession(await loginUser(credentials));
  const signUp = async (details) => startSession(await registerUser(details));
  const signOut = async () => {
    try {
      if (token) await logoutUser(token);
    } catch {}
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
