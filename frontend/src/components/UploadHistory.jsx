// src/components/UploadHistory.jsx
import ResourceList from './ResourceList.jsx';

const UploadHistory = ({
  uploads = [],
  loading = false,
  emptyAction,
  onUpvoted,
  onDeleted,
}) => (
  <section>
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
      Upload history
    </h2>
    <ResourceList
      resources={uploads}
      loading={loading}
      showSubject
      emptyAction={emptyAction}
      onUpvoted={onUpvoted}
      onDeleted={onDeleted}
    />
  </section>
);

export default UploadHistory;