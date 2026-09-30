// src/components/ProfileHeader.jsx
import { initials } from '../utils/format.js';

const ProfileHeader = ({ user, isSelf = false }) => (
  <div className="card p-5">
    <div className="flex items-center gap-4">
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-100 text-xl font-bold text-brand-700">
        {initials(user.name)}
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-900">{user.name}</h1>
        <p className="text-sm text-slate-500">
          {user.branch} · Semester {user.semester}
        </p>
        {isSelf && user.email && (
          <p className="truncate text-xs text-slate-400">{user.email}</p>
        )}
      </div>
    </div>

    <dl className="mt-5 grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <dt className="text-xs font-medium text-slate-500">Uploads</dt>
        <dd className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
          {user.uploadsCount ?? 0}
        </dd>
      </div>
      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <dt className="text-xs font-medium text-slate-500">Upvotes received</dt>
        <dd className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
          {user.upvotesReceived ?? 0}
        </dd>
      </div>
    </dl>
  </div>
);

export default ProfileHeader;