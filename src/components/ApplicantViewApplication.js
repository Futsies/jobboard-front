import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './ViewApplication.css'; // We can reuse the same CSS

const ApplicantViewApplication = () => {
    const { applicationId } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [downloadError, setDownloadError] = useState('');

    // Fetch application details
    useEffect(() => {
        const fetchApplication = async () => {
            if (!token) return;
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/applications/${applicationId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // --- Authorization Check ---
                // Ensure the person viewing this IS the applicant
                if (user.id !== response.data.user_id) {
                     setError('You do not have permission to view this application.');
                     setApplication(null);
                } else {
                    setApplication(response.data);
                }
            } catch (err) {
                 if (err.response?.status === 404) {
                     setError('Application not found.');
                 } else {
                     setError('Failed to load application details.');
                 }
                console.error("Error fetching application:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [applicationId, token, user]);

    // Function to handle file downloads securely
    const handleDownload = async (fileType) => {
        setDownloadError(''); 
        const url = `http://localhost:8000/api/applications/${applicationId}/${fileType}`; 

        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', 
            });

            const contentDisposition = response.headers['content-disposition'];
            let filename = `${fileType}_application_${applicationId}.file`; 
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

        } catch (err) {
             if (err.response?.status === 404) {
                 setDownloadError(`${fileType.replace('-', ' ')} file not found.`);
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
        if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        setError(''); 

        try {
            await axios.delete(
                `http://localhost:8000/api/applications/${applicationId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            navigate('/applications'); // Go back to "My Applications"

        } catch (err) {
            if (err.response?.status === 403) {
                 setError('You do not have permission to perform this action.');
             } else if (err.response?.status === 404) {
                 setError('Application not found.');
             } else {
                 setError('Failed to withdraw application. Please try again.');
             }
            console.error('Error withdrawing application:', err);
            setIsDeleting(false); 
        }
    };

    // --- Render Logic ---
    if (!user) return <Navigate to="/login" replace />;
    if (loading) return <div className="loading">Loading application...</div>;
    if (error) return <div className="error-message">{error}</div>; // Show error if permission denied or not found
    if (!application) return <div className="error-message">Application data could not be loaded.</div>;

    // This page is only for the applicant, so we just show their view
    return (
        <div className="view-application-container">
            <div className="view-application-card">
                <Link to="/applications" className="back-to-dashboard-link">&larr; Back to My Applications</Link>

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

                {/* Show "Withdraw" Button for Applicant */}
                <div className="application-actions">
                    <h3>My Actions</h3>
                    <button
                        onClick={handleDeleteApplication}
                        className="action-button delete-button"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <><i className="fas fa-spinner fa-spin"></i> Withdrawing...</>
                        ) : (
                            <><i className="fas fa-trash-alt"></i> Withdraw Application</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicantViewApplication;