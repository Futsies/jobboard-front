import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import ViewJob from './components/ViewJob';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/job/:id" element={<ViewJob />} />
            <Route path="/applications" element={<div>My Applications Page - Coming Soon</div>} />
            <Route path="/dashboard" element={<div>Dashboard Page - Coming Soon</div>} />
            <Route path="/livechat" element={<div>LiveChat Page - Coming Soon</div>} />
            <Route path="/users" element={<div>Users Page - Coming Soon</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;