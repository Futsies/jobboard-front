import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './UserSettings.css';

const UserSettings = ({ user, onUpdate }) => {
    const { token } = useContext(AuthContext);
    const [name, setName] = useState(user.name);
    const [description, setDescription] = useState(user.description || '');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
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
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (profilePhoto) {
            formData.append('profile_photo', profilePhoto);
        }

        try {
            const response = await axios.post(`http://localhost:8000/api/users/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.profile_photo && !response.data.profile_photo.startsWith('http')) {
                response.data.profile_photo = `http://localhost:8000/storage/${response.data.profile_photo}`;
            }
            
            onUpdate(response.data);
            setSuccess('Profile updated successfully!');

        } catch (error) {
            setError('Failed to update profile. Please try again.');
            console.error('Error updating profile:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="user-settings">
            <h2>Settings</h2>
            <form onSubmit={handleSubmit}>
                {/* --- START OF CHANGES --- */}
                <div className="form-group profile-photo-section">
                    <label>Profile Photo</label>
                    <div className="profile-photo-controls">
                        <img 
                            src={previewUrl || user.profile_photo || '/default-avatar.png'} 
                            alt="Profile Preview" 
                            className="profile-preview-image"
                        />
                        {/* A styled label that triggers the hidden file input */}
                        <label htmlFor="profile-photo-upload" className="custom-file-upload">
                            Change Photo
                        </label>
                        {/* The actual file input, now hidden */}
                        <input
                            id="profile-photo-upload"
                            type="file"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            accept="image/png, image/jpeg, image/gif, image/webp"
                        />
                    </div>
                </div>
                {/* --- END OF CHANGES --- */}

                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                    ></textarea>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default UserSettings;