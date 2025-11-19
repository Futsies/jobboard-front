import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MessageWindow = ({ conversationId }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const { user, token } = useAuth();
    const messagesEndRef = useRef(null); // Ref to auto-scroll to bottom

    // Helper function to scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Effect to scroll down when new messages are loaded
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Effect to fetch messages and set up polling when conversationId changes
    useEffect(() => {
        // If no chat is selected, clear everything
        if (!conversationId) {
            setMessages([]);
            setError('');
            setLoading(false);
            return;
        }

        let isMounted = true; // Handle component unmounting
        
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/conversations/${conversationId}/messages`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (isMounted) {
                    setMessages(response.data);
                    setError('');
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load messages.');
                }
                console.error(err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMessages(); // Fetch immediately

        // Set up polling to check for new messages every 5 seconds
        const pollInterval = setInterval(fetchMessages, 5000);

        // Cleanup function
        return () => {
            isMounted = false;
            clearInterval(pollInterval); // Stop polling when component unmounts or convo changes
        };
    }, [conversationId, token]);

    // Handle sending a new message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        try {
            const response = await axios.post(
                `http://localhost:8000/api/conversations/${conversationId}/messages`,
                { body: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Add the new message to state immediately for a fast UI
            setMessages(prevMessages => [...prevMessages, response.data]);
            setNewMessage(''); // Clear the input
            scrollToBottom(); // Scroll to the new message
        } catch (err) {
            setError('Failed to send message.');
            console.error(err);
        }
    };

    // --- Render Logic ---

    // Case 1: No conversation selected
    if (!conversationId) {
        return <div className="chat-window-select">Select a conversation to start chatting.</div>;
    }

    // Case 2: Loading messages
    if (loading && messages.length === 0) {
        return <div className="chat-window-select">Loading messages...</div>;
    }

    // Case 3: Error
    if (error) {
        return <div className="chat-window-select error-message">{error}</div>;
    }

    // Case 4: Display chat
    return (
        <div className="chat-window">
            <div className="messages-list">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${msg.user_id === user.id ? 'my-message' : 'their-message'}`}
                    >
                        <div className="message-sender">{msg.user.name}</div>
                        {msg.body}
                    </div>
                ))}
                {/* This empty div is the target for auto-scrolling */}
                <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="message-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                    type="submit"
                    className="message-send-button"
                    disabled={newMessage.trim() === ''}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default MessageWindow;