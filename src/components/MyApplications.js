import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './Dashboard.css'; // Re-using Dashboard styles for a consistent look

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
                        <p>You have not submitted any applications yet.</p>
                        {/* We will add a list of submitted applications here */}
                    </div>
                </section>

                {/* Section 2: Saved Jobs */}
                <section className="dashboard-section">
                    <h2>My Saved Jobs</h2>
                    <div className="section-content">
                        <p>You have no jobs saved.</p>
                        {/* We will add a list of saved jobs here */}
                    </div>
                </section>

                {/* Section 3: Interview Scheduling */}
                <section className="dashboard-section">
                    <h2>My Scheduled Interviews</h2>
                    <div className="section-content">
                        <p>You have no interviews scheduled.</p>
                        {/* We will add a list/calendar of interviews for the applicant here */}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default MyApplications;
