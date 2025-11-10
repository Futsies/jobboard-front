import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// We can re-use the same CSS as the applications list
import './ReceivedApplicationsList.css'; 

const SavedJobsList = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchSavedJobs = async () => {
            setLoading(true);
            setError('');
            try {
                // The /api/users/{id} route returns the user object,
                // which includes the 'savedJobs' array.
                const response = await axios.get(
                    `http://localhost:8000/api/users/${user.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Set the savedJobs state from the response
                if (response.data && response.data.saved_jobs) {
                    setSavedJobs(response.data.saved_jobs);
                } else {
                    setSavedJobs([]);
                }

            } catch (err) {
                setError('Failed to load your saved jobs.');
                console.error("Error fetching saved jobs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedJobs();
    }, [user, token]);

    const handleViewClick = (jobId) => {
        // Navigate to the public job posting page
        navigate(`/jobs/${jobId}`);
    };

    if (loading) { return <p>Loading saved jobs...</p>; }
    if (error) { return <p className="error-message">{error}</p>; }

    return (
        <div className="received-applications-list"> {/* Re-using class */}
            {savedJobs.length === 0 ? (
                <p>You have not saved any jobs yet.</p>
            ) : (
                // Remember to avoid whitespace between table/thead/tbody
                <table className="applications-table"> {/* Re-using class */}
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {savedJobs.map((job) => (
                            <tr key={job.id}>
                                <td data-label="Job Title">{job.job_title || 'N/A'}</td>
                                <td data-label="Company">{job.company_name || 'N/A'}</td>
                                <td data-label="Location">{job.job_location || 'N/A'}</td>
                                <td className="app-actions-cell"> {/* Re-using class */}
                                    <button
                                        className="view-app-button" // Re-using class
                                        onClick={() => handleViewClick(job.id)}
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

export default SavedJobsList;