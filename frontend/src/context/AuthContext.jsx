// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase.js';
import { TOKEN_KEY } from '../api/client.js';
import { loginRequest, meRequest, signupRequest, firebaseAuthRequest } from '../api/auth.js';

const AuthContext = createContext(null);

// Safe localStorage accessor — won't crash in SSR / private mode
const safeGetToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(safeGetToken);
  const [loading, setLoading] = useState(Boolean(safeGetToken()));

  // Prevents the restore effect from overwriting a freshly-logged-in user
  const hasHydrated = useRef(false);

  const logout = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setToken(null);
    setUser(null);
    // Also clear the Firebase session so Google popup shows account picker next time
    signOut(auth).catch(() => {});
  }, []);

  const applySession = useCallback(({ token: t, user: u }) => {
    if (t) {
      try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
    }
    setToken(t ?? null);
    setUser(u ?? null);
  }, []);

  // Restore session from localStorage on first load
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
        if (!cancelled && !hasHydrated.current) setUser(me);
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
    return () => { cancelled = true; };
  }, [logout]);

  // Auto-logout on 401
  useEffect(() => {
    const handle = () => logout();
    window.addEventListener('pyqhub:logout', handle);
    return () => window.removeEventListener('pyqhub:logout', handle);
  }, [logout]);

  // ── Email / password ──────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);
    hasHydrated.current = true;
    applySession(data);
    return data.user;
  }, [applySession]);

  const signup = useCallback(async (payload) => {
    const data = await signupRequest(payload);
    hasHydrated.current = true;
    applySession(data);
    return data.user;
  }, [applySession]);

  // ── Google OAuth via Firebase ─────────────────────────────────
  /**
   * Step 1 of Google sign-in: open the Google popup and get the Firebase ID token.
   * Returns { idToken, googleUser } so the caller can decide what to do next.
   * Does NOT touch our backend yet — that allows the UI to collect branch/semester
   * from new users before completing registration.
   */
  const googlePopup = useCallback(async () => {
    const result   = await signInWithPopup(auth, googleProvider);
    const idToken  = await result.user.getIdToken();
    return { idToken, googleUser: result.user };
  }, []);

  /**
   * Step 2: send the Firebase ID token to our backend.
   * `extra` may contain { branch, semester } for new-user registration.
   * Returns the full response data — check `data.code === 'PROFILE_INCOMPLETE'`
   * to know if branch/semester are still needed.
   */
  const googleLogin = useCallback(async (idToken, extra = {}) => {
    const data = await firebaseAuthRequest({ idToken, ...extra });
    if (data.success) {
      hasHydrated.current = true;
      applySession(data);
    }
    return data;
  }, [applySession]);

  const refreshUser = useCallback(async () => {
    const { user: me } = await meRequest();
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout, refreshUser, setUser, googlePopup, googleLogin, applySession }),
    [user, token, loading, login, signup, logout, refreshUser, googlePopup, googleLogin, applySession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;