// src/components/SubjectGrid.jsx
import SubjectCard from './SubjectCard.jsx';
import EmptyState from './ui/EmptyState.jsx';

const SubjectGrid = ({ subjects = [], counts = {} }) => {
  if (!subjects.length) {
    return (
      <EmptyState
        icon="📚"
        title="No subjects yet"
        description="Subjects for this branch and semester haven't been added. Run the seed script on the backend."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((s) => (
        <SubjectCard key={s._id} subject={s} resourceCount={counts[s._id]} />
      ))}
    </div>
  );
};

export default SubjectGrid;