// src/pages/Login.jsx
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const Login = () => {
  const { login, googlePopup, googleLogin, user, loading: bootstrapping } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [form, setForm]           = useState({ email: '', password: '' });
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  if (!bootstrapping && user) return <Navigate to={from} replace />;

  // ── Email / password login ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Google login ─────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('');
    setGoogleBusy(true);
    try {
      const { idToken } = await googlePopup();
      await googleLogin(idToken);
      navigate(from, { replace: true });
    } catch (err) {
      // user closed the popup → ignore; real errors → show message
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(getErrorMessage(err));
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm pt-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
          P
        </div>
        <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to browse and share resources</p>
      </div>

      <div className="card space-y-4 p-5">
        {/* ── Google button ── */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleBusy || submitting}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {googleBusy ? (
            <svg className="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            /* Google "G" logo */
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* ── Email / password form ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="College email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <div className="text-right -mt-1">
            <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={submitting} disabled={googleBusy}>
            Log in
          </Button>
        </form>

      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default Login;