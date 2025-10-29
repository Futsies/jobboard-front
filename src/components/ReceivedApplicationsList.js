import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ReceivedApplicationsList.css';

const ReceivedApplicationsList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || (!user.is_admin && !user.is_employer)) return; // Ensure user is employer/admin

        const fetchReceivedApplications = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/applications/received`, // Use the endpoint we created
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setApplications(response.data);
            } catch (err) {
                setError('Failed to load received applications.');
                console.error("Error fetching received applications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReceivedApplications();
    }, [user, token]); // Re-fetch if user changes

    const handleViewApplication = (applicationId) => {
        // Navigate to the specific application view page (we'll create this route later)
        navigate(`/applications/${applicationId}`);
    };

    if (loading) {
        return <p>Loading applications...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="received-applications-list">
            {applications.length === 0 ? (
                <p>No applications received yet.</p>
            ) : (
                <table className="applications-table">
                    <thead>
                        <tr>
                            <th>Applicant</th>
                            <th>Job Title</th>
                            <th>Date Applied</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => (
                            // Use applicant name + job title + date as a reasonable key
                            // Or use app.id if your API returns the application ID
                            <tr key={app.id}>
                                {/* Access nested data safely */}
                                <td data-label="Applicant">{app.user?.name || 'N/A'}</td>
                                <td data-label="Job Title">{app.job?.job_title || 'N/A'}</td>
                                <td data-label="Date Applied">{new Date(app.created_at).toLocaleDateString()}</td>
                                <td className="app-actions-cell">
                                    <button
                                        className="view-app-button"
                                        onClick={() => handleViewApplication(app.id)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ReceivedApplicationsList;