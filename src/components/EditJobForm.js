import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
// We can reuse the same CSS as PostJobForm
import './PostJobForm.css';

const EditJobForm = () => {
    const { id } = useParams(); // Get job ID from URL
    const { user, token } = useAuth();
    const navigate = useNavigate();

    // Form state - initialize empty, will be filled by fetched data
    const [formData, setFormData] = useState({
        job_title: '',
        job_description: '',
        job_location: '',
        job_type: 'Full-time',
        salary: '',
        company_name: '',
        category: ''
    });

    const [companyLogo, setCompanyLogo] = useState(null); // For new logo upload
    const [previewUrl, setPreviewUrl] = useState(null); // Preview for new logo
    const [originalLogoUrl, setOriginalLogoUrl] = useState(''); // To display current logo

    const [loading, setLoading] = useState(true); // Start loading true to fetch data
    const [submitting, setSubmitting] = useState(false); // For submission state
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [canEdit, setCanEdit] = useState(false); // State to track edit permission

    // --- Fetch existing job data ---
    useEffect(() => {
        const fetchJobData = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:8000/api/jobs/${id}`);
                const jobData = response.data;

                // Authorization check: Must be admin or the job owner
                if (!user || (!user.is_admin && user.id !== jobData.employer_id)) {
                    setError('You do not have permission to edit this job.');
                    setCanEdit(false);
                    setLoading(false);
                    return; // Stop execution
                }

                setCanEdit(true); // User has permission

                // Populate form state with fetched data
                setFormData({
                    job_title: jobData.job_title || '',
                    job_description: jobData.job_description || '',
                    job_location: jobData.job_location || '',
                    job_type: jobData.job_type || 'Full-time',
                    salary: jobData.salary || '',
                    company_name: jobData.company_name || '',
                    category: jobData.category || ''
                });

                // Set the original logo URL
                if (jobData.company_logo && !jobData.company_logo.startsWith('http')) {
                    setOriginalLogoUrl(`http://localhost:8000/storage/${jobData.company_logo}`);
                } else if (jobData.company_logo) {
                    setOriginalLogoUrl(jobData.company_logo);
                } else {
                    setOriginalLogoUrl('/default-logo.png'); // Use default if none exists
                }

            } catch (err) {
                setError('Failed to load job data. The job may not exist.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) { // Only fetch if user is logged in (basic check)
             fetchJobData();
        } else {
             setLoading(false);
             setError("Please log in to edit jobs."); // Handle case where user is not logged in
        }
    }, [id, user]); // Re-fetch if ID or user changes

    // --- Form Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCompanyLogo(file); // Store the file object
            // Create and set preview URL
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl); // Clean up old preview
            }
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Cleanup effect for preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canEdit) return; // Prevent submission if user lacks permission

        setSubmitting(true);
        setError('');
        setSuccess('');

        const updateData = new FormData();
        // Append all text fields
        for (const key in formData) {
             if (key !== 'salary') {
                updateData.append(key, formData[key]);
            }
        }
        // Handle salary
        const salaryValue = parseFloat(formData.salary);
        if (!isNaN(salaryValue) && salaryValue >= 0) {
            updateData.append('salary', salaryValue.toString());
        }

        // Append new logo file if selected
        if (companyLogo) {
            updateData.append('company_logo', companyLogo);
        }

        try {
            // This API endpoint doesn't exist yet
            // Use POST because HTML forms don't support PUT with multipart/form-data directly
            await axios.post(`http://localhost:8000/api/jobs/${id}`, updateData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            setSuccess('Job updated successfully! Redirecting back...');
            // Maybe update originalLogoUrl if a new one was uploaded and successful?
            // Optional: reset file input/preview if needed

            setTimeout(() => {
                navigate(`/jobs/${id}`); // Navigate back to the job view page
            }, 2000);

        } catch (err) {
             if (err.response && err.response.data && err.response.data.errors) {
                 console.error('Validation Errors:', err.response.data.errors);
                 const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
                 setError(`Validation failed: ${errorMessages}`);
            } else {
                 setError(err.response?.data?.message || 'An error occurred. Please check your inputs and try again.');
            }
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="loading">Loading job data for editing...</div>;
    }

    // Handle case where user isn't logged in or doesn't have permission after fetch attempt
    if (!user || !canEdit) {
         return <Navigate to="/" replace />; // Redirect if not allowed
    }

     if (error && !canEdit) { // Show specific error if permission denied
        return <div className="error-message">{error}</div>;
    }


    return (
        <div className="post-job-container">
            <div className="post-job-card"> 
                <h2>Edit Job Listing</h2>
                <p>Update the details for "{formData.job_title}".</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Job Title */}
                    <div className="form-group">
                        <label htmlFor="job_title">Job Title</label>
                        <input type="text" id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} required />
                    </div>

                    {/* Company Name */}
                    <div className="form-group">
                        <label htmlFor="company_name">Company Name</label>
                        <input type="text" id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} required />
                    </div>

                    {/* Job Description */}
                    <div className="form-group">
                        <label htmlFor="job_description">Job Description</label>
                        <textarea id="job_description" name="job_description" value={formData.job_description} onChange={handleChange} rows="6" required></textarea>
                    </div>

                    {/* Job Location & Category */}
                    <div className="form-group-row">
                        <div className="form-group">
                            <label htmlFor="job_location">Job Location</label>
                            <input type="text" id="job_location" name="job_location" value={formData.job_location} onChange={handleChange} placeholder="e.g., 'New York, NY' or 'Remote'" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., 'Engineering' or 'Marketing'" required />
                        </div>
                    </div>

                    {/* Job Type & Salary */}
                    <div className="form-group-row">
                        <div className="form-group">
                            <label htmlFor="job_type">Job Type</label>
                            <select id="job_type" name="job_type" value={formData.job_type} onChange={handleChange}>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="salary">Salary (Optional)</label>
                            <input type="number" id="salary" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g., 85000" min="0"/>
                        </div>
                    </div>

                    {/* Company Logo Upload */}
                    <div className="form-group company-logo-section">
                        <label>Company Logo (Optional)</label>
                        <div className="company-logo-controls">
                            <img
                                src={previewUrl || originalLogoUrl} // Show preview if available, else original
                                alt="Company Logo Preview"
                                className="company-logo-preview-image"
                            />
                            <label htmlFor="company-logo-input" className="custom-file-upload">
                                Change Logo
                            </label>
                            <input
                                id="company-logo-input"
                                type="file"
                                name="company_logo"
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/gif, image/webp"
                            />
                        </div>
                    </div>

                    {/* Error & Success Messages */}
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {/* Submit Button */}
                    <button type="submit" className="auth-button" disabled={submitting || !canEdit}>
                        {submitting ? 'Updating Job...' : 'Update Job Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditJobForm;