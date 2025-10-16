import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Determine which user to fetch
        const userToFetch = userId || (currentUser ? currentUser.id : null);
        
        if (!userToFetch) {
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8000/api/users/${userToFetch}`, {
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
        setProfileUser(userData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, currentUser]);

  // Check if current user can edit this profile
  const canEdit = currentUser && profileUser && 
                 (currentUser.id === profileUser.id || currentUser.is_admin);

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

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profileUser.profile_photo ? (
            <img src={profileUser.profile_photo} alt="Profile" className="avatar-image" />
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
            <span className="badge member">Member</span>
            {currentUser && currentUser.id === profileUser.id && <span className="badge you">You</span>}
            {currentUser && currentUser.is_admin && currentUser.id !== profileUser.id && (
              <span className="badge admin-view">Admin View</span>
            )}
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
        
        {/* Only show Settings tab to profile owner or admins */}
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
            
            <div className="info-section">
              <h3>Account Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Member Since</label>
                  <span>{new Date(profileUser.created_at).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Last Updated</label>
                  <span>{new Date(profileUser.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>User ID</label>
                  <span>{profileUser.id}</span>
                </div>
                <div className="detail-item">
                  <label>Account Type</label>
                  <span>
                    {profileUser.is_admin ? 'Administrator' : 
                     profileUser.is_employer ? 'Employer' : 'Job Seeker'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && canEdit && (
          <div className="tab-content">
            <div className="info-section">
              <h3>Profile Settings</h3>
              <p>Profile photo upload and other settings will be available soon.</p>
              
              {/* Admin-only settings */}
              {currentUser.is_admin && currentUser.id !== profileUser.id && (
                <div className="admin-settings">
                  <h4>Admin Controls</h4>
                  <div className="admin-actions">
                    <button className="admin-btn warning">
                      Reset Password
                    </button>
                    <button className="admin-btn danger">
                      Deactivate Account
                    </button>
                    <button className="admin-btn">
                      Edit Permissions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;