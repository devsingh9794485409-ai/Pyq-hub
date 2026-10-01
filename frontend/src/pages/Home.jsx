import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchResources } from '../api/resources.js';
import { useApi } from '../hooks/useApi.js';
import ResourceList from '../components/ResourceList.jsx';
import { initials } from '../utils/format.js';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'AIML', 'DS'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const Home = () => {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || 'CSE');

  useEffect(() => {
    if (user?.branch) setSelectedBranch(user.branch);
  }, [user?.branch]);

  const activeBranch = user?.branch || selectedBranch;

  const { data, loading } = useApi(
    () => fetchResources({ branch: activeBranch, limit: 6, sort: 'recent' }),
    [activeBranch]
  );

  return (
    <div className="space-y-6">
      {user ? (
        <>
          {/* Welcome card for logged-in user */}
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

          {/* Mobile-only CTA */}
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
        </>
      ) : (
        /* Guest Hero */
        <section className="card overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-100">
                Open Academic Hub
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Previous Year Question Papers & Notes
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-brand-100">
                Browse exam papers, lecture notes, and sessional tests across all semesters. No login
                required to browse.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                to="/signup"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Guest Branch Selector */}
      {!user && (
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Branch: <span className="font-bold text-slate-800">{activeBranch}</span>
            </h2>
            <span className="text-xs text-slate-400">Select to change</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBranch(b)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeBranch === b
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Jump to semester grid */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Semesters for {activeBranch}
        </h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {SEMESTERS.map((s) => (
            <Link
              key={s}
              to={`/semester/${activeBranch}/${s}`}
              className={`grid h-14 place-items-center rounded-xl border text-sm font-semibold transition ${
                user && s === user.semester
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50'
              }`}
            >
              Sem {s}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent uploads */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recently uploaded in {activeBranch}
        </h2>
        <ResourceList
          resources={data?.resources ?? []}
          loading={loading}
          showSubject
          emptyAction={
            <Link
              to={`/semester/${activeBranch}/1`}
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