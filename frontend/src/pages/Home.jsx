// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchResources } from '../api/resources.js';
import { useApi } from '../hooks/useApi.js';
import ResourceList from '../components/ResourceList.jsx';
import { initials } from '../utils/format.js';

const BRANCHES  = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'AIML', 'DS'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const Home = () => {
  const { user, loading: authLoading } = useAuth();

  // Logged-in: show personalised feed for their branch
  // Guest: show latest uploads across all branches
  const { data, loading } = useApi(
    () => fetchResources(
      user
        ? { branch: user.branch, limit: 6, sort: 'recent' }
        : { limit: 6, sort: 'recent' }
    ),
    [user?.branch]
  );

  // While auth is restoring, show nothing (avoids flash)
  if (authLoading) return null;

  /* ── Logged-in view ─────────────────────────────────────────── */
  if (user) {
    return (
      <div className="space-y-6">
        {/* Welcome card */}
        <section className="card flex items-center gap-4 p-5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} className="h-14 w-14 rounded-2xl object-cover" />
              : initials(user.name)
            }
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-slate-900">
              Hey {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-500">{user.branch} · Semester {user.semester}</p>
          </div>
          <Link
            to={`/semester/${user.branch}/${user.semester}`}
            className="hidden shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:block"
          >
            My semester
          </Link>
        </section>

        {/* Mobile CTA */}
        <Link
          to={`/semester/${user.branch}/${user.semester}`}
          className="block rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-sm transition hover:shadow-md sm:hidden"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-brand-100">Continue where you left off</p>
          <p className="mt-1 text-lg font-bold">Semester {user.semester} · {user.branch}</p>
          <p className="mt-0.5 text-sm text-brand-100">Browse subjects →</p>
        </Link>

        {/* Semester grid */}
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
  }

  /* ── Guest / landing page view ──────────────────────────────── */
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center text-white shadow-lg">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-2xl font-bold">
          P
        </div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">PYQHub</h1>
        <p className="mt-2 text-brand-100 sm:text-lg">
          Browse & share college PYQs, Notes, and Study Material — all in one place.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            Get started free
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Browse by branch */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Browse by branch
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BRANCHES.map((b) => (
            <Link
              key={b}
              to={`/semester/${b}/1`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700"
            >
              {b}
              <svg className="h-4 w-4 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent uploads (public) */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recently uploaded
        </h2>
        <ResourceList
          resources={data?.resources ?? []}
          loading={loading}
          showSubject
          emptyAction={
            <Link to="/signup" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
              Sign up to upload
            </Link>
          }
        />
      </section>

      {/* Feature highlights */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: '📄', title: 'PYQs & Notes', desc: 'Find previous year papers, study notes and lab manuals for every subject.' },
          { icon: '🔖', title: 'Bookmark & Save', desc: 'Save resources you love and access them from any device.' },
          { icon: '⬆️', title: 'Upload & Share', desc: 'Contribute to your college community by uploading your own resources.' },
        ].map((f) => (
          <div key={f.title} className="card p-5">
            <div className="mb-3 text-3xl">{f.icon}</div>
            <h3 className="font-semibold text-slate-800">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;