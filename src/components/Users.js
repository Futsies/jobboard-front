import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch all users from API
  useEffect(() => {
    // In your fetchUsers function, add console logs:
    const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    const response = await fetch('http://localhost:8000/api/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    // Handle 401 Unauthorized (not logged in)
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }

    // Handle 403 Forbidden (not admin)
    if (response.status === 403) {
      setError('You need admin privileges to view users.');
      setLoading(false);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    setUsers(data);
    setFilteredUsers(data);
    setLoading(false);
  } catch (error) {
    setError(error.message);
    setLoading(false);
  }
};

    fetchUsers();
  }, []);

  // Filter users based on search term (name or ID)
  useEffect(() => {
    const filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = user.name && user.name.toLowerCase().includes(searchLower);
      const idMatch = user.id.toString().includes(searchTerm);
      
      return nameMatch || idMatch;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  if (loading) {
    return <div className="users-loading">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="users-container">
        <div className="users-error">
          <h3>Error loading users</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Users Management</h1>
        <p>Manage and view all registered users</p>
      </div>

      {/* Search Bar */}
      <div className="users-search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
        <div className="results-count">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      </div>

      {/* Users List */}
      <div className="users-list">
        {filteredUsers.length > 0 ? (
          <div className="users-table">
            <div className="table-header">
              <div className="table-cell">ID</div>
              <div className="table-cell">User</div>
              <div className="table-cell">Email</div>
              <div className="table-cell">Role</div>
              <div className="table-cell">Joined</div>
              <div className="table-cell">Status</div>
            </div>
            
            {filteredUsers.map(user => (
              <div 
                key={user.id} 
                className="table-row"
                onClick={() => handleUserClick(user.id)}
              >
                <div className="table-cell user-id">
                  #{user.id}
                  {currentUser && currentUser.id === user.id && (
                    <span className="you-badge">You</span>
                  )}
                </div>
                <div className="table-cell user-info">
                  <div className="user-avatar-small">
                    {user.profile_photo ? (
                      <img src={user.profile_photo} alt="Profile" />
                    ) : (
                      <div className="avatar-small-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    {user.description && (
                      <div className="user-description-small">
                        {user.description.length > 50 
                          ? `${user.description.substring(0, 50)}...` 
                          : user.description
                        }
                      </div>
                    )}
                  </div>
                </div>
                <div className="table-cell user-email">{user.email}</div>
                <div className="table-cell user-role">
                  <div className="role-badges">
                    {user.is_admin && <span className="role-badge admin">Admin</span>}
                    {user.is_employer && <span className="role-badge employer">Employer</span>}
                    {!user.is_admin && !user.is_employer && <span className="role-badge member">Member</span>}
                  </div>
                </div>
                <div className="table-cell user-joined">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
                <div className="table-cell user-actions">
                  <button 
                    className="view-profile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user.id);
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-users">
            <h3>No users found</h3>
            <p>Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;