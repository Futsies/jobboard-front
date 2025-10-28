import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserJobsList.css';

const UserJobsList = () => {
    const [postedJobs, setPostedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return; // Don't fetch if user isn't loaded yet

        const fetchPostedJobs = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/users/${user.id}/posted-jobs`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Process logo URLs immediately
                const processedJobs = response.data.map(job => {
                     if (job.company_logo && !job.company_logo.startsWith('http')) {
                        return {
                            ...job,
                            company_logo: `http://localhost:8000/storage/${job.company_logo}`
                        };
                    }
                    return job;
                });
                setPostedJobs(processedJobs);
            } catch (err) {
                setError('Failed to load your posted jobs.');
                console.error("Error fetching posted jobs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPostedJobs();
    }, [user, token]); // Re-fetch if user changes

    const handleViewJob = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    const handleEditJob = (jobId) => {
        navigate(`/jobs/${jobId}/edit`);
    };

    if (loading) {return <p>Loading your jobs...</p>;}
    if (error) {return <p className="error-message">{error}</p>;}

    return (
        <div className="user-jobs-list">
            {postedJobs.length === 0 ? (
                <p>You haven't posted any jobs yet.</p>
            ) : (
                <table className="jobs-table">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Job Title</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {postedJobs.map((job) => (
                            <tr key={job.id} onClick={() => handleViewJob(job.id)} className="clickable-row">
                                <td>{job.company_name}</td>
                                <td>{job.job_title}</td>
                                <td>{job.job_type}</td>
                                <td className="job-actions-cell">
                                    <button
                                        className="edit-job-button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click
                                            handleEditJob(job.id);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    {/* Add Delete button later if needed */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserJobsList;