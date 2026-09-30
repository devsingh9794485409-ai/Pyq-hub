// src/context/AuthContext.jsx

 /* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
// ...baaki sab same

import { TOKEN_KEY } from '../api/client.js';
import { loginRequest, meRequest, signupRequest } from '../api/auth.js';

const AuthContext = createContext(null);

// localStorage safe accessor — SSR / private mode me crash nahi hoga
const safeGetToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(safeGetToken);
  const [loading, setLoading] = useState(Boolean(safeGetToken()));

  // Ye flag ensure karega ki restore effect login ke baad user ko overwrite na kare
  const hasHydrated = useRef(false);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
  }, []);

  const applySession = useCallback(({ token: t, user: u }) => {
    if (t) {
      try {
        localStorage.setItem(TOKEN_KEY, t);
      } catch {
        /* ignore */
      }
    }
    setToken(t ?? null);
    setUser(u ?? null);
  }, []);

  // Page load pe session restore karo (sirf ek baar)
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const stored = safeGetToken();

      if (!stored) {
        if (!cancelled) setLoading(false);
        hasHydrated.current = true;
        return;
      }

      try {
        const { user: me } = await meRequest();
        // Agar is beech login/signup ho gaya ho, toh purana user mat set karo
        if (!cancelled && !hasHydrated.current) {
          setUser(me);
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) {
          setLoading(false);
          hasHydrated.current = true;
        }
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [logout]);

  // 401 aane pe auto logout
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('pyqhub:logout', handleLogout);
    return () => window.removeEventListener('pyqhub:logout', handleLogout);
  }, [logout]);

  const login = useCallback(
    async (credentials) => {
      const data = await loginRequest(credentials);
      hasHydrated.current = true;
      applySession(data);
      return data.user;
    },
    [applySession]
  );

  const signup = useCallback(
    async (payload) => {
      const data = await signupRequest(payload);
      hasHydrated.current = true;
      applySession(data);
      return data.user;
    },
    [applySession]
  );

  const refreshUser = useCallback(async () => {
    const { user: me } = await meRequest();
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      refreshUser,
      setUser,
    }),
    [user, token, loading, login, signup, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;