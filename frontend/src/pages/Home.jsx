// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchResources } from '../api/resources.js';
import { useApi } from '../hooks/useApi.js';
import ResourceList from '../components/ResourceList.jsx';
import { initials } from '../utils/format.js';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const Home = () => {
  const { user } = useAuth();

  const { data, loading } = useApi(
    () => fetchResources({ branch: user.branch, limit: 5, sort: 'recent' }),
    [user.branch]
  );

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <section className="card flex items-center gap-4 p-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700">
          {initials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-900">
            Hey {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500">
            {user.branch} · Semester {user.semester}
          </p>
        </div>
        <Link
          to={`/semester/${user.branch}/${user.semester}`}
          className="hidden shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:block"
        >
          My semester
        </Link>
      </section>

      {/* Mobile-only big CTA */}
      <Link
        to={`/semester/${user.branch}/${user.semester}`}
        className="block rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-sm transition hover:shadow-md sm:hidden"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-brand-100">
          Continue where you left off
        </p>
        <p className="mt-1 text-lg font-bold">
          Semester {user.semester} · {user.branch}
        </p>
        <p className="mt-0.5 text-sm text-brand-100">Browse subjects →</p>
      </Link>

      {/* Jump to semester grid */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Jump to a semester
        </h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {SEMESTERS.map((s) => (
            <Link
              key={s}
              to={`/semester/${user.branch}/${s}`}
              className={`grid h-14 place-items-center rounded-xl border text-sm font-semibold transition ${
                s === user.semester
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent uploads */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recently uploaded in {user.branch}
        </h2>
        <ResourceList
          resources={data?.resources ?? []}
          loading={loading}
          showSubject
          emptyAction={
            <Link
              to={`/semester/${user.branch}/${user.semester}`}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Browse subjects
            </Link>
          }
        />
      </section>
    </div>
  );
};

export default Home;