// src/components/ResourceCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleUpvote } from '../api/resources.js';
import { useAuth } from '../context/AuthContext.jsx';
import { timeAgo, TYPE_STYLES } from '../utils/format.js';

const ResourceCard = ({ resource, onUpvoted, showSubject = false }) => {
  const { user } = useAuth();
  const [upvoted, setUpvoted] = useState(resource.hasUpvoted);
  const [count, setCount] = useState(resource.upvoteCount ?? 0);
  const [busy, setBusy] = useState(false);

  const handleUpvote = async () => {
    if (!user || busy) return;
    setBusy(true);

    // Optimistic update
    const nextUpvoted = !upvoted;
    setUpvoted(nextUpvoted);
    setCount((c) => c + (nextUpvoted ? 1 : -1));

    try {
      const res = await toggleUpvote(resource._id);
      setUpvoted(res.upvoted);
      setCount(res.upvoteCount);
      onUpvoted?.(resource._id, res);
    } catch {
      // Rollback
      setUpvoted(!nextUpvoted);
      setCount((c) => c + (nextUpvoted ? -1 : 1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`chip ${TYPE_STYLES[resource.type] ?? 'bg-slate-100 text-slate-600'}`}
            >
              {resource.type}
            </span>
            {resource.year && (
              <span className="chip bg-slate-100 text-slate-600">{resource.year}</span>
            )}
          </div>

          <h3
            className="truncate text-sm font-semibold text-slate-900"
            title={resource.title}
          >
            {resource.title}
          </h3>

          {showSubject && resource.subject && (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {resource.subject.code} · {resource.subject.name}
            </p>
          )}

          <p className="mt-1.5 text-xs text-slate-500">
            {resource.uploadedBy?._id ? (
              <Link
                to={`/u/${resource.uploadedBy._id}`}
                className="font-medium text-slate-600 hover:text-brand-600 hover:underline"
              >
                {resource.uploadedBy.name}
              </Link>
            ) : (
              'Unknown'
            )}{' '}
            · {timeAgo(resource.createdAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleUpvote}
          disabled={!user || busy}
          aria-pressed={upvoted}
          aria-label={upvoted ? 'Remove upvote' : 'Upvote'}
          className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition ${
            upvoted
              ? 'border-brand-300 bg-brand-50 text-brand-700'
              : 'border-slate-200 text-slate-500 hover:border-brand-200 hover:bg-brand-50/50'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2.5 3.5 9.5h3.25v8h6.5v-8h3.25L10 2.5Z" />
          </svg>
          <span className="mt-0.5 text-xs font-bold tabular-nums">{count}</span>
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <a
          href={resource.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
          </svg>
          Open
        </a>
      </div>
    </article>
  );
};

export default ResourceCard;