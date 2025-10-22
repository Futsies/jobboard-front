import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './BecomeEmployerForm.css';
import { Navigate } from 'react-router-dom';

const BecomeEmployerForm = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user, token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // This endpoint doesn't exist yet. We will create it in the next step.
            const response = await axios.post('http://localhost:8000/api/request-employer-role', 
                { message },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            setSuccess(response.data.message || 'Your request has been sent! We will get in touch with you soon.');
            setMessage('');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // If a user is not logged in, redirect them to the login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="employer-form-container">
            <div className="employer-form-card">
                <h2>Looks like you're not registered as an employer :\</h2>
                <p>
                    To receive the employer role, please contact us by filling in the form below and we'll get in touch with you as soon as possible.
                </p>
                <p className="form-instructions">
                    Please include relevant information, such as your company name, your role in the company, and why you'd like to post jobs.
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="message">Your Message</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            placeholder="Tell us about you and your company..."
                            rows="6"
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BecomeEmployerForm;