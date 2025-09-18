import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';

const ProfileRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!loading && user) {
      navigate(`/profile/${user.uid}`);
    }
    // If the user is not logged in, you might want to redirect to the login page.
    if (!loading && !user) {
        navigate('/login');
    }
  }, [user, loading, navigate]);

  // Render a loading indicator while we wait for the user data.
  return <div>Loading...</div>;
};

export default ProfileRedirect;
