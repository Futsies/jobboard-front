import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import './ScheduleInterviewForm.css';

const ScheduleInterviewForm = () => {
    const { applicationId } = useParams();
    const { user: currentUser, token } = useAuth();
    const navigate = useNavigate();

    // State for form inputs
    const [title, setTitle] = useState('');
    const [scheduledAt, setScheduledAt] = useState(''); // Store as string initially

    // State to display application info
    const [applicationInfo, setApplicationInfo] = useState(null);
    const [fetchingInfo, setFetchingInfo] = useState(true);

    // State for form submission
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch application details to display context
    useEffect(() => {
        const fetchApplicationInfo = async () => {
            if (!token) return;
            setFetchingInfo(true);
            setError('');
            try {
                // We use the existing 'show' endpoint for applications
                const response = await axios.get(
                    `http://localhost:8000/api/applications/${applicationId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Basic check if user can schedule (should be employer/admin)
                 if (!currentUser.is_admin && (!response.data.job || currentUser.id !== response.data.job.employer_id)) {
                    setError('You do not have permission to schedule an interview for this application.');
                    setApplicationInfo(null); // Clear info if not authorized
                 } else {
                    setApplicationInfo(response.data);
                 }

            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Application not found.');
                } else if (err.response?.status === 403) {
                     setError('You do not have permission to view this application.');
                }
                else {
                    setError('Failed to load application details.');
                }
                console.error("Error fetching application details:", err);
            } finally {
                setFetchingInfo(false);
            }
        };
        fetchApplicationInfo();
    }, [applicationId, token, currentUser]); // Add currentUser to dependencies

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        // Basic validation for date format (more robust validation recommended)
        if (!title || !scheduledAt) {
            setError('Please provide both a title and a date/time.');
            setSubmitting(false);
            return;
        }

        // Format the date/time string for Laravel if needed.
        // Input type="datetime-local" usually provides ISO-like format (YYYY-MM-DDTHH:MM)
        // Laravel's 'date' validation rule often handles this, but explicit formatting can be safer.
        // Example: const formattedDateTime = new Date(scheduledAt).toISOString().slice(0, 19).replace('T', ' ');

        try {
            await axios.post(
                `http://localhost:8000/api/applications/${applicationId}/schedule-interview`,
                {
                    title: title,
                    scheduled_at: scheduledAt // Send the string value from input
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Interview scheduled successfully! Redirecting...');
            setTitle('');
            setScheduledAt('');

            setTimeout(() => {
                navigate(`/applications/${applicationId}`); // Go back to application details
            }, 2000);

        } catch (err) {
             if (err.response?.data?.errors) {
                 console.error('Validation Errors:', err.response.data.errors);
                 // Format validation errors nicely
                 const errorMessages = Object.entries(err.response.data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('; ');
                 setError(`Scheduling failed: ${errorMessages}`);
            } else {
                 setError(err.response?.data?.message || 'An error occurred while scheduling the interview.');
            }
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Render Logic ---
    if (!currentUser) return <Navigate to="/login" replace />; // Must be logged in
    if (fetchingInfo) return <div className="loading">Loading application info...</div>;
    // Handle errors during fetch or if user doesn't have permission
    if (error && !applicationInfo) return <div className="error-message">{error}</div>;
    if (!applicationInfo) return <div className="error-message">Could not load application data.</div>;

     // Double check permission based on fetched data before rendering form
     if (!currentUser.is_admin && (!applicationInfo.job || currentUser.id !== applicationInfo.job.employer_id)) {
        return <Navigate to="/" replace />; // Or show a permission denied message
    }


    return (
        <div className="schedule-interview-container">
            <div className="schedule-interview-card">
                 <Link to={`/applications/${applicationId}`} className="back-to-app-link">
                    &larr; Back to Application Details
                </Link>

                <h2>Schedule Interview</h2>
                <div className="schedule-context">
                    <p><strong>Applicant:</strong> {applicationInfo.user?.name || 'N/A'}</p>
                    <p><strong>For Job:</strong> {applicationInfo.job?.job_title || 'N/A'}</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form"> {/* Reusing form styles */}
                    {/* Interview Title */}
                    <div className="form-group">
                        <label htmlFor="title">Interview Title / Description</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder='e.g., "First Round Technical Call"'
                            required
                        />
                    </div>

                    {/* Interview Date & Time */}
                    <div className="form-group">
                        <label htmlFor="scheduled_at">Date and Time</label>
                        <input
                            type="datetime-local" // Use browser's date-time picker
                            id="scheduled_at"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            required
                            // Optional: Set min to prevent past dates
                            min={new Date().toISOString().slice(0, 16)}
                        />
                         <small className="form-hint">Select a date and time in the future.</small>
                    </div>

                    {/* Error & Success Messages */}
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="auth-button" // Reuse button style
                        disabled={submitting || success}
                    >
                        {submitting ? 'Scheduling...' : 'Schedule Interview'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ScheduleInterviewForm;