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

  // Session version tracks in-flight restore calls vs fresh logins
  const sessionVersion = useRef(0);

  const logout = useCallback(() => {
    sessionVersion.current += 1;
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

  // Page load pe session restore karo
  useEffect(() => {
    let cancelled = false;
    const version = sessionVersion.current;

    const restore = async () => {
      const stored = safeGetToken();

      if (!stored) {
        if (!cancelled && sessionVersion.current === version) {
          setLoading(false);
        }
        return;
      }

      try {
        const { user: me } = await meRequest();
        if (!cancelled && sessionVersion.current === version) {
          setUser(me);
        }
      } catch {
        if (!cancelled && sessionVersion.current === version) {
          logout();
        }
      } finally {
        if (!cancelled && sessionVersion.current === version) {
          setLoading(false);
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
      sessionVersion.current += 1;
      const data = await loginRequest(credentials);
      applySession(data);
      return data.user;
    },
    [applySession]
  );

  const signup = useCallback(
    async (payload) => {
      sessionVersion.current += 1;
      const data = await signupRequest(payload);
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