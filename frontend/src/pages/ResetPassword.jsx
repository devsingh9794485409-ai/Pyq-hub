// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordRequest } from '../api/auth.js';
import { getErrorMessage, TOKEN_KEY } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { refreshUser } = useAuth();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [done,        setDone]        = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const data = await resetPasswordRequest({ email, token, newPassword });
      if (data.token) {
        // Store the new JWT so the user is instantly logged in
        try { localStorage.setItem(TOKEN_KEY, data.token); } catch { /* ignore */ }
        // Refresh user state in AuthContext
        await refreshUser().catch(() => {});
        setDone(true);
        setTimeout(() => navigate('/', { replace: true }), 1500);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Guard: invalid link
  if (!token || !email) {
    return (
      <div className="mx-auto max-w-sm pt-8 text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="text-xl font-bold text-slate-900">Invalid reset link</h1>
        <p className="mt-2 text-sm text-slate-500">
          This link is missing required information or has expired.
        </p>
        <Link
          to="/forgot-password"
          className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  // Success state
  if (done) {
    return (
      <div className="mx-auto max-w-sm pt-8 text-center">
        <div className="mb-4 text-4xl">✅</div>
        <h1 className="text-xl font-bold text-slate-900">Password updated!</h1>
        <p className="mt-2 text-sm text-slate-500">Redirecting you to the home page…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm pt-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-xl text-white">
          🔒
        </div>
        <h1 className="text-xl font-bold text-slate-900">Set a new password</h1>
        <p className="mt-1 text-sm text-slate-500">
          For <strong className="text-slate-700">{email}</strong>
        </p>
      </div>

      <div className="card space-y-4 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {/* Password match indicator */}
          {confirm && newPassword && (
            <p className={`-mt-2 text-xs font-medium ${newPassword === confirm ? 'text-emerald-600' : 'text-red-500'}`}>
              {newPassword === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Set new password
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
