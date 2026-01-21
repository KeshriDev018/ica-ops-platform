import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const ChatContext = createContext(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map()); // conversationId -> Set of users
  const [unreadCounts, setUnreadCounts] = useState(new Map()); // conversationId -> count
  
  const { isLoggedIn, user, token } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!isLoggedIn || !token) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000", {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;

    // Connection events
    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
      setSocket(newSocket);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      setIsConnected(false);
    });

    // Online status events
    newSocket.on("user:online", ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    newSocket.on("user:offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [isLoggedIn, token]);

  // Join a conversation room
  const joinConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit("conversation:join", { conversationId });
    }
  }, [socket, isConnected]);

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit("conversation:leave", { conversationId });
      
      // Clear typing status for this conversation
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(conversationId);
        return newMap;
      });
    }
  }, [socket, isConnected]);

  // Send a message
  const sendMessage = useCallback((conversationId, content, messageType = "text") => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      socket.emit("message:send", {
        conversationId,
        content,
        messageType,
      }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.message);
        }
      });
    });
  }, [socket, isConnected]);

  // Mark messages as read
  const markMessagesAsRead = useCallback((conversationId, messageIds) => {
    if (socket && isConnected && messageIds.length > 0) {
      socket.emit("message:read", {
        conversationId,
        messageIds,
      });

      // Clear unread count for this conversation
      setUnreadCounts((prev) => {
        const newMap = new Map(prev);
        newMap.set(conversationId, 0);
        return newMap;
      });
    }
  }, [socket, isConnected]);

  // Start typing indicator
  const startTyping = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit("typing:start", { conversationId });
    }
  }, [socket, isConnected]);

  // Stop typing indicator
  const stopTyping = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit("typing:stop", { conversationId });
    }
  }, [socket, isConnected]);

  // Notify conversation created
  const notifyConversationCreated = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit("conversation:created", { conversationId });
    }
  }, [socket, isConnected]);

  // Subscribe to message events
  const onMessageReceived = useCallback((callback) => {
    if (!socket) return () => {};

    const handler = (message) => {
      // Increment unread count if not in active conversation
      setUnreadCounts((prev) => {
        const newMap = new Map(prev);
        const currentCount = newMap.get(message.conversationId) || 0;
        newMap.set(message.conversationId, currentCount + 1);
        return newMap;
      });

      callback(message);
    };

    socket.on("message:receive", handler);
    return () => socket.off("message:receive", handler);
  }, [socket]);

  // Subscribe to message read events
  const onMessageRead = useCallback((callback) => {
    if (!socket) return () => {};

    socket.on("message:read", callback);
    return () => socket.off("message:read", callback);
  }, [socket]);

  // Subscribe to typing start events
  const onTypingStart = useCallback((callback) => {
    if (!socket) return () => {};

    const handler = ({ conversationId, userId, userName }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        const users = newMap.get(conversationId) || new Set();
        users.add({ userId, userName });
        newMap.set(conversationId, users);
        return newMap;
      });

      callback({ conversationId, userId, userName });
    };

    socket.on("typing:start", handler);
    return () => socket.off("typing:start", handler);
  }, [socket]);

  // Subscribe to typing stop events
  const onTypingStop = useCallback((callback) => {
    if (!socket) return () => {};

    const handler = ({ conversationId, userId }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        const users = newMap.get(conversationId);
        if (users) {
          const newUsers = new Set(
            Array.from(users).filter((u) => u.userId !== userId)
          );
          if (newUsers.size > 0) {
            newMap.set(conversationId, newUsers);
          } else {
            newMap.delete(conversationId);
          }
        }
        return newMap;
      });

      callback({ conversationId, userId });
    };

    socket.on("typing:stop", handler);
    return () => socket.off("typing:stop", handler);
  }, [socket]);

  // Subscribe to new conversation events
  const onConversationCreated = useCallback((callback) => {
    if (!socket) return () => {};

    socket.on("conversation:new", callback);
    return () => socket.off("conversation:new", callback);
  }, [socket]);

  // Get typing users for a conversation
  const getTypingUsers = useCallback((conversationId) => {
    const users = typingUsers.get(conversationId);
    return users ? Array.from(users) : [];
  }, [typingUsers]);

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  // Get unread count for conversation
  const getUnreadCount = useCallback((conversationId) => {
    return unreadCounts.get(conversationId) || 0;
  }, [unreadCounts]);

  const value = {
    socket,
    isConnected,
    onlineUsers: Array.from(onlineUsers),
    
    // Actions
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    notifyConversationCreated,
    
    // Event subscriptions
    onMessageReceived,
    onMessageRead,
    onTypingStart,
    onTypingStop,
    onConversationCreated,
    
    // Utilities
    getTypingUsers,
    isUserOnline,
    getUnreadCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
