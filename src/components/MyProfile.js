import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const MyProfile = () => {
  const { user, loading } = useAuth();

  // If the authentication state is still loading, show a message
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there is no user logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a user is logged in, redirect to their specific user page
  return <Navigate to={`/users/${user.id}`} replace />;
};

export default MyProfile;