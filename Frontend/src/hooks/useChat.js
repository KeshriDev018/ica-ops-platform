import { useState, useEffect, useCallback, useRef } from "react";
import { useChatContext } from "../contexts/ChatContext";
import * as chatService from "../services/chatService";

/**
 * Custom hook for managing chat state and operations
 */
export const useChat = (conversationId = null) => {
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage: sendSocketMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    onMessageReceived,
    onMessageRead,
    onTypingStart,
    onTypingStop,
    getTypingUsers,
    isUserOnline,
    getUnreadCount,
  } = useChatContext();

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const typingTimeoutRef = useRef(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatService.getUserConversations();
      setConversations(data);
    } catch (err) {
      setError(err.message || "Failed to load conversations");
      console.error("Load conversations error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (convId, skip = 0, limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatService.getConversationMessages(convId, skip, limit);
      
      if (skip === 0) {
        setMessages(data);
      } else {
        setMessages((prev) => [...data, ...prev]);
      }
      
      setHasMore(data.length === limit);
    } catch (err) {
      setError(err.message || "Failed to load messages");
      console.error("Load messages error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content, messageType = "text") => {
    if (!conversationId) {
      throw new Error("No conversation selected");
    }

    try {
      // Send via WebSocket if connected, otherwise use REST API
      if (isConnected) {
        const message = await sendSocketMessage(conversationId, content, messageType);
        return message;
      } else {
        // Fallback to REST API
        const message = await chatService.sendMessage(conversationId, content, messageType);
        setMessages((prev) => [...prev, message]);
        return message;
      }
    } catch (err) {
      setError(err.message || "Failed to send message");
      throw err;
    }
  }, [conversationId, isConnected, sendSocketMessage]);

  // Upload a file
  const uploadFile = useCallback(async (file) => {
    if (!conversationId) {
      throw new Error("No conversation selected");
    }

    try {
      const message = await chatService.uploadFile(conversationId, file);
      // File upload will trigger WebSocket event, but add to local state as backup
      setMessages((prev) => [...prev, message]);
      return message;
    } catch (err) {
      setError(err.message || "Failed to upload file");
      throw err;
    }
  }, [conversationId]);

  // Create a conversation
  const createConversation = useCallback(async (conversationType, participants, batchId = null) => {
    try {
      setLoading(true);
      setError(null);
      const conversation = await chatService.createConversation(conversationType, participants, batchId);
      setConversations((prev) => [conversation, ...prev]);
      return conversation;
    } catch (err) {
      setError(err.message || "Failed to create conversation");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds) => {
    if (!conversationId || !messageIds || messageIds.length === 0) return;

    try {
      // Mark via WebSocket
      markMessagesAsRead(conversationId, messageIds);
      
      // Also call REST API as backup
      await chatService.markMessagesAsRead(conversationId, messageIds);
      
      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id)
            ? { ...msg, isRead: true }
            : msg
        )
      );
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  }, [conversationId, markMessagesAsRead]);

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    startTyping(conversationId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);
  }, [conversationId, startTyping, stopTyping]);

  // Stop typing immediately
  const handleStopTyping = useCallback(() => {
    if (!conversationId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    stopTyping(conversationId);
  }, [conversationId, stopTyping]);

  // Get available contacts
  const loadContacts = useCallback(async () => {
    try {
      const contacts = await chatService.getAvailableContacts();
      return contacts;
    } catch (err) {
      console.error("Load contacts error:", err);
      return [];
    }
  }, []);

  // Get batch group chats
  const loadBatchChats = useCallback(async () => {
    try {
      const batches = await chatService.getBatchGroupChats();
      return batches;
    } catch (err) {
      console.error("Load batch chats error:", err);
      return [];
    }
  }, []);

  // Load messages when conversation changes (regardless of connection status)
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  // Join/leave conversation when WebSocket connects
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);

      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  // Subscribe to message events
  useEffect(() => {
    const unsubscribeMessage = onMessageReceived((message) => {
      if (!conversationId || message.conversationId === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
      }

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === message.conversationId
            ? { ...conv, lastMessage: message }
            : conv
        )
      );
    });

    const unsubscribeRead = onMessageRead(({ conversationId: convId, messageIds }) => {
      if (!conversationId || conversationId === convId) {
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg._id)
              ? { ...msg, isRead: true }
              : msg
          )
        );
      }
    });

    const unsubscribeTypingStart = onTypingStart(() => {
      // Handled in ChatContext
    });

    const unsubscribeTypingStop = onTypingStop(() => {
      // Handled in ChatContext
    });

    return () => {
      unsubscribeMessage();
      unsubscribeRead();
      unsubscribeTypingStart();
      unsubscribeTypingStop();
    };
  }, [conversationId, onMessageReceived, onMessageRead, onTypingStart, onTypingStop]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    messages,
    conversations,
    loading,
    error,
    hasMore,
    isConnected,

    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    uploadFile,
    createConversation,
    markAsRead,
    handleTyping,
    handleStopTyping,
    loadContacts,
    loadBatchChats,

    // Utilities
    getTypingUsers: () => getTypingUsers(conversationId),
    isUserOnline,
    getUnreadCount: () => getUnreadCount(conversationId),
  };
};
