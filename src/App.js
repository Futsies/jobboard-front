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
import EditJobForm from './components/EditJobForm';
import ApplyForm from './components/ApplyForm';
import Dashboard from './components/Dashboard';
import ViewApplication from './components/ViewApplication';
import ScheduleInterviewForm from './components/ScheduleInterviewForm';
import MyApplications from './components/MyApplications';
import ApplicantViewApplication from './components/ApplicantViewApplication';
import ChatPage from './components/ChatPage';
import './App.css';

function App() {
  return (
    <Router>
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
            <Route path="/jobs/:id/edit" element={<EditJobForm />} />
            <Route path="/jobs/:id/apply" element={<ApplyForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications/:applicationId" element={<ViewApplication />} />
            <Route path="/applications/:applicationId/schedule" element={<ScheduleInterviewForm />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/my-applications/:applicationId" element={<ApplicantViewApplication />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;