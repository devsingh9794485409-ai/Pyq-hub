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
  const { data, loading, error } = useApi(() => fetchUserProfile(userId), [userId]);

  if (loading) return <FullPageLoader label="Loading profile…" />;

  if (error) {
    return <EmptyState icon="🔍" title="Profile unavailable" description={error} />;
  }

  return (
    <div className="space-y-5">
      <ProfileHeader user={data.user} isSelf={data.user._id === me._id} />
      <UploadHistory uploads={data.uploads} />
    </div>
  );
};

export default UserProfile;