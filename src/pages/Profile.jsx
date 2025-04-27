import { useEffect, useState } from 'react';
import API from '../api';
const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/users/profile');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ padding: '30px' }}>
      <h2>My Profile</h2>
      <p><strong>Username:</strong> {profile.user.username}</p>
      <p><strong>Email:</strong> {profile.user.email}</p>

      <h3>My Tasks</h3>
      <ul>
        {profile.tasks.map(task => (
          <li key={task._id}>
            <strong>{task.title}</strong> - {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
