// src/pages/SemesterPage.jsx
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchSubjects } from '../api/subjects.js';
import { useApi } from '../hooks/useApi.js';
import SubjectGrid from '../components/SubjectGrid.jsx';

const SemesterPage = () => {
  const { branch, semester } = useParams();
  const { user } = useAuth();
  const sem = Number(semester);

  const { data: subjectData, loading: subjectsLoading } = useApi(
    () => fetchSubjects(branch, sem),
    [branch, sem]
  );

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-brand-600">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">{branch}</span>
        <span>/</span>
        <span className="font-medium text-slate-700">Semester {sem}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Semester {sem} · {branch}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {subjectData?.count ?? 0} subjects · pick one to see PYQs and notes
          </p>
        </div>

        {user?.branch === branch && user?.semester !== sem && (
          <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-200">
            Not your current semester
          </span>
        )}
      </header>

      {/* Grid */}
      {subjectsLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="skeleton h-5 w-16" />
              <div className="skeleton mt-3 h-4 w-full" />
              <div className="skeleton mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <SubjectGrid subjects={subjectData?.subjects ?? []} />
      )}
    </div>
  );
};

export default SemesterPage;