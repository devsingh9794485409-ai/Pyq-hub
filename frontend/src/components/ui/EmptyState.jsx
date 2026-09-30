// src/components/ui/EmptyState.jsx
const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
    <div className="mb-3 text-4xl" aria-hidden="true">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;