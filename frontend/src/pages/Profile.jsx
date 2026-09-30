// src/pages/Profile.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserProfile } from '../api/users.js';
import { useApi } from '../hooks/useApi.js';
import ProfileHeader from '../components/ProfileHeader.jsx';
import UploadHistory from '../components/UploadHistory.jsx';
import Button from '../components/ui/Button.jsx';
import { FullPageLoader } from '../components/ui/Loader.jsx';

const Profile = () => {
  const { user } = useAuth();
  const { data, loading } = useApi(() => fetchUserProfile(user._id), [user._id]);

  if (loading) return <FullPageLoader label="Loading your profile…" />;

  const profile = data?.user ?? user;

  return (
    <div className="space-y-5">
      <ProfileHeader user={profile} isSelf />

      <div className="flex gap-2">
        <Link to={`/semester/${profile.branch}/${profile.semester}`} className="flex-1">
          <Button variant="secondary" fullWidth>
            Browse my semester
          </Button>
        </Link>
      </div>

      <UploadHistory
        uploads={data?.uploads ?? []}
        emptyAction={
          <Link to={`/semester/${profile.branch}/${profile.semester}`}>
            <Button>Upload your first resource</Button>
          </Link>
        }
      />
    </div>
  );
};

export default Profile;