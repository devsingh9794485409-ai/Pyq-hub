// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="text-5xl font-black text-brand-600">404</p>
    <h1 className="mt-3 text-lg font-semibold text-slate-900">Page not found</h1>
    <p className="mt-1 text-sm text-slate-500">
      The page you're looking for doesn't exist or has moved.
    </p>
    <Link to="/" className="mt-5">
      <Button>Back to home</Button>
    </Link>
  </div>
);

export default NotFound;