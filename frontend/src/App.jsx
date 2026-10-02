// src/App.jsx
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar          from './components/Navbar.jsx';
import ProtectedRoute  from './components/ProtectedRoute.jsx';
import Login           from './pages/Login.jsx';
import Signup          from './pages/Signup.jsx';
import ForgotPassword  from './pages/ForgotPassword.jsx';
import ResetPassword   from './pages/ResetPassword.jsx';
import Home            from './pages/Home.jsx';
import SemesterPage    from './pages/SemesterPage.jsx';
import SubjectPage     from './pages/SubjectPage.jsx';
import Profile         from './pages/Profile.jsx';
import UserProfile     from './pages/UserProfile.jsx';
import SavedPapers     from './pages/SavedPapers.jsx';
import AdminPanel      from './pages/AdminPanel.jsx';
import NotFound        from './pages/NotFound.jsx';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-5">
        <Routes>
          {/* ── Public auth routes ─────────────────────────────────── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* ── Public browsing (Phase 2: unauthenticated users can browse) ─ */}
          <Route path="/"                          element={<Home />} />
          <Route path="/semester/:branch/:semester" element={<SemesterPage />} />
          <Route path="/subject/:subjectId"         element={<SubjectPage />} />
          <Route path="/u/:userId"                  element={<UserProfile />} />

          {/* ── Protected: require login ──────────────────────────────── */}
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/saved"   element={
            <ProtectedRoute><SavedPapers /></ProtectedRoute>
          } />
          <Route path="/admin"   element={
            <ProtectedRoute><AdminPanel /></ProtectedRoute>
          } />

          {/* ── 404 ─────────────────────────────────────────────────── */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*"    element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;