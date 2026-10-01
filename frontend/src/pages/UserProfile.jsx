// src/pages/UserProfile.jsx
import { useParams } from 'react-router-dom';
import { fetchUserProfile } from '../api/users.js';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProfileHeader from '../components/ProfileHeader.jsx';
import UploadHistory from '../components/UploadHistory.jsx';
import { FullPageLoader } from '../components/ui/Loader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const { data, loading, error, setData } = useApi(() => fetchUserProfile(userId), [userId]);

  if (loading) return <FullPageLoader label="Loading profile…" />;

  if (error) {
    return <EmptyState icon="🔍" title="Profile unavailable" description={error} />;
  }

  const handleUpvoted = (id, res) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            uploads: (prev.uploads ?? []).map((r) =>
              r._id === id
                ? { ...r, upvoteCount: res.upvoteCount, hasUpvoted: res.upvoted }
                : r
            ),
          }
        : prev
    );
  };

  return (
    <div className="space-y-5">
      <ProfileHeader user={data.user} isSelf={Boolean(me?._id && data.user._id === me._id)} />
      <UploadHistory uploads={data.uploads} onUpvoted={handleUpvoted} />
    </div>
  );
};

export default UserProfile;