// src/pages/AdminPanel.jsx
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchAdminDashboard,
  fetchAdminUsers,
  deleteAdminUser,
  setAdminRole,
  fetchAdminResources,
  deleteAdminResource,
} from '../api/admin.js';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/ui/Button.jsx';
import { FullPageLoader } from '../components/ui/Loader.jsx';

const StatCard = ({ label, value, emoji }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{value ?? '—'}</p>
      </div>
      <span className="text-3xl">{emoji}</span>
    </div>
  </div>
);

const TAB_LABELS = ['Dashboard', 'Users', 'Resources'];

const AdminPanel = () => {
  const { user } = useAuth();
  const toast    = useToast();
  const [tab, setTab] = useState(0);

  if (!user?.isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-500">Manage PYQHub platform</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {TAB_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === i ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 0 && <DashboardTab />}
      {tab === 1 && <UsersTab toast={toast} />}
      {tab === 2 && <ResourcesTab toast={toast} />}
    </div>
  );
};

const DashboardTab = () => {
  const { data, loading } = useApi(fetchAdminDashboard, []);
  if (loading) return <FullPageLoader label="Loading dashboard…" />;
  const { stats, recentResources, recentUsers } = data ?? {};

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users"     value={stats?.totalUsers}     emoji="👥" />
        <StatCard label="Total Resources" value={stats?.totalResources} emoji="📄" />
        <StatCard label="Total Subjects"  value={stats?.totalSubjects}  emoji="📚" />
        <StatCard label="Total Downloads" value={stats?.totalDownloads} emoji="⬇️" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent Users</h2>
          <div className="space-y-2">
            {recentUsers?.map((u) => (
              <div key={u._id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <span className="text-xs text-slate-400">{u.branch} · Sem {u.semester}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent Resources</h2>
          <div className="space-y-2">
            {recentResources?.map((r) => (
              <div key={r._id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-800 truncate max-w-[180px]">{r.title}</p>
                  <p className="text-xs text-slate-400">{r.type} · {r.subject?.code}</p>
                </div>
                <span className="text-xs text-slate-400">{r.downloadCount ?? 0} ⬇️</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersTab = ({ toast }) => {
  const [q, setQ] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const { data, loading, refetch } = useApi(() => fetchAdminUsers({ q: searchQ, limit: 50 }), [searchQ]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(id);
      toast.success(`User ${name} deleted`);
      refetch();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleAdmin = async (id, current) => {
    try {
      await setAdminRole(id, !current);
      toast.success(`Admin role ${!current ? 'granted' : 'revoked'}`);
      refetch();
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => { e.preventDefault(); setSearchQ(q); }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <Button type="submit" size="sm">Search</Button>
      </form>

      {loading && <FullPageLoader label="Loading users…" />}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2.5 text-left">Name</th>
              <th className="px-4 py-2.5 text-left">Branch / Sem</th>
              <th className="px-4 py-2.5 text-left">Uploads</th>
              <th className="px-4 py-2.5 text-left">Role</th>
              <th className="px-4 py-2.5 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.users?.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{u.branch} / {u.semester}</td>
                <td className="px-4 py-2.5 tabular-nums">{u.uploadsCount ?? 0}</td>
                <td className="px-4 py-2.5">
                  {u.isAdmin ? (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">Admin</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">User</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleToggleAdmin(u._id, u.isAdmin)}
                      className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      {u.isAdmin ? 'Revoke' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">{data?.total ?? 0} total users</p>
    </div>
  );
};

const ResourcesTab = ({ toast }) => {
  const [q, setQ] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const { data, loading, refetch } = useApi(
    () => fetchAdminResources({ q: searchQ, limit: 50 }),
    [searchQ]
  );

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteAdminResource(id);
      toast.success('Resource deleted');
      refetch();
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => { e.preventDefault(); setSearchQ(q); }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <Button type="submit" size="sm">Search</Button>
      </form>

      {loading && <FullPageLoader label="Loading resources…" />}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2.5 text-left">Title</th>
              <th className="px-4 py-2.5 text-left">Type</th>
              <th className="px-4 py-2.5 text-left">Subject</th>
              <th className="px-4 py-2.5 text-left">Uploaded by</th>
              <th className="px-4 py-2.5 text-left">Downloads</th>
              <th className="px-4 py-2.5 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.resources?.map((r) => (
              <tr key={r._id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <p className="max-w-[200px] truncate font-medium text-slate-800">{r.title}</p>
                </td>
                <td className="px-4 py-2.5 text-slate-500">{r.type}</td>
                <td className="px-4 py-2.5 text-slate-500">{r.subject?.code}</td>
                <td className="px-4 py-2.5 text-slate-500">{r.uploadedBy?.name}</td>
                <td className="px-4 py-2.5 tabular-nums">{r.downloadCount ?? 0}</td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => handleDelete(r._id, r.title)}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">{data?.total ?? 0} total resources</p>
    </div>
  );
};

export default AdminPanel;
