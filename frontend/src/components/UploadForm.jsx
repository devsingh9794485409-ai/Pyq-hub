// src/components/UploadForm.jsx
import { useRef, useState } from 'react';
import { uploadResource } from '../api/resources.js';
import { getErrorMessage } from '../api/client.js';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';

const TYPES = ['PYQ', 'Notes', 'Sessional'];
const MAX_MB = 15;

const UploadForm = ({ subject, onUploaded, onCancel }) => {
  const [form, setForm] = useState({ title: '', type: 'PYQ', year: '' });
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setError('');
    if (!f) return setFile(null);
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Max ${MAX_MB} MB.`);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const validate = () => {
    const errs = {};
    if (form.title.trim().length < 4) errs.title = 'Give it a clear title (min 4 characters)';
    if (!file) errs.file = 'Please attach a PDF, DOC or image file';
    if (form.year) {
      const y = Number(form.year);
      if (!Number.isInteger(y) || y < 1990 || y > 2100) errs.year = 'Enter a valid year';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    const fd = new FormData();
    fd.append('subject', subject._id);
    fd.append('type', form.type);
    fd.append('title', form.title.trim());
    if (form.year) fd.append('year', form.year);
    fd.append('file', file);

    setSubmitting(true);
    setProgress(0);
    try {
      const { resource } = await uploadResource(fd, setProgress);
      onUploaded?.(resource);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
        Uploading to <span className="font-semibold text-slate-800">{subject.code}</span> ·{' '}
        {subject.name}
      </div>

      <Input
        label="Title"
        placeholder="e.g. Data Structures End Sem 2023"
        value={form.title}
        onChange={set('title')}
        error={fieldErrors.title}
        maxLength={140}
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Type" as="select" value={form.type} onChange={set('type')}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Input>
        <Input
          label="Year (optional)"
          type="number"
          inputMode="numeric"
          placeholder="2023"
          value={form.year}
          onChange={set('year')}
          error={fieldErrors.year}
          min={1990}
          max={2100}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">File</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex w-full items-center gap-3 rounded-xl border-2 border-dashed px-4 py-5 text-left transition ${
            fieldErrors.file
              ? 'border-red-300 bg-red-50/50'
              : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/40'
          }`}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-brand-600 ring-1 ring-slate-200">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 1 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-800">
              {file ? file.name : 'Choose a file'}
            </span>
            <span className="block text-xs text-slate-500">
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : `PDF, DOC or image · up to ${MAX_MB} MB`}
            </span>
          </span>
        </button>
        {fieldErrors.file && (
          <span className="mt-1 block text-xs font-medium text-red-600">{fieldErrors.file}</span>
        )}
      </div>

      {submitting && progress > 0 && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">Uploading… {progress}%</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="secondary" fullWidth onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" fullWidth loading={submitting}>
          {submitting ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </form>
  );
};

export default UploadForm;