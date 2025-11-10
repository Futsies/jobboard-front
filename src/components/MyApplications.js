import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './Dashboard.css'; // Re-using Dashboard styles
import SavedJobsList from './SavedJobsList';
import SubmittedApplicationsList from './SubmittedApplicationsList';
import InterviewCalendar from './InterviewCalendar';

const MyApplications = () => {
    const { user } = useAuth();

    // Route Protection: Only logged-in users can see this page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="dashboard-container"> {/* Re-using class */}
            <h1 className="dashboard-title">My Applications</h1> {/* Re-using class */}

            <div className="dashboard-grid"> {/* This class just provides layout context */}
                
                {/* Section 1: Applications */}
                <section className="dashboard-section">
                    <h2>My Submitted Applications</h2>
                    <div className="section-content">
                        <SubmittedApplicationsList />
                    </div>
                </section>

                {/* Section 2: Saved Jobs */}
                <section className="dashboard-section">
                    <h2>My Saved Jobs</h2>
                    <div className="section-content">
                        <SavedJobsList />
                    </div>
                </section>

                {/* Section 3: Interview Scheduling */}
                <section className="dashboard-section">
                    <h2>Interview Scheduling</h2>
                     <div className="section-content">
                        <InterviewCalendar />
                    </div>
                </section>

            </div>
        </div>
    );
};

export default MyApplications;
