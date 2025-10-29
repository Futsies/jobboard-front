import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './ViewApplication.css';

const ViewApplication = () => {
    const { applicationId } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadError, setDownloadError] = useState(''); // Specific error for downloads
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch application details
    useEffect(() => {
        const fetchApplication = async () => {
            if (!token) return; // Don't fetch if no token
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/applications/${applicationId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setApplication(response.data);
            } catch (err) {
                 if (err.response?.status === 403) {
                     setError('You do not have permission to view this application.');
                 } else if (err.response?.status === 404) {
                     setError('Application not found.');
                 }
                 else {
                     setError('Failed to load application details.');
                 }
                console.error("Error fetching application:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [applicationId, token]);

    // Function to handle file downloads securely
    const handleDownload = async (fileType) => {
        setDownloadError(''); // Clear previous download errors
        const url = `http://localhost:8000/api/applications/${applicationId}/${fileType}`; // fileType is 'resume' or 'cover-letter'

        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', // Important for file downloads
            });

            // Extract filename from content-disposition header
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${fileType}_application_${applicationId}.file`; // Default filename
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }

            // Create a temporary link to trigger download
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

        } catch (err) {
             if (err.response?.status === 404) {
                 setDownloadError(`${fileType.replace('-', ' ')} file not found for this application.`);
             } else if (err.response?.status === 403) {
                 setDownloadError(`You do not have permission to download this file.`);
             }
             else {
                 setDownloadError(`Could not download ${fileType.replace('-', ' ')} file.`);
             }
            console.error(`Error downloading ${fileType}:`, err);
        }
    };

    const handleDeleteApplication = async () => {
        // Confirmation dialog
        if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        setError(''); // Clear previous main errors

        try {
            await axios.delete(
                `http://localhost:8000/api/applications/${applicationId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // On success, navigate back to dashboard or show a success message
            alert('Application deleted successfully!'); // Simple feedback
            navigate('/dashboard'); // Go back to dashboard after deletion

        } catch (err) {
            if (err.response?.status === 403) {
                 setError('You do not have permission to delete this application.');
             } else if (err.response?.status === 404) {
                 setError('Application not found (it may have already been deleted).');
             } else {
                 setError('Failed to delete application. Please try again.');
             }
            console.error('Error deleting application:', err);
            setIsDeleting(false); // Re-enable button on error
        }
        // No finally needed, as we navigate away on success
    };

    const handleScheduleInterview = () => {
        navigate(`/applications/${applicationId}/schedule`); // Navigate to schedule form
    };

    const handleContactApplicant = () => {
        alert('Contact Applicant functionality not yet implemented.');
        // Later: Implement modal or other contact feature
    };

    // --- Render Logic ---

    // Initial loading or user not logged in
    if (!user) return <Navigate to="/login" replace />;
    if (loading) return <div className="loading">Loading application...</div>;
    // Handle errors after loading
    if (error) return <div className="error-message">{error}</div>;
    if (!application) return <div className="error-message">Application data could not be loaded.</div>;

    // Determine if the current user can perform actions (delete/schedule)
    // Only the employer who posted the job or an admin should perform these actions
    const canManageApplication = user.is_admin || (application.job && user.id === application.job.employer_id);

    return (
        <div className="view-application-container">
            <div className="view-application-card">
                <Link to="/dashboard" className="back-to-dashboard-link">&larr; Back to Dashboard</Link>

                <h2>Application Details</h2>

                <div className="application-info">
                    <p><strong>Applicant:</strong> {application.user?.name || 'N/A'} ({application.user?.email || 'N/A'})</p>
                    <p><strong>Job Title:</strong> {application.job?.job_title || 'N/A'}</p>
                    <p><strong>Date Applied:</strong> {new Date(application.created_at).toLocaleString()}</p>
                </div>

                <div className="application-files">
                    <h3>Documents</h3>
                    {downloadError && <p className="error-message download-error">{downloadError}</p>}
                    <ul>
                        <li>
                            <span>Resume:</span>
                            <button onClick={() => handleDownload('resume')} className="download-button">
                                <i className="fas fa-download"></i> Download Resume
                            </button>
                        </li>
                        {application.cover_letter_path && ( // Only show if cover letter exists
                            <li>
                                <span>Cover Letter:</span>
                                <button onClick={() => handleDownload('cover-letter')} className="download-button">
                                     <i className="fas fa-download"></i> Download Cover Letter
                                </button>
                            </li>
                        )}
                         {!application.cover_letter_path && (
                             <li>
                                <span>Cover Letter:</span>
                                <span>Not Provided</span>
                             </li>
                         )}
                    </ul>
                </div>

                {/* Show action buttons only to employer/admin */}
                {canManageApplication && (
                    <div className="application-actions">
                        <h3>Actions</h3>
                        <button
                            onClick={handleContactApplicant} // Use the new handler
                            className="action-button contact-button"
                            disabled={isDeleting} // Disable if deleting
                        >
                            <i className="fas fa-envelope"></i> Contact Applicant
                        </button>
                        <button onClick={handleScheduleInterview} className="action-button schedule-button">
                             <i className="fas fa-calendar-check"></i> Schedule Interview
                        </button>
                        <button onClick={handleDeleteApplication} className="action-button delete-button">
                            <i className="fas fa-trash-alt"></i> Delete Application
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewApplication;