// src/context/ToastContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
    const id = ++nextId;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // max 5 toasts

    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((msg, opts) => toast(msg, { type: 'success', ...opts }), [toast]);
  const error   = useCallback((msg, opts) => toast(msg, { type: 'error',   ...opts }), [toast]);
  const info    = useCallback((msg, opts) => toast(msg, { type: 'info',    ...opts }), [toast]);
  const warning = useCallback((msg, opts) => toast(msg, { type: 'warning', ...opts }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ICONS = {
  success: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  ),
};

const TYPE_CLASSES = {
  success: 'bg-emerald-50  border-emerald-200 text-emerald-800',
  error:   'bg-red-50      border-red-200      text-red-800',
  warning: 'bg-amber-50   border-amber-200     text-amber-800',
  info:    'bg-blue-50     border-blue-200      text-blue-800',
};

const ToastContainer = ({ toasts, dismiss }) => {
  if (!toasts.length) return null;
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium shadow-lg transition-all animate-in slide-in-from-right-5 ${TYPE_CLASSES[t.type] ?? TYPE_CLASSES.info}`}
        >
          {ICONS[t.type]}
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="ml-1 shrink-0 opacity-60 hover:opacity-100"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

export default ToastContext;
