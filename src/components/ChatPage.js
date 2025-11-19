import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import MessageWindow from './MessageWindow';
import './ChatPage.css';

const ChatPage = () => {
    const { user } = useAuth();
    // This state is lifted up, so both components can know
    // which conversation is currently active.
    const [selectedConversationId, setSelectedConversationId] = useState(null);

    // Protect the route
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="chat-page-container">
            <aside className="chat-sidebar">
                <div className="chat-sidebar-header">My Chats</div>
                <ConversationList
                    onSelectConversation={setSelectedConversationId}
                    activeConversationId={selectedConversationId}
                />
            </aside>
            <main className="chat-window">
                <MessageWindow conversationId={selectedConversationId} />
            </main>
        </div>
    );
};

export default ChatPage;