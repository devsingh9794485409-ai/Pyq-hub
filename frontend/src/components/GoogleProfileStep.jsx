// src/components/GoogleProfileStep.jsx
/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { getErrorMessage } from '../api/client.js';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';

export const BRANCHES  = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'AIML', 'DS'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

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

export default GoogleProfileStep;
