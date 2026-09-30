// src/pages/Signup.jsx
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'AIML', 'DS'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const Signup = () => {
  const { signup, user, loading: bootstrapping } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: 'CSE',
    semester: 1,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!bootstrapping && user) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

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

  return (
    <div className="mx-auto max-w-sm pt-6">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Verified students only — use your college email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
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
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Input>
          <Input label="Semester" as="select" value={form.semester} onChange={set('semester')}>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </Input>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;