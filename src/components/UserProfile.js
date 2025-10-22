import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import './UserProfile.css';
import UserSettings from './UserSettings';

const UserProfile = () => {
  const { user: currentUser, updateUser } = useAuth();
  const { id } = useParams(); 
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user data when component mounts or id changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Use the id from the URL parameters
        if (!id) {
          setLoading(false);
          setError('No user ID provided in the URL.');
          return;
        }

        const response = await fetch(`http://localhost:8000/api/users/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        // Process the user data to create the full photo URL
        if (userData.profile_photo && !userData.profile_photo.startsWith('http')) {
          userData.profile_photo = `http://localhost:8000/storage/${userData.profile_photo}`;
        }
        
        setProfileUser(userData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleProfileUpdate = (updatedUser) => {
    setProfileUser(updatedUser);
    
    // 2. If the updated user is the current user, update the global context
    if (currentUser && currentUser.id === updatedUser.id) {
        updateUser(updatedUser);
    }

    setActiveTab('profile'); 
  };

  // Check if current user can edit this profile
  const canEdit = currentUser && profileUser && (currentUser.id === profileUser.id || currentUser.is_admin);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h3>Error loading profile</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-container">
        <div className="not-logged-in">
          <h2>User not found</h2>
          <p>The requested user profile could not be loaded.</p>
        </div>
      </div>
    );
  }
  
  const photoUrl = profileUser.profile_photo;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              {profileUser.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{profileUser.name}</h1>
          <p className="user-email">{profileUser.email}</p>
          <div className="user-badges">
            {profileUser.is_admin && <span className="badge admin">Admin</span>}
            {profileUser.is_employer && <span className="badge employer">Employer</span>}
            {!profileUser.is_admin && !profileUser.is_employer && <span className="badge member">Member</span>}
            {currentUser && currentUser.id === profileUser.id && <span className="badge you">You</span>}
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Info
        </button>
        
        {canEdit && (
          <button 
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        )}
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="info-section">
              <h3>About Me</h3>
              <p className="user-description">
                {profileUser.description || 'No description provided.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && canEdit && (
          <div className="tab-content">
            {/* Here we render the UserSettings component */}
            <UserSettings user={profileUser} onUpdate={handleProfileUpdate} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;