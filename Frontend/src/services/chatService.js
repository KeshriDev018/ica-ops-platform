import api from '../lib/api';

/**
 * Chat Service - Real API Integration
 * All methods use the backend REST API for chat operations
 */

/**
 * Get all conversations for the authenticated user
 */
export const getUserConversations = async () => {
  try {
    const response = await api.get('/chat/conversations');
    return response.data;
  } catch (error) {
    console.error('Get conversations error:', error);
    throw error;
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (conversationType, participants, batchId = null) => {
  try {
    const response = await api.post('/chat/conversations', {
      conversationType,
      participants,
      batchId,
    });
    return response.data;
  } catch (error) {
    console.error('Create conversation error:', error);
    throw error;
  }
};

/**
 * Get messages for a specific conversation
 */
export const getConversationMessages = async (conversationId, skip = 0, limit = 50) => {
  try {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { skip, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
};

/**
 * Send a message (REST fallback - WebSocket preferred)
 */
export const sendMessage = async (conversationId, content, messageType = 'text') => {
  try {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      messageType,
    });
    return response.data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

/**
 * Upload a file to a conversation (batch chats only)
 */
export const uploadFile = async (conversationId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/chat/conversations/${conversationId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId, messageIds) => {
  try {
    const response = await api.patch(`/chat/conversations/${conversationId}/read`, {
      messageIds,
    });
    return response.data;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

/**
 * Get available contacts for creating conversations
 */
export const getAvailableContacts = async () => {
  try {
    const response = await api.get('/chat/contacts');
    return response.data;
  } catch (error) {
    console.error('Get contacts error:', error);
    throw error;
  }
};

/**
 * Get batch group chats accessible to the user
 */
export const getBatchGroupChats = async () => {
  try {
    const response = await api.get('/chat/batches');
    return response.data;
  } catch (error) {
    console.error('Get batch chats error:', error);
    throw error;
  }
};

// Legacy mock methods - DEPRECATED (kept for backward compatibility during migration)
const mockBatchMessages = {}
const mockDirectMessages = {}

const legacyChatService = {
  // DEPRECATED: Use getUserConversations instead
  getBatchMessages: async (batchId) => {
    console.warn('⚠️ getBatchMessages is deprecated. Use getUserConversations instead.');
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (!mockBatchMessages[batchId]) {
      mockBatchMessages[batchId] = [
        {
          message_id: `msg-${Date.now()}-1`,
          batch_id: batchId,
          sender_email: 'admin@chessacademy.com',
          sender_name: 'Admin',
          sender_role: 'ADMIN',
          content: 'Welcome to the batch chat! Feel free to ask questions here.',
          type: 'text',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    }
    
    return mockBatchMessages[batchId].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )
  },

  // DEPRECATED: Use sendMessage with WebSocket instead
  sendBatchMessage: async (batchId, senderEmail, content, type = 'text') => {
    console.warn('⚠️ sendBatchMessage is deprecated. Use sendMessage with WebSocket instead.');
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const newMessage = {
      message_id: `msg-${Date.now()}`,
      batch_id: batchId,
      sender_email: senderEmail,
      sender_name: 'User',
      sender_role: 'CUSTOMER',
      content,
      type,
      timestamp: new Date().toISOString()
    }

    if (!mockBatchMessages[batchId]) {
      mockBatchMessages[batchId] = []
    }
    
    mockBatchMessages[batchId].push(newMessage)
    
    return newMessage
  },

  // DEPRECATED: Use uploadFile with real API instead
  uploadFile: async (batchId, senderEmail, file) => {
    console.warn('⚠️ Legacy uploadFile is deprecated. Use real API uploadFile instead.');
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit')
    }

    const fileUrl = URL.createObjectURL(file)
    
    const message = await legacyChatService.sendBatchMessage(
      batchId,
      senderEmail,
      fileUrl,
      'file'
    )
    
    message.file_name = file.name
    message.file_size = file.size
    message.file_type = file.type
    
    return message
  },

  // DEPRECATED: Use getUserConversations and filter by type
  getDirectMessages: async (chatId, type) => {
    console.warn('⚠️ getDirectMessages is deprecated. Use getUserConversations instead.');
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const key = `${chatId}-${type}`
    if (!mockDirectMessages[key]) {
      mockDirectMessages[key] = []
    }
    
    return mockDirectMessages[key].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )
  },

  // DEPRECATED: Use sendMessage with WebSocket instead
  sendDirectMessage: async (chatId, type, senderEmail, recipientEmail, content) => {
    console.warn('⚠️ sendDirectMessage is deprecated. Use sendMessage with WebSocket instead.');
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const key = `${chatId}-${type}`
    const newMessage = {
      message_id: `msg-${Date.now()}`,
      chat_id: chatId,
      sender_email: senderEmail,
      recipient_email: recipientEmail,
      sender_name: 'User',
      sender_role: 'CUSTOMER',
      content,
      type: 'text',
      timestamp: new Date().toISOString()
    }

    if (!mockDirectMessages[key]) {
      mockDirectMessages[key] = []
    }
    
    mockDirectMessages[key].push(newMessage)
    
    return newMessage
  },

  // DEPRECATED: Use getAvailableContacts instead
  getAdminChats: async () => {
    console.warn('⚠️ getAdminChats is deprecated. Use getAvailableContacts instead.');
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return []
  },

  // DEPRECATED: Use conversation participants from backend instead
  getBatchParticipants: async (batchId) => {
    console.warn('⚠️ getBatchParticipants is deprecated. Use conversation data from backend.');
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {}
  }
}

// Export legacy methods for backward compatibility (will be removed in future)
export const {
  getBatchMessages,
  sendBatchMessage,
  getDirectMessages,
  sendDirectMessage,
  getAdminChats,
  getBatchParticipants
} = legacyChatService;

// Default export for backward compatibility
export default {
  getUserConversations,
  createConversation,
  getConversationMessages,
  sendMessage,
  uploadFile,
  markMessagesAsRead,
  getAvailableContacts,
  getBatchGroupChats,
  // Legacy methods (deprecated)
  getBatchMessages,
  sendBatchMessage,
  getDirectMessages,
  sendDirectMessage,
  getAdminChats,
  getBatchParticipants
};
