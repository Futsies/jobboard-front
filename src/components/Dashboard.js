import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import UserJobsList from './UserJobsList';
import ReceivedApplicationsList from './ReceivedApplicationsList';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();

    // Route Protection: Redirect if user is not logged in or not admin/employer
    if (!user || (!user.is_admin && !user.is_employer)) {
        // Redirect to homepage or login page if user shouldn't be here
        return <Navigate to="/" replace />;
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Dashboard</h1>

            <div className="dashboard-grid">
                {/* Section 1: Uploaded Jobs */}
                <section className="dashboard-section">
                    <h2>My Uploaded Jobs</h2>
                    <div className="section-content">
                        <UserJobsList />
                    </div>
                </section>

                {/* Section 2: Applications Received */}
                <section className="dashboard-section">
                    <h2>Applications Received</h2>
                    <div className="section-content">
                        <ReceivedApplicationsList />
                    </div>
                </section>

                {/* Section 3: Interview Scheduling */}
                <section className="dashboard-section">
                    <h2>Interview Scheduling</h2>
                     <div className="section-content">
                        {/* Content for interview scheduling will go here */}
                        <p>Interview scheduling tools and calendar will appear here.</p>
                        {/* This might be a more complex feature for later */}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;