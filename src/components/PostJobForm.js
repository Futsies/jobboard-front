import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import './PostJobForm.css';

const PostJobForm = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        job_title: '',
        job_description: '',
        job_location: '',
        job_type: 'Full-time',
        salary: '',
        company_name: '',
        category: ''
    });
    
    const [companyLogo, setCompanyLogo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
            setCompanyLogo(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const postData = new FormData();
        
        // Append all text fields
        for (const key in formData) {
            if (key !== 'salary') { // Skip salary for now
                postData.append(key, formData[key]);
            }
        }

        // Handle salary separately: append only if it's a valid number
        // Otherwise, the backend rule 'nullable' will handle it.
        const salaryValue = parseFloat(formData.salary);
        if (!isNaN(salaryValue) && salaryValue >= 0) {
            postData.append('salary', salaryValue.toString()); // Append as string, backend will cast
        }

        // Add the employer_id from the logged-in user
        postData.append('employer_id', user.id);
        
        // Append the file
        if (companyLogo) {
            postData.append('company_logo', companyLogo);
        }

        // Log the FormData entries just before sending
        console.log("Data being sent to API:");
        for (let pair of postData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        try {
            await axios.post('http://localhost:8000/api/jobs', postData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Your job has been posted successfully! Redirecting to homepage...');
            
            setFormData({
                job_title: '', job_description: '', job_location: '',
                job_type: 'Full-time', salary: '', company_name: '', category: ''
            });
            setCompanyLogo(null);

            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please check your inputs and try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user || !user.is_employer) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="post-job-container">
            <div className="post-job-card">
                <h2>Post a New Job</h2>
                <p>Fill out the details below to publish your job listing.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="job_title">Job Title</label>
                        <input
                            type="text"
                            id="job_title"
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="company_name">Company Name</label>
                        <input
                            type="text"
                            id="company_name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="job_description">Job Description</label>
                        <textarea
                            id="job_description"
                            name="job_description"
                            value={formData.job_description}
                            onChange={handleChange}
                            rows="6"
                            required
                        ></textarea>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label htmlFor="job_location">Job Location</label>
                            <input
                                type="text"
                                id="job_location"
                                name="job_location"
                                value={formData.job_location}
                                onChange={handleChange}
                                placeholder="e.g., 'New York, NY' or 'Remote'"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g., 'Engineering' or 'Marketing'"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label htmlFor="job_type">Job Type</label>
                            <select
                                id="job_type"
                                name="job_type"
                                value={formData.job_type}
                                onChange={handleChange}
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="salary">Salary (Optional)</label>
                            <input
                                type="number"
                                id="salary"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="e.g., 85000"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group company-logo-section"> 
                        <label>Company Logo (Optional)</label>
                        <div className="company-logo-controls"> 
                            <img
                                src={previewUrl || '/default-logo.png'} 
                                alt="Company Logo Preview"
                                className="company-logo-preview-image" 
                            />
                            <label htmlFor="company-logo-input" className="custom-file-upload">
                                Upload Logo
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

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Posting Job...' : 'Post Job Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostJobForm;