// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../utils/format.js';

const Navbar = () => {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const dropRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setDropOpen(false);
    navigate('/login', { replace: true });
  };

  // Close desktop dropdown on outside click
  useEffect(() => {
    const onPointerDown = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        {/* ── Logo ───────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">
            P
          </span>
          <span className="hidden sm:inline">PYQHub</span>
        </Link>

        {/* ── Desktop nav links ───────────────────────────────────── */}
        <div className="hidden items-center gap-1 sm:flex">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          {user && (
            <NavLink to={`/semester/${user.branch}/${user.semester}`} className={linkClass}>
              My Semester
            </NavLink>
          )}
          {user && (
            <NavLink to="/saved" className={linkClass}>Saved</NavLink>
          )}
          {user?.isAdmin && (
            <NavLink to="/admin" className={linkClass}>Admin</NavLink>
          )}
        </div>

        {/* ── Right side ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Desktop user dropdown */}
              <div className="relative hidden sm:block" ref={dropRef}>
                <button
                  id="user-menu-button"
                  type="button"
                  onClick={() => setDropOpen((v) => !v)}
                  aria-expanded={dropOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:bg-slate-50"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {initials(user.name)}
                    </span>
                  )}
                  <span className="max-w-[100px] truncate text-sm font-medium text-slate-700">
                    {user.name.split(' ')[0]}
                  </span>
                  <svg className={`h-4 w-4 text-slate-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>

                {dropOpen && (
                  <div
                    role="menu"
                    aria-labelledby="user-menu-button"
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    <div className="border-b border-slate-100 px-4 py-2.5">
                      <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                      <p className="truncate text-xs text-slate-400">{user.branch} · Sem {user.semester}</p>
                    </div>
                    <DropItem to="/profile" onClick={() => setDropOpen(false)}>👤 Profile</DropItem>
                    <DropItem to={`/semester/${user.branch}/${user.semester}`} onClick={() => setDropOpen(false)}>
                      📚 My Semester
                    </DropItem>
                    <DropItem to="/saved" onClick={() => setDropOpen(false)}>🔖 Saved Papers</DropItem>
                    {user.isAdmin && (
                      <DropItem to="/admin" onClick={() => setDropOpen(false)}>⚙️ Admin</DropItem>
                    )}
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        role="menuitem"
                        type="button"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        🚪 Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 sm:hidden"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 5.75A.75.75 0 0 1 3.75 5h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.75Zm0 4.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10Zm.75 3.5a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600">Log in</Link>
              <Link to="/signup" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Mobile slide-down menu ──────────────────────────────────── */}
      {user && mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-2 sm:hidden">
          <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>🏠 Home</NavLink>
          <NavLink
            to={`/semester/${user.branch}/${user.semester}`}
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            📚 My Semester
          </NavLink>
          <NavLink to="/profile" className={linkClass} onClick={() => setMobileOpen(false)}>
            👤 Profile
          </NavLink>
          <NavLink to="/saved" className={linkClass} onClick={() => setMobileOpen(false)}>
            🔖 Saved Papers
          </NavLink>
          {user.isAdmin && (
            <NavLink to="/admin" className={linkClass} onClick={() => setMobileOpen(false)}>
              ⚙️ Admin
            </NavLink>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            🚪 Log out
          </button>
        </div>
      )}
    </header>
  );
};

const DropItem = ({ to, onClick, children }) => (
  <Link
    role="menuitem"
    to={to}
    onClick={onClick}
    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
  >
    {children}
  </Link>
);

export default Navbar;