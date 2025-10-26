import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Using axios for consistency
import { useAuth } from '../context/AuthContext';
import './ViewJob.css'; // Assuming you have or will create this CSS file

const ViewJob = () => {
    const { id } = useParams(); // Get job ID from URL
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser, token } = useAuth(); // Get current user and token
    const navigate = useNavigate();

    // --- State for Save Functionality ---
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Loading state for the save button

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:8000/api/jobs/${id}`);
                let jobData = response.data;

                // Construct full logo URL if it exists and is relative
                if (jobData.company_logo && !jobData.company_logo.startsWith('http')) {
                    jobData.company_logo = `http://localhost:8000/storage/${jobData.company_logo}`;
                }

                setJob(jobData);
            } catch (err) {
                setError('Failed to fetch job details. The job may not exist.');
                console.error('Error fetching job:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]); // Re-fetch if the ID changes

    // --- Fetch Saved Status (only if user is logged in) ---
    const checkSavedStatus = useCallback(async () => {
        if (!currentUser || !id) return; // Only run if user and id exist

        try {
            const response = await axios.get(
                `http://localhost:8000/api/users/${currentUser.id}/saved-job-ids`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const savedIds = response.data; // Should be an array like [1, 5, 10]
            // Check if the current id (as a number) is in the array
            setIsSaved(savedIds.includes(parseInt(id)));
        } catch (err) {
            console.error("Failed to fetch saved job status:", err);
            // Don't set a main error, just log it, saving is non-critical
        }
    }, [currentUser, id, token]); // Dependencies for useCallback

    useEffect(() => {
        checkSavedStatus();
    }, [checkSavedStatus]); // Run checkSavedStatus when it changes (or on mount)

    // --- Button Action Handlers (Placeholders for now) ---
    const handleApply = () => {
        if (!currentUser) {
            // If user not logged in, redirect to login, saving intended destination
             navigate('/login', { state: { from: `/jobs/${id}/apply` } });
        } else {
             // If logged in, go directly to apply form
            navigate(`/jobs/${id}/apply`);
        }
    };

    const handleSaveJob = async () => {
        if (!currentUser) {
            navigate('/login'); // Redirect if not logged in
            return;
        }
        setIsSaving(true);
        setError(''); // Clear previous errors

        try {
            if (isSaved) {
                // --- Unsave Job ---
                await axios.delete(
                    `http://localhost:8000/api/users/${currentUser.id}/unsave-job/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsSaved(false); // Update state
                // alert('Job unsaved!'); // Optional feedback
            } else {
                // --- Save Job ---
                await axios.post(
                    `http://localhost:8000/api/users/${currentUser.id}/save-job`,
                    { job_id: id }, // Send job_id in the body
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsSaved(true); // Update state
                // alert('Job saved!'); // Optional feedback
            }
        } catch (err) {
            setError('Failed to update saved status. Please try again.');
            console.error('Error saving/unsaving job:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditJob = () => {
        navigate(`/jobs/${id}/edit`);
    };

    // --- Conditional Logic for Edit Button ---
    const canEditJob = currentUser && job && (currentUser.is_admin || currentUser.id === job.employer_id);

    if (loading) {return <div className="loading">Loading job details...</div>;}
    if (error) {return <div className="error-message">{error}</div>;}
    if (!job) {return <div className="error-message">Job not found.</div>;}

    return (
        <div className="view-job-container">
            <div className="job-detail-card">
                <div className="job-detail-header">
                    {job.company_logo && (
                        <img src={job.company_logo} alt={`${job.company_name} logo`} className="company-logo-large" />
                    )}
                    <div className="job-title-section">
                        <h1>{job.job_title}</h1>
                        <p className="company-name">
                            Posted by: <Link to={`/users/${job.employer_id}`}>{job.company_name}</Link>
                        </p>
                        <span className="job-category-detail">{job.category}</span>
                    </div>
                </div>

                <div className="job-meta-detail">
                    <span className="job-location">
                        <i className="fas fa-map-marker-alt"></i> {job.job_location}
                    </span>
                    <span className="job-type">
                        <i className="fas fa-briefcase"></i> {job.job_type}
                    </span>
                    {job.salary && (
                        <span className="job-salary">
                            <i className="fas fa-money-bill-wave"></i> ${parseInt(job.salary).toLocaleString()}
                        </span>
                    )}
                     <span className="job-posted-date">
                         <i className="fas fa-calendar-alt"></i> Posted on: {new Date(job.created_at).toLocaleDateString()}
                    </span>
                </div>

                <div className="job-description-full">
                    <h2>Job Description</h2>
                    <p>{job.job_description}</p>
                </div>

                <div className="job-actions">
                    <button onClick={handleApply} className="action-button apply-button">
                        <i className="fas fa-check-circle"></i> Apply for Position
                    </button>
                    {currentUser && (
                        <button
                            onClick={handleSaveJob}
                            className={`action-button save-button ${isSaved ? 'saved' : ''}`}
                            disabled={isSaving} // Disable while processing
                        >
                            <i className={`fas ${isSaved ? 'fa-bookmark' : 'fa-regular fa-bookmark'}`}></i> {/* Change icon */}
                            {isSaving ? 'Updating...' : (isSaved ? 'Unsave Job' : 'Save Job')} {/* Change text */}
                        </button>
                    )}
                    {canEditJob && ( // Conditionally show Edit button
                        <button onClick={handleEditJob} className="action-button edit-button">
                            <i className="fas fa-edit"></i> Edit Job
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewJob;