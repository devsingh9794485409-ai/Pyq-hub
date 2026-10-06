// src/components/FilterBar.jsx
// Phase 5: All resource types + exam categories + sort options

const TYPES = [
  { value: '',                  label: 'All' },
  { value: 'PYQ',               label: 'PYQs' },
  { value: 'Notes',             label: 'Notes' },
  { value: 'Sessional',         label: 'Sessional' },
  { value: 'Syllabus',          label: 'Syllabus' },
  { value: 'Assignment',        label: 'Assignment' },
  { value: 'LabManual',         label: 'Lab Manual' },
  { value: 'QuestionBank',      label: 'Question Bank' },
  { value: 'ImportantQuestions',label: 'Important Qs' },
  { value: 'StudyMaterial',     label: 'Study Material' },
  { value: 'Other',             label: 'Other' },
];

const CATEGORIES = [
  { value: '',          label: 'Any Category' },
  { value: 'Mid-Sem',  label: 'Mid-Sem' },
  { value: 'End-Sem',  label: 'End-Sem' },
  { value: 'Class Test',label: 'Class Test' },
  { value: 'Practical', label: 'Practical' },
  { value: 'Other',     label: 'Other' },
];

const SORTS = [
  { value: 'recent',    label: 'Newest' },
  { value: 'top',       label: 'Most upvoted' },
  { value: 'downloads', label: 'Most downloaded' },
  { value: 'oldest',    label: 'Oldest' },
];

const FilterBar = ({
  type,       onTypeChange,
  category,   onCategoryChange,
  sort,       onSortChange,
  search,     onSearchChange,
}) => (
  <div className="space-y-3">
    {/* Search */}
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
      >
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.4 9.83l3.14 3.13a.75.75 0 1 0 1.06-1.06l-3.13-3.14A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
      </svg>
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search resources by title…"
        aria-label="Search resources by title"
        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
      />
      {search && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </div>

    {/* Type tabs — scrollable horizontal pill row */}
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onTypeChange(t.value)}
          aria-pressed={type === t.value}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            type === t.value
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>

    {/* Category + Sort row */}
    <div className="flex items-center gap-2">
      {onCategoryChange && (
        <select
          value={category ?? ''}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by exam category"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      )}

      <div className="ml-auto">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort resources"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default FilterBar;