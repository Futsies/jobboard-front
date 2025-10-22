import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PostJobForm = () => {
    const { user } = useAuth();

    // Protect this route: only logged-in employers can see it
    if (!user || !user.is_employer) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
            <h2>Post a New Job</h2>
            <p>This is where the job posting form will be built.</p>
        </div>
    );
};

export default PostJobForm;