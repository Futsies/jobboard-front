import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import './ApplyForm.css';

const ApplyForm = () => {
    const { id: jobId } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [coverLetterFile, setCoverLetterFile] = useState(null);

    // --- Ensure these state variables are declared ---
    const [resumeFileName, setResumeFileName] = useState('');
    const [coverLetterFileName, setCoverLetterFileName] = useState('');
    // --- End State Declarations ---

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fetchingJob, setFetchingJob] = useState(true);

    // Fetch basic job info
    useEffect(() => {
        const fetchJobInfo = async () => {
            setFetchingJob(true);
            try {
                const response = await axios.get(`http://localhost:8000/api/jobs/${jobId}`);
                setJobTitle(response.data.job_title);
                setCompanyName(response.data.company_name);
            } catch (err) {
                console.error("Failed to fetch job info for apply form", err);
                setError('Could not load job information. Please go back and try again.');
            } finally {
                setFetchingJob(false);
            }
        };
        fetchJobInfo();
    }, [jobId]);


    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            setResumeFileName(file.name); // Store filename
        } else {
            setResumeFile(null);
            setResumeFileName('');
        }
    };

    const handleCoverLetterChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverLetterFile(file);
            setCoverLetterFileName(file.name); // Store filename
        } else {
            setCoverLetterFile(null);
            setCoverLetterFileName('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeFile) {
            setError('Resume file is required.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const applicationData = new FormData();
        applicationData.append('resume', resumeFile);
        if (coverLetterFile) {
            applicationData.append('cover_letter', coverLetterFile);
        }

        try {
            await axios.post(`http://localhost:8000/api/jobs/${jobId}/apply`, applicationData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            setSuccess('Application submitted successfully! Redirecting back to job details...');
            setResumeFile(null);
            setCoverLetterFile(null);
            setResumeFileName(''); // Clear filename display
            setCoverLetterFileName(''); // Clear filename display

            setTimeout(() => {
                navigate(`/jobs/${jobId}`);
            }, 2500);

        } catch (err) {
            if (err.response?.status === 409) {
                setError(err.response.data.message || 'You have already applied for this job.');
            } else if (err.response?.data?.errors) {
                 console.error('Validation Errors:', err.response.data.errors);
                 const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
                 setError(`Submission failed: ${errorMessages}`);
            }
            else {
                setError(err.response?.data?.message || 'An error occurred while submitting your application.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Route Protection
    if (!user) {
        return <Navigate to="/login" state={{ from: `/jobs/${jobId}/apply` }} replace />;
    }

    if (fetchingJob) {
         return <div className="loading">Loading application form...</div>;
    }

    return (
        <div className="apply-form-container">
            <div className="apply-form-card">
                <h2>Apply for {jobTitle || 'Job'}</h2>
                <p>at {companyName || 'Company'}</p>
                 <Link to={`/jobs/${jobId}`} className="back-to-job-link">
                    &larr; Back to Job Details
                </Link>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Resume Upload */}
                    <div className="form-group file-upload-group">
                        <label>Resume (Required)</label>
                        <div className="file-controls">
                            <label htmlFor="resume-upload" className="custom-file-upload">
                                Choose Resume
                            </label>
                            <input
                                id="resume-upload"
                                type="file"
                                name="resume"
                                onChange={handleResumeChange}
                                required
                                accept=".pdf,.doc,.docx"
                            />
                            {/* --- Ensure this uses resumeFileName --- */}
                            <span className="file-name">{resumeFileName || 'No file chosen'}</span>
                        </div>
                         <small className="file-instructions">Accepted formats: PDF, DOC, DOCX. Max size: 5MB.</small>
                    </div>

                    {/* Cover Letter Upload */}
                    <div className="form-group file-upload-group">
                        <label>Cover Letter (Optional)</label>
                        <div className="file-controls">
                            <label htmlFor="cover-letter-upload" className="custom-file-upload">
                                Choose Cover Letter
                            </label>
                            <input
                                id="cover-letter-upload"
                                type="file"
                                name="cover_letter"
                                onChange={handleCoverLetterChange}
                                accept=".pdf,.doc,.docx,.txt"
                            />
                             {/* --- Ensure this uses coverLetterFileName --- */}
                            <span className="file-name">{coverLetterFileName || 'No file chosen'}</span>
                        </div>
                        <small className="file-instructions">Accepted formats: PDF, DOC, DOCX, TXT. Max size: 2MB.</small>
                    </div>

                    {/* Error & Success Messages */}
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading || success}
                    >
                        {loading ? 'Submitting Application...' : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApplyForm;