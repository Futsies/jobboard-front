import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import Users from './components/Users';
import UserProfile from './components/UserProfile';
import MyProfile from './components/MyProfile';
import ViewJob from './components/ViewJob';
import BecomeEmployerForm from './components/BecomeEmployerForm';
import PostJobForm from './components/PostJobForm';
import './App.css';

function App() {
  return (
    // 1. Move <Router> to be the main wrapper
    <Router>
      {/* 2. Place <AuthProvider> inside <Router> */}
      <AuthProvider>
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/jobs/:id" element={<ViewJob />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/become-employer" element={<BecomeEmployerForm />} />
            <Route path="/post-job" element={<PostJobForm />} />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;