// src/pages/Signup.jsx
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const BRANCHES  = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'AIML', 'DS'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// ── Google step-2 modal: pick branch & semester ──────────────────────────────
const GoogleProfileStep = ({ googleUser, onComplete, onCancel }) => {
  const [form, setForm]     = useState({ branch: 'CSE', semester: 1 });
  const [submitting, setSub] = useState(false);
  const [error, setError]   = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSub(true);
    try {
      await onComplete({ branch: form.branch, semester: Number(form.semester) });
    } catch (err) {
      setError(getErrorMessage(err));
      setSub(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="card w-full max-w-sm space-y-5 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          {googleUser?.photoURL && (
            <img
              src={googleUser.photoURL}
              alt=""
              className="h-10 w-10 rounded-full ring-2 ring-brand-200"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{googleUser?.displayName}</p>
            <p className="truncate text-xs text-slate-500">{googleUser?.email}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Almost there! Tell us a bit about your studies so we can show you the right content.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Branch" as="select" value={form.branch} onChange={set('branch')}>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Input>
            <Input label="Semester" as="select" value={form.semester} onChange={set('semester')}>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </Input>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={onCancel} disabled={submitting} type="button">
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={submitting}>
              Finish sign-up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Signup page ─────────────────────────────────────────────────────────
const Signup = () => {
  const { signup, googlePopup, googleLogin, user, loading: bootstrapping } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', branch: 'CSE', semester: 1 });
  const [error, setError]             = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [googleBusy, setGoogleBusy]   = useState(false);

  // Google step-2 state
  const [pendingGoogle, setPendingGoogle] = useState(null); // { idToken, googleUser }

  if (!bootstrapping && user) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // ── Email / password signup ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup({ ...form, semester: Number(form.semester) });
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Google signup step 1: open popup ────────────────────────
  const handleGoogle = async () => {
    setError('');
    setGoogleBusy(true);
    try {
      const { idToken, googleUser } = await googlePopup();
      const data = await googleLogin(idToken);
      if (data.code === 'PROFILE_INCOMPLETE') {
        // New Google user — need branch & semester
        setPendingGoogle({ idToken, googleUser });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(getErrorMessage(err));
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  // ── Google signup step 2: profile complete ───────────────────
  const handleGoogleProfileComplete = async ({ branch, semester }) => {
    await googleLogin(pendingGoogle.idToken, { branch, semester });
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Step-2 overlay for new Google users */}
      {pendingGoogle && (
        <GoogleProfileStep
          googleUser={pendingGoogle.googleUser}
          onComplete={handleGoogleProfileComplete}
          onCancel={() => setPendingGoogle(null)}
        />
      )}

      <div className="mx-auto max-w-sm pt-6">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Join your college's resource hub
          </p>
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
            <span className="text-xs text-slate-400">or sign up with email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* ── Email / password form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Aarav Sharma"
              value={form.name}
              onChange={set('name')}
              required
              minLength={2}
            />
            <Input
              label="College email"
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={set('email')}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Branch" as="select" value={form.branch} onChange={set('branch')}>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </Input>
              <Input label="Semester" as="select" value={form.semester} onChange={set('semester')}>
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </Input>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
            )}

            <Button type="submit" fullWidth size="lg" loading={submitting} disabled={googleBusy}>
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </>
  );
};

export default Signup;