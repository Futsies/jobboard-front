import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Website Name - Clickable to Homepage */}
        <div className="website-name">
          <Link to="/">
            <h1>Jobboard with code</h1>
          </Link>
        </div>

        {/* Navigation Menu - Center */}
        <nav className="nav-menu">
          <ul>
            <li><Link to="/applications">My Applications</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/livechat">LiveChat</Link></li>
            <li><Link to="/users">Users</Link></li>
          </ul>
        </nav>

        {/* User Section - Right */}
        <div className="user-section">
          {user ? (
            <div className="user-logged-in">
              <div className="user-icon">
                {user.profile_photo_url ? (
                  <img 
                    src={user.profile_photo_url} 
                    alt="Profile" 
                    className="profile-photo"
                  />
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="user-logged-out">
              <div className="user-icon">
                <i className="fas fa-user"></i>
              </div>
              <button onClick={handleLogin} className="login-btn">
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;