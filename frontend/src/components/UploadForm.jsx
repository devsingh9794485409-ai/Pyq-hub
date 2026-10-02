// src/components/UploadForm.jsx
import { useRef, useState } from 'react';
import { uploadResource } from '../api/resources.js';
import { getErrorMessage } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';

// Phase 5: All resource types from the roadmap
const TYPES = [
  'PYQ', 'Notes', 'Sessional', 'Syllabus',
  'Assignment', 'LabManual', 'QuestionBank',
  'ImportantQuestions', 'StudyMaterial', 'Other',
];

const CATEGORIES = ['', 'Mid-Sem', 'End-Sem', 'Class Test', 'Practical', 'Other'];

const MAX_MB = 20;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const UploadForm = ({ subject, onUploaded, onCancel }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    title: '', type: 'PYQ', year: '', category: '', tags: '', description: '',
  });
  const [file,        setFile]        = useState(null);
  const [dragging,    setDragging]    = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // ── File selection & validation ──────────────────────────────
  const applyFile = (f) => {
    setError('');
    if (!f) return setFile(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Only PDF, DOC/DOCX or image files are allowed');
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const handleFileInput = (e) => applyFile(e.target.files?.[0]);

  // ── Drag-and-drop (Phase 4) ──────────────────────────────────
  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const handleDragLeave = ()  => { setDragging(false); };
  const handleDrop      = (e) => {
    e.preventDefault();
    setDragging(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  // ── Form validation ──────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (form.title.trim().length < 4) errs.title = 'Title must be at least 4 characters';
    if (!file) errs.file = 'Please attach a PDF, DOC or image file';
    if (form.year) {
      const y = Number(form.year);
      if (!Number.isInteger(y) || y < 1990 || y > 2100) errs.year = 'Enter a valid year (1990–2100)';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    const fd = new FormData();
    fd.append('subject',     subject._id);
    fd.append('type',        form.type);
    fd.append('title',       form.title.trim());
    fd.append('description', form.description.trim());
    if (form.year)     fd.append('year',     form.year);
    if (form.category) fd.append('category', form.category);
    if (form.tags.trim()) {
      form.tags.split(',').forEach((t) => {
        const tag = t.trim();
        if (tag) fd.append('tags', tag);
      });
    }
    fd.append('file', file);

    setSubmitting(true);
    setProgress(0);
    try {
      const { resource } = await uploadResource(fd, setProgress);
      toast.success('Resource uploaded successfully!');
      onUploaded?.(resource);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isPdf = file?.type === 'application/pdf';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject context */}
      <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
        Uploading to <span className="font-semibold text-slate-800">{subject.code}</span> · {subject.name}
      </div>

      {/* Title */}
      <Input
        label="Title"
        placeholder="e.g. Data Structures End Sem 2023"
        value={form.title}
        onChange={set('title')}
        error={fieldErrors.title}
        maxLength={140}
        autoFocus
      />

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Description <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="Brief description of this resource…"
          value={form.description}
          onChange={set('description')}
          maxLength={500}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Type + Category row */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Type" as="select" value={form.type} onChange={set('type')}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Input>
        <Input label="Category (optional)" as="select" value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'None'}</option>)}
        </Input>
      </div>

      {/* Year + Tags row */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Year (optional)"
          type="number"
          inputMode="numeric"
          placeholder="2024"
          value={form.year}
          onChange={set('year')}
          error={fieldErrors.year}
          min={1990}
          max={2100}
        />
        <Input
          label="Tags (optional)"
          placeholder="math, calculus, unit1"
          value={form.tags}
          onChange={set('tags')}
        />
      </div>

      {/* Drag-and-drop file area (Phase 4) */}
      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">File</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          onChange={handleFileInput}
          className="hidden"
          id="upload-file-input"
        />
        <div
          role="button"
          tabIndex={0}
          aria-label="Click or drag to upload a file"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            dragging
              ? 'border-brand-400 bg-brand-50/60'
              : fieldErrors.file
                ? 'border-red-300 bg-red-50/50'
                : file
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/40'
          }`}
        >
          {file ? (
            <>
              <span className="text-2xl">{isPdf ? '📄' : '🖼️'}</span>
              <div>
                <p className="text-sm font-medium text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </>
          ) : (
            <>
              <svg className="h-8 w-8 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 1 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {dragging ? 'Drop to upload' : 'Drag & drop or click to choose'}
                </p>
                <p className="text-xs text-slate-400">PDF, DOC/DOCX or image · up to {MAX_MB} MB</p>
              </div>
            </>
          )}
        </div>
        {fieldErrors.file && (
          <span className="mt-1 block text-xs font-medium text-red-600">{fieldErrors.file}</span>
        )}
      </div>

      {/* Upload progress */}
      {submitting && progress > 0 && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-300"
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