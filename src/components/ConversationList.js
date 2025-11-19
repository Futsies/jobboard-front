import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// onSelectConversation is a function passed from the parent (ChatPage)
// activeConversationId is also from the parent, to highlight the active chat
const ConversationList = ({ onSelectConversation, activeConversationId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        const fetchConversations = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const response = await axios.get(
                    'http://localhost:8000/api/conversations',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // We are using 'latest_message' (snake_case) from Laravel
                // and 'users' which is an array of other participants.
                setConversations(response.data);
            } catch (err) {
                setError('Failed to load conversations.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [token]);

    const getParticipant = (users) => {
        // The backend controller filters out the logged-in user,
        // so 'users[0]' is the person we are talking to.
        return users[0] || { name: 'Unknown User' };
    };

    if (loading) return <div className="convo-loading">Loading chats...</div>;
    if (error) return <div className="convo-error">{error}</div>;

    return (
        <div className="conversation-list">
            {conversations.length === 0 ? (
                <div className="convo-empty">No conversations found.</div>
            ) : (
                conversations.map((convo) => {
                    const participant = getParticipant(convo.users);
                    return (
                        <div
                            key={convo.id}
                            className={`conversation-item ${convo.id === activeConversationId ? 'active' : ''}`}
                            onClick={() => onSelectConversation(convo.id)}
                        >
                            <div className="convo-name">{participant.name}</div>
                            <div className="convo-latest-message">
                                {convo.latest_message ? convo.latest_message.body : 'No messages yet...'}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ConversationList;