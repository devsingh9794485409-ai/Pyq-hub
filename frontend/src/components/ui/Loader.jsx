// src/components/ui/Loader.jsx
const Loader = ({ className = 'h-6 w-6' }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block animate-spin rounded-full border-2 border-brand-500 border-t-transparent ${className}`}
  />
);

export const FullPageLoader = ({ label = 'Loading…' }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
    <Loader className="h-8 w-8" />
    <p className="text-sm">{label}</p>
  </div>
);

export const SkeletonList = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-4">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton mt-3 h-3 w-1/3" />
        <div className="skeleton mt-4 h-9 w-full" />
      </div>
    ))}
  </div>
);

export default Loader;