import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create the context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Helper function to process user data and create the full photo URL
const processUserData = (userData) => {
    if (userData && userData.profile_photo && !userData.profile_photo.startsWith('http')) {
        return {
            ...userData,
            profile_photo: `http://localhost:8000/storage/${userData.profile_photo}`
        };
    }
    return userData;
};

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [error, setError] = useState(null); // Your error state is back
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('http://localhost:8000/api/user')
                .then(response => {
                    const processedUser = processUserData(response.data);
                    setUser(processedUser);
                })
                .catch(() => {
                    // If token is invalid, log the user out
                    localStorage.removeItem('token');
                    setUser(null);
                    setToken(null);
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (credentials) => {
        try {
            setError(null); // Reset error state
            const response = await axios.post('http://localhost:8000/api/login', credentials);
            const { access_token, user: userData } = response.data;
            
            localStorage.setItem('token', access_token);
            setToken(access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            
            const processedUser = processUserData(userData);
            setUser(processedUser);
            
            navigate('/'); // Navigate to homepage on successful login
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(err.response?.data?.message || 'Login failed');
            console.error(err);
            return { success: false, error: errorMessage };
        }
    };
    
    const register = async (userData) => {
        try {
            setError(null); // Reset error state
            const response = await axios.post('http://localhost:8000/api/register', userData);
            const { access_token, user: newUserData } = response.data;
            
            localStorage.setItem('token', access_token);
            setToken(access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            const processedUser = processUserData(newUserData);
            setUser(processedUser);
            
            navigate('/'); // Navigate to homepage on successful registration
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            console.error(err);
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    const updateUser = (newUserData) => {
        const processedUser = processUserData(newUserData);
        setUser(processedUser);
    };

    // The value provided to the context consumers
    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};