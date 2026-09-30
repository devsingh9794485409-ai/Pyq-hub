// src/pages/SubjectPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSubject } from '../api/subjects.js';
import { fetchResources } from '../api/resources.js';
import FilterBar from '../components/FilterBar.jsx';
import ResourceList from '../components/ResourceList.jsx';
import UploadForm from '../components/UploadForm.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const SubjectPage = () => {
  const { subjectId } = useParams();
  const {  refreshUser } = useAuth();

  const [type, setType] = useState('');
  // Persist the user's preferred sort order across page navigations.
  const [sort, setSort] = useLocalStorage('pyqhub:sort', 'recent');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: subjectData, loading: subjectLoading } = useApi(
    () => fetchSubject(subjectId),
    [subjectId]
  );

  const {
    data: resourceData,
    loading: resourcesLoading,
    error: resourcesError,
    refetch,
    setData,
  } = useApi(
    () =>
      fetchResources({
        subject: subjectId,
        ...(type ? { type } : {}),
        ...(debouncedSearch ? { q: debouncedSearch } : {}),
        sort,
        limit: 50,
      }),
    [subjectId, type, sort, debouncedSearch]
  );

  const subject = subjectData?.subject;
  const resources = useMemo(() => resourceData?.resources ?? [], [resourceData]);

  const handleUploaded = useCallback(
    (resource) => {
      setUploadOpen(false);
      setData((prev) => ({
        ...(prev ?? { total: 1 }),
        total: (prev?.total ?? 0) + 1,
        resources: [resource, ...(prev?.resources ?? [])],
      }));
      refreshUser().catch(() => {});
    },
    [setData, refreshUser]
  );

  const handleUpvoted = useCallback(
    (id, res) => {
      setData((prev) =>
        prev
          ? {
              ...prev,
              resources: prev.resources.map((r) =>
                r._id === id
                  ? { ...r, upvoteCount: res.upvoteCount, hasUpvoted: res.upvoted }
                  : r
              ),
            }
          : prev
      );
    },
    [setData]
  );

  if (subjectLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-1/2" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-10 w-full" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-600">Subject not found.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-brand-600">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-brand-600">
          Home
        </Link>
        <span>/</span>
        <Link
          to={`/semester/${subject.branch}/${subject.semester}`}
          className="hover:text-brand-600"
        >
          {subject.branch} · Sem {subject.semester}
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">{subject.code}</span>
      </nav>

      {/* Header */}
      <header className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
              {subject.code}
            </span>
            <h1 className="mt-2 text-xl font-bold leading-snug text-slate-900">
              {subject.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
              {type && ` · filtered by ${type}`}
            </p>
          </div>

          <Button onClick={() => setUploadOpen(true)} className="shrink-0">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Upload
          </Button>
        </div>
      </header>

      <FilterBar
        type={type}
        onTypeChange={setType}
        sort={sort}
        onSortChange={setSort}
        search={search}
        onSearchChange={setSearch}
      />

      {resourcesError && (
        <div className="card flex items-center justify-between gap-3 p-4">
          <p className="text-sm text-red-700">{resourcesError}</p>
          <Button size="sm" variant="secondary" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      <ResourceList
        resources={resources}
        loading={resourcesLoading}
        onUpvoted={handleUpvoted}
        emptyAction={
          <Button onClick={() => setUploadOpen(true)}>
            {debouncedSearch || type ? 'Upload something' : 'Upload the first one'}
          </Button>
        }
      />

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload a resource">
        <UploadForm
          subject={subject}
          onUploaded={handleUploaded}
          onCancel={() => setUploadOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default SubjectPage;