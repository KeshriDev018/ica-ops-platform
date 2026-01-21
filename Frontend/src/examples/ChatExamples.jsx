/**
 * Example: How to use the Chat System in your components
 * 
 * This file demonstrates the proper usage of the chat hooks and context
 */

import React, { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useChatContext } from '../contexts/ChatContext';

/**
 * Example 1: Conversation List Component
 */
export const ConversationListExample = () => {
  const { loadConversations, conversations, loading } = useChat();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  if (loading) return <div>Loading conversations...</div>;

  return (
    <div>
      <h2>Conversations</h2>
      {conversations.map((conv) => (
        <div key={conv._id}>
          <p>{conv.conversationType === 'BATCH_GROUP' ? '🎓 Batch Chat' : '💬 Direct Chat'}</p>
          <p>{conv.lastMessage?.content || 'No messages yet'}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * Example 2: Chat Messages Component
 */
export const ChatMessagesExample = ({ conversationId }) => {
  const {
    messages,
    loading,
    sendMessage,
    handleTyping,
    handleStopTyping,
    getTypingUsers,
    isConnected,
  } = useChat(conversationId);

  const [inputValue, setInputValue] = useState('');
  const typingUsers = getTypingUsers();

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    try {
      await sendMessage(inputValue);
      setInputValue('');
      handleStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    handleTyping(); // Auto-debounced
  };

  return (
    <div>
      <div className="connection-status">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <div className="messages">
        {loading ? (
          <div>Loading messages...</div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id}>
              <strong>{msg.senderName}:</strong> {msg.content}
            </div>
          ))
        )}
      </div>

      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.map((u) => u.userName).join(', ')} is typing...
        </div>
      )}

      <div className="input-area">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

/**
 * Example 3: File Upload in Batch Chat
 */
export const FileUploadExample = ({ conversationId }) => {
  const { uploadFile } = useChat(conversationId);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      alert('File size cannot exceed 10MB');
      return;
    }

    try {
      setUploading(true);
      await uploadFile(file);
      alert('File uploaded successfully!');
    } catch (error) {
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

/**
 * Example 4: Create New Conversation
 */
export const CreateConversationExample = () => {
  const { createConversation, loadContacts } = useChat();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    loadContacts().then(setContacts);
  }, [loadContacts]);

  const handleCreateDirectChat = async () => {
    if (!selectedContact) return;

    try {
      const conversation = await createConversation(
        'DIRECT',
        [
          { accountId: selectedContact.accountId, role: selectedContact.role },
          // Current user is auto-added by backend
        ]
      );

      console.log('Conversation created:', conversation);
      // Navigate to the new conversation
    } catch (error) {
      alert('Failed to create conversation: ' + error.message);
    }
  };

  return (
    <div>
      <h3>Start New Chat</h3>
      <select onChange={(e) => setSelectedContact(contacts.find(c => c.accountId === e.target.value))}>
        <option value="">Select a contact</option>
        {contacts.map((contact) => (
          <option key={contact.accountId} value={contact.accountId}>
            {contact.name} ({contact.role})
          </option>
        ))}
      </select>
      <button onClick={handleCreateDirectChat} disabled={!selectedContact}>
        Start Chat
      </button>
    </div>
  );
};

/**
 * Example 5: Online Status Indicator
 */
export const OnlineStatusExample = ({ userId }) => {
  const { isUserOnline } = useChatContext();

  return (
    <span>
      {isUserOnline(userId) ? '🟢 Online' : '⚫ Offline'}
    </span>
  );
};

/**
 * Example 6: Unread Count Badge
 */
export const UnreadCountExample = ({ conversationId }) => {
  const { getUnreadCount } = useChat(conversationId);
  const unreadCount = getUnreadCount();

  if (unreadCount === 0) return null;

  return (
    <span className="badge">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

/**
 * Example 7: Listen to Real-Time Events
 */
export const RealTimeEventsExample = () => {
  const { onMessageReceived, onConversationCreated } = useChatContext();

  useEffect(() => {
    // Subscribe to new messages
    const unsubscribeMessage = onMessageReceived((message) => {
      console.log('New message received:', message);
      // Show notification, update UI, etc.
    });

    // Subscribe to new conversations
    const unsubscribeConv = onConversationCreated((conversation) => {
      console.log('New conversation:', conversation);
      // Add to conversation list
    });

    // Cleanup
    return () => {
      unsubscribeMessage();
      unsubscribeConv();
    };
  }, [onMessageReceived, onConversationCreated]);

  return <div>Listening to real-time events...</div>;
};

/**
 * Example 8: Complete Chat Component
 */
export const CompleteChatExample = ({ conversationId }) => {
  const {
    messages,
    loading,
    isConnected,
    sendMessage,
    uploadFile,
    handleTyping,
    handleStopTyping,
    getTypingUsers,
    markAsRead,
  } = useChat(conversationId);

  const [input, setInput] = useState('');
  const messagesEndRef = React.useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      const unreadIds = messages.filter(m => !m.isRead).map(m => m._id);
      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }
    }
  }, [messages, markAsRead]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      await sendMessage(input);
      setInput('');
      handleStopTyping();
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadFile(file);
    } catch (error) {
      alert(error.message);
    }
  };

  const typingUsers = getTypingUsers();

  return (
    <div className="chat-container">
      {/* Connection Status */}
      <div className="status-bar">
        {isConnected ? '🟢 Live' : '🔴 Reconnecting...'}
      </div>

      {/* Messages */}
      <div className="messages-container">
        {loading ? (
          <div>Loading...</div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`message ${msg.messageType}`}>
              <div className="sender">{msg.senderName}</div>
              <div className="content">
                {msg.messageType === 'file' ? (
                  <a href={msg.fileMetadata?.fileUrl} target="_blank" rel="noopener noreferrer">
                    📎 {msg.fileMetadata?.fileName}
                  </a>
                ) : (
                  msg.content
                )}
              </div>
              <div className="timestamp">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.map((u) => u.userName).join(', ')} typing...
        </div>
      )}

      {/* Input Area */}
      <div className="input-container">
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button onClick={() => document.getElementById('file-upload').click()}>
          📎
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={!input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};
