// src/components/ResourceList.jsx
import ResourceCard from './ResourceCard.jsx';
import EmptyState from './ui/EmptyState.jsx';
import { SkeletonList } from './ui/Loader.jsx';

const ResourceList = ({
  resources = [],
  loading = false,
  showSubject = false,
  emptyAction,
  onUpvoted,
  onDeleted,
  onBookmarkToggled,
}) => {
  if (loading) return <SkeletonList count={4} />;

  if (!resources.length) {
    return (
      <EmptyState
        icon="🗂️"
        title="No resources here yet"
        description="Be the first to upload PYQs, notes or sessional papers for this subject."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-3">
      {resources.map((r) => (
        <ResourceCard
          key={r._id}
          resource={r}
          showSubject={showSubject}
          onUpvoted={onUpvoted}
          onDeleted={onDeleted}
          onBookmarkToggled={onBookmarkToggled}
        />
      ))}
    </div>
  );
};

export default ResourceList;