// src/components/AdminUploadModal.jsx
import { useEffect, useRef, useState } from 'react';
import { uploadResource } from '../api/resources.js';
import { fetchSubjects } from '../api/subjects.js';
import { getErrorMessage } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'AIML', 'DS'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const PRIMARY_TYPES = [
  { value: 'Syllabus', label: '📜 Syllabus' },
  { value: 'PYQ', label: '📄 Previous Year Paper (PYQ)' },
  { value: 'Notes', label: '📝 Lecture / Unit Notes' },
  { value: 'QuestionBank', label: '📚 Question Bank' },
  { value: 'LabManual', label: '🔬 Lab Manual' },
  { value: 'ImportantQuestions', label: '⭐ Important Questions' },
  { value: 'StudyMaterial', label: '📖 General Study Material' },
];

const EXAM_CATEGORIES = ['', 'End-Sem', 'Mid-Sem', 'Class Test', 'Practical', 'Other'];
const MAX_MB = 50;
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const AdminUploadModal = ({ open, onClose, onUploaded }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [form, setForm] = useState({
    type: 'Syllabus',
    title: '',
    year: new Date().getFullYear(),
    category: '',
    tags: '',
    description: '',
  });

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch subjects whenever branch or semester changes
  useEffect(() => {
    let active = true;
    setLoadingSubjects(true);
    fetchSubjects(branch, semester)
      .then((data) => {
        if (!active) return;
        const list = data?.subjects ?? [];
        setSubjects(list);
        if (list.length > 0) {
          setSelectedSubjectId(list[0]._id);
        } else {
          setSelectedSubjectId('');
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to load subjects:', err);
        setSubjects([]);
      })
      .finally(() => {
        if (active) setLoadingSubjects(false);
      });

    return () => {
      active = false;
    };
  }, [branch, semester]);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const applyFile = (f) => {
    setError('');
    if (!f) return setFile(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Only PDF, DOC/DOCX, or image files are allowed');
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File exceeds max limit of ${MAX_MB} MB`);
      return;
    }
    setFile(f);

    // Auto-fill title if user hasn't typed one
    if (!form.title.trim() && f.name) {
      const cleanBase = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      setForm((prev) => ({ ...prev, title: cleanBase.slice(0, 100) }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  const validate = () => {
    const errs = {};
    if (!selectedSubjectId) errs.subject = 'Please select a subject';
    if (!form.title.trim() || form.title.trim().length < 4) {
      errs.title = 'Title must be at least 4 characters';
    }
    if (!file) errs.file = 'A genuine document file is required';
    if (form.year) {
      const y = Number(form.year);
      if (!Number.isInteger(y) || y < 1990 || y > 2100) {
        errs.year = 'Enter a valid year (1990–2100)';
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    const fd = new FormData();
    fd.append('subject', selectedSubjectId);
    fd.append('type', form.type);
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    if (form.year) fd.append('year', form.year);
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
      toast.success('Study material published successfully!');
      onUploaded?.(resource);
      onClose();
      // Reset form
      setFile(null);
      setForm({
        type: 'Syllabus',
        title: '',
        year: new Date().getFullYear(),
        category: '',
        tags: '',
        description: '',
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload Verified Study Material">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* ── Branch & Semester Pickers ───────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            as="select"
            label="Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </Input>

          <Input
            as="select"
            label="Semester"
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </Input>
        </div>

        {/* ── Subject Picker ─────────────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Subject {loadingSubjects && <span className="text-xs text-slate-400 font-normal">(Loading...)</span>}
          </label>
          {subjects.length === 0 && !loadingSubjects ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
              No subjects found for {branch} Semester {semester}. Run the seeder to populate.
            </p>
          ) : (
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={loadingSubjects || subjects.length === 0}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} — {sub.name}
                </option>
              ))}
            </select>
          )}
          {fieldErrors.subject && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.subject}</p>
          )}
        </div>

        {/* ── Material Type & Category ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            as="select"
            label="Material Type"
            value={form.type}
            onChange={setField('type')}
          >
            {PRIMARY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Input>

          <Input
            as="select"
            label="Exam Category (Optional)"
            value={form.category}
            onChange={setField('category')}
          >
            {EXAM_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || 'None / Not applicable'}</option>
            ))}
          </Input>
        </div>

        {/* ── Title & Year ────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Resource Title"
              placeholder="e.g. 2023 End-Sem Question Paper (Solved)"
              value={form.title}
              onChange={setField('title')}
              error={fieldErrors.title}
              maxLength={140}
            />
          </div>
          <div>
            <Input
              type="number"
              label="Year (Optional)"
              placeholder="2024"
              value={form.year}
              onChange={setField('year')}
              error={fieldErrors.year}
              min={1990}
              max={2100}
            />
          </div>
        </div>

        {/* ── Description ─────────────────────────────────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description / Context <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={setField('description')}
            placeholder="e.g. Official AKTU university syllabus / Handwritten unit 1 notes with numericals"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
            maxLength={500}
          />
        </div>

        {/* ── File Dropzone ────────────────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Attach Document File <span className="text-xs text-slate-400 font-normal">(PDF, DOC, Images up to {MAX_MB}MB)</span>
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition ${
              dragging
                ? 'border-brand-500 bg-brand-50'
                : file
                ? 'border-brand-300 bg-brand-50/30'
                : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={(e) => applyFile(e.target.files?.[0])}
            />

            {file ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div className="text-left">
                  <p className="max-w-[260px] truncate text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <span className="text-2xl">📎</span>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  Click to select file or drag & drop here
                </p>
                <p className="text-[11px] text-slate-400">PDFs preferred for study materials</p>
              </div>
            )}
          </div>
          {fieldErrors.file && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.file}</p>
          )}
        </div>

        {/* ── Progress Bar ────────────────────────────────────────────── */}
        {submitting && progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Uploading to Cloudinary…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-brand-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !file}>
            {submitting ? 'Uploading…' : 'Publish Material'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminUploadModal;
