// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../api/auth.js';
import { getErrorMessage } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const ForgotPassword = () => {
  const [email,       setEmail]       = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState('');
  const [devUrl,      setDevUrl]      = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await forgotPasswordRequest(email);
      setSubmitted(true);
      if (data.devResetUrl) setDevUrl(data.devResetUrl);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-sm pt-8 text-center">
        <div className="mb-4 mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-2xl">
          ✉️
        </div>
        <h1 className="text-xl font-bold text-slate-900">Check your email</h1>
        <p className="mt-2 text-sm text-slate-500">
          If an account exists for <strong>{email}</strong>, we've sent a password reset link.
        </p>
        {devUrl && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-left">
            <p className="text-xs font-semibold text-amber-700 mb-1">🔧 Dev mode — reset link:</p>
            <a href={devUrl} className="text-xs text-blue-600 underline break-all">{devUrl}</a>
          </div>
        )}
        <Link to="/login" className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm pt-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
          🔑
        </div>
        <h1 className="text-xl font-bold text-slate-900">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your email to receive a reset link.</p>
      </div>

      <div className="card space-y-4 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Send reset link
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Remember it?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
