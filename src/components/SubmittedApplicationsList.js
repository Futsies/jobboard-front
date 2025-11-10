import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// We can re-use the table styles from the dashboard
import './ReceivedApplicationsList.css'; 

const SubmittedApplicationsList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchApplications = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(
                    'http://localhost:8000/api/my-applications',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setApplications(response.data);
            } catch (err) {
                setError('Failed to load your applications.');
                console.error("Error fetching submitted applications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user, token]);

    const handleViewClick = (appId) => {
        navigate(`/my-applications/${appId}`);
    };

    if (loading) {return <p>Loading your applications...</p>;}
    if (error) {return <p className="error-message">{error}</p>;}

    return (
        <div className="received-applications-list"> {/* Re-using class */}
            {applications.length === 0 ? (
                <p>You have not submitted any applications yet.</p>
            ) : (
                <table className="applications-table"> {/* Re-using class */}
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Date Applied</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => (
                            <tr key={app.id}>
                                <td data-label="Job Title">{app.job?.job_title || 'N/A'}</td>
                                <td data-label="Company">{app.job?.company_name || 'N/A'}</td>
                                <td data-label="Date Applied">{new Date(app.created_at).toLocaleDateString()}</td>
                                <td className="app-actions-cell"> {/* Re-using class */}
                                    <button
                                        className="view-app-button" // Re-using class
                                        onClick={() => handleViewClick(app.id)}
                                    >
                                        View
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

export default SubmittedApplicationsList;