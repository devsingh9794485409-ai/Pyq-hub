// src/components/SubjectCard.jsx
import { Link } from 'react-router-dom';

const SubjectCard = ({ subject, resourceCount }) => (
  <Link
    to={`/subject/${subject._id}`}
    className="card group flex flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:translate-y-0"
  >
    <div>
      <span className="chip bg-slate-100 text-slate-600">{subject.code}</span>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
        {subject.name}
      </h3>
    </div>
    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
      <span>Sem {subject.semester}</span>
      {typeof resourceCount === 'number' && (
        <span>
          {resourceCount} {resourceCount === 1 ? 'resource' : 'resources'}
        </span>
      )}
    </div>
  </Link>
);

export default SubjectCard;