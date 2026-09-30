// src/components/ui/Input.jsx
const Input = ({ label, error, hint, className = '', as = 'input', ...props }) => {
  const Tag = as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input';

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      )}
      <Tag
        className={[
          'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900',
          'placeholder:text-slate-400 transition',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-300 focus:border-brand-500',
          as === 'textarea' ? 'min-h-24' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
};

export default Input;