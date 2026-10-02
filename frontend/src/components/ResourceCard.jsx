// src/components/ResourceCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleUpvote, toggleBookmark, deleteResource, incrementDownload } from '../api/resources.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { timeAgo, TYPE_STYLES } from '../utils/format.js';

const ResourceCard = ({
  resource,
  onUpvoted,
  onBookmarkToggled,
  onDeleted,
  showSubject = false,
}) => {
  const { user }  = useAuth();
  const toast     = useToast();

  const [upvoted,     setUpvoted]     = useState(resource.hasUpvoted);
  const [count,       setCount]       = useState(resource.upvoteCount ?? 0);
  const [bookmarked,  setBookmarked]  = useState(resource.isBookmarked ?? false);
  const [downloads,   setDownloads]   = useState(resource.downloadCount ?? 0);
  const [busy,        setBusy]        = useState(false);
  const [bmBusy,      setBmBusy]      = useState(false);
  const [delBusy,     setDelBusy]     = useState(false);
  const [viewerOpen,  setViewerOpen]  = useState(false);

  const isOwner = user && String(user._id) === String(resource.uploadedBy?._id);
  const isAdmin = user?.isAdmin;

  // ── Upvote ────────────────────────────────────────────────────
  const handleUpvote = async () => {
    if (!user || busy) return;
    setBusy(true);
    const nextUpvoted = !upvoted;
    setUpvoted(nextUpvoted);
    setCount((c) => c + (nextUpvoted ? 1 : -1));
    try {
      const res = await toggleUpvote(resource._id);
      setUpvoted(res.upvoted);
      setCount(res.upvoteCount);
      onUpvoted?.(resource._id, res);
    } catch {
      setUpvoted(!nextUpvoted);
      setCount((c) => c + (nextUpvoted ? -1 : 1));
      toast.error('Failed to upvote');
    } finally {
      setBusy(false);
    }
  };

  // ── Bookmark ──────────────────────────────────────────────────
  const handleBookmark = async () => {
    if (!user || bmBusy) return;
    setBmBusy(true);
    const next = !bookmarked;
    setBookmarked(next);
    try {
      await toggleBookmark(resource._id);
      toast.success(next ? 'Saved to bookmarks' : 'Removed from bookmarks');
      onBookmarkToggled?.(resource._id, next);
    } catch {
      setBookmarked(!next);
      toast.error('Failed to update bookmark');
    } finally {
      setBmBusy(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
    setDelBusy(true);
    try {
      await deleteResource(resource._id);
      toast.success('Resource deleted');
      onDeleted?.(resource._id);
    } catch {
      toast.error('Failed to delete resource');
    } finally {
      setDelBusy(false);
    }
  };

  // ── Download ──────────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      const res = await incrementDownload(resource._id);
      setDownloads(res.downloadCount ?? downloads + 1);
    } catch { /* silent */ }
  };

  const isPdf = resource.fileFormat === 'pdf' || resource.fileUrl?.endsWith('.pdf');

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* ── Type badge + year ── */}
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`chip ${TYPE_STYLES[resource.type] ?? 'bg-slate-100 text-slate-600'}`}>
              {resource.type}
            </span>
            {resource.category && (
              <span className="chip bg-purple-100 text-purple-700">{resource.category}</span>
            )}
            {resource.year && (
              <span className="chip bg-slate-100 text-slate-600">{resource.year}</span>
            )}
          </div>

          {/* ── Title ── */}
          <h3 className="truncate text-sm font-semibold text-slate-900" title={resource.title}>
            {resource.title}
          </h3>

          {/* ── Subject ── */}
          {showSubject && resource.subject && (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {resource.subject.code} · {resource.subject.name}
            </p>
          )}

          {/* ── Tags ── */}
          {resource.tags?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {resource.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Meta ── */}
          <p className="mt-1.5 text-xs text-slate-500">
            {resource.uploadedBy?._id ? (
              <Link
                to={`/u/${resource.uploadedBy._id}`}
                className="font-medium text-slate-600 hover:text-brand-600 hover:underline"
              >
                {resource.uploadedBy.name}
              </Link>
            ) : 'Unknown'}{' '}
            · {timeAgo(resource.createdAt)}
            {downloads > 0 && <span className="ml-2">· {downloads} ⬇️</span>}
          </p>
        </div>

        {/* ── Upvote button ── */}
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

      {/* ── Action row ── */}
      <div className="mt-3 flex gap-2">
        {/* Open / download */}
        <a
          href={resource.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDownload}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
          </svg>
          Open
        </a>

        {/* In-app PDF viewer */}
        {isPdf && (
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            title="View PDF in app"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Bookmark */}
        {user && (
          <button
            type="button"
            onClick={handleBookmark}
            disabled={bmBusy}
            title={bookmarked ? 'Remove bookmark' : 'Save'}
            aria-pressed={bookmarked}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
              bookmarked
                ? 'border-amber-300 bg-amber-50 text-amber-600'
                : 'border-slate-200 text-slate-400 hover:border-amber-200 hover:text-amber-500'
            } disabled:opacity-60`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={bookmarked ? 0 : 1.5}>
              <path d="M5 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 18V4Z" />
            </svg>
          </button>
        )}

        {/* Delete (owner or admin) */}
        {(isOwner || isAdmin) && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={delBusy}
            title="Delete resource"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-red-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* ── In-app PDF viewer modal (Phase 4) ── */}
      {viewerOpen && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setViewerOpen(false); }}
        >
          <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="truncate text-sm font-semibold text-slate-800">{resource.title}</p>
              <button
                type="button"
                onClick={() => setViewerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <iframe
              src={`${resource.fileUrl}#toolbar=1`}
              title={resource.title}
              className="flex-1 w-full border-none"
              allow="fullscreen"
            />
          </div>
        </div>
      )}
    </article>
  );
};

export default ResourceCard;