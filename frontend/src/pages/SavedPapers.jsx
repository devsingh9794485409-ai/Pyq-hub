// src/pages/SavedPapers.jsx
import { useCallback } from 'react';
import { fetchMyBookmarks } from '../api/users.js';
import { useApi } from '../hooks/useApi.js';
import ResourceCard from '../components/ResourceCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { FullPageLoader } from '../components/ui/Loader.jsx';

const SavedPapers = () => {
  const { data, loading, error, refetch, setData } = useApi(fetchMyBookmarks, []);

  // Optimistic bookmark removal when user un-bookmarks from this page
  const handleBookmarkToggled = useCallback((id, isBookmarked) => {
    if (!isBookmarked) {
      // Resource was un-bookmarked — remove it from the list
      setData((prev) =>
        prev
          ? { ...prev, resources: prev.resources.filter((r) => String(r._id) !== String(id)) }
          : prev
      );
    }
  }, [setData]);

  const handleUpvoted = useCallback((id, res) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            resources: prev.resources.map((r) =>
              String(r._id) === String(id)
                ? { ...r, upvoteCount: res.upvoteCount, hasUpvoted: res.upvoted }
                : r
            ),
          }
        : prev
    );
  }, [setData]);

  if (loading) return <FullPageLoader label="Loading saved papers…" />;

  const savedResources = data?.resources ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Saved Papers</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {savedResources.length} saved resource{savedResources.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && savedResources.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No saved papers yet"
          description="Bookmark resources on any subject page to save them here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {savedResources.map((r) => (
            <ResourceCard
              key={r._id}
              resource={r}
              showSubject
              onUpvoted={handleUpvoted}
              onBookmarkToggled={handleBookmarkToggled}
              onDeleted={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPapers;
