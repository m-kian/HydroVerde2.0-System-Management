import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getUserById, loginUser, registerUser } from './db';

const SESSION_KEY = 'hydroverde_user_id';
const defaultAuthContext = {
  user: /** @type {{ id: number, name: string } | null} */ (null),
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext(defaultAuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const id = await SecureStore.getItemAsync(SESSION_KEY);
        if (id) setUser(await getUserById(Number(id)));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startSession = async (u) => {
    await SecureStore.setItemAsync(SESSION_KEY, String(u.id));
    setUser(u);
  };

  const signIn = async (credentials) => startSession(await loginUser(credentials));
  const signUp = async (details) => startSession(await registerUser(details));
  const signOut = async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
