import { Server } from "socket.io";
import { socketAuth } from "./socketAuth.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { Account } from "../models/account.model.js";
import { Student } from "../models/student.model.js";

// Store online users: userId -> socketId
const onlineUsers = new Map();

// Store typing status: conversationId -> Set of userIds
const typingUsers = new Map();

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? [process.env.FRONTEND_URL]
          : [process.env.CORS_ORIGIN],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected: ${socket.user.email} (${userId})`);

    // Store user's socket
    onlineUsers.set(userId, socket.id);

    // Notify others that user is online
    socket.broadcast.emit("user:online", { userId });

    // Join user to their personal room
    socket.join(userId);

    // Join user to their conversation rooms
    joinUserConversations(socket, userId);

    // ==================== MESSAGE EVENTS ====================

    /**
     * Send a new message
     */
    socket.on("message:send", async (data, callback) => {
      try {
        const { conversationId, content, messageType = "text" } = data;

        // Validate conversation access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return callback({ error: "Conversation not found" });
        }

        const isParticipant = conversation.participants.some(
          (p) => p.accountId.toString() === userId
        );

        if (!isParticipant) {
          return callback({ error: "Access denied" });
        }

        // Get sender name
        let senderName = "User";
        const userRole = socket.user.role;

        if (userRole === "ADMIN") {
          senderName = "Admin";
        } else if (userRole === "COACH") {
          const account = await Account.findById(userId);
          senderName = account?.email?.split("@")[0] || "Coach";
        } else if (userRole === "CUSTOMER") {
          const student = await Student.findOne({ accountId: userId });
          senderName = student?.parentName || "Parent";
        }

        // Create message
        const message = await Message.create({
          conversationId,
          senderId: userId,
          senderName,
          senderRole: userRole,
          content,
          messageType,
        });

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            content,
            senderId: userId,
            timestamp: new Date(),
          },
        });

        await message.populate("senderId", "email role");

        // Emit to all participants in the conversation
        io.to(conversationId).emit("message:receive", message);

        // Send success callback
        callback({ success: true, message });

        // Clear typing indicator
        clearTypingStatus(conversationId, userId, io);
      } catch (error) {
        console.error("Send message error:", error);
        callback({ error: error.message || "Failed to send message" });
      }
    });

    /**
     * Mark messages as read
     */
    socket.on("message:read", async (data) => {
      try {
        const { conversationId, messageIds } = data;

        if (!messageIds || messageIds.length === 0) {
          return;
        }

        // Mark all messages as read
        await Promise.all(
          messageIds.map((msgId) => Message.markAsRead(msgId, userId))
        );

        // Notify other participants
        socket.to(conversationId).emit("message:read", {
          conversationId,
          userId,
          messageIds,
        });
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    });

    // ==================== TYPING INDICATORS ====================

    /**
     * User starts typing
     */
    socket.on("typing:start", async (data) => {
      try {
        const { conversationId } = data;

        // Validate conversation access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.accountId.toString() === userId
        );

        if (!isParticipant) return;

        // Add to typing users
        if (!typingUsers.has(conversationId)) {
          typingUsers.set(conversationId, new Set());
        }
        typingUsers.get(conversationId).add(userId);

        // Get sender name
        let senderName = "User";
        const userRole = socket.user.role;

        if (userRole === "ADMIN") {
          senderName = "Admin";
        } else if (userRole === "COACH") {
          const account = await Account.findById(userId);
          senderName = account?.email?.split("@")[0] || "Coach";
        } else if (userRole === "CUSTOMER") {
          const student = await Student.findOne({ accountId: userId });
          senderName = student?.parentName || "Parent";
        }

        // Notify other participants
        socket.to(conversationId).emit("typing:start", {
          conversationId,
          userId,
          userName: senderName,
        });
      } catch (error) {
        console.error("Typing start error:", error);
      }
    });

    /**
     * User stops typing
     */
    socket.on("typing:stop", (data) => {
      try {
        const { conversationId } = data;

        clearTypingStatus(conversationId, userId, io, socket);
      } catch (error) {
        console.error("Typing stop error:", error);
      }
    });

    // ==================== CONVERSATION EVENTS ====================

    /**
     * Join a conversation room
     */
    socket.on("conversation:join", async (data) => {
      try {
        const { conversationId } = data;

        // Validate access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.accountId.toString() === userId
        );

        if (!isParticipant) return;

        socket.join(conversationId);
        console.log(`User ${userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error("Join conversation error:", error);
      }
    });

    /**
     * Leave a conversation room
     */
    socket.on("conversation:leave", (data) => {
      try {
        const { conversationId } = data;
        socket.leave(conversationId);
        clearTypingStatus(conversationId, userId, io, socket);
      } catch (error) {
        console.error("Leave conversation error:", error);
      }
    });

    /**
     * New conversation created - join all participants
     */
    socket.on("conversation:created", async (data) => {
      try {
        const { conversationId } = data;

        const conversation = await Conversation.findById(conversationId)
          .populate("participants.accountId", "email role")
          .populate("batchId", "name level");

        if (!conversation) return;

        // Notify all participants
        conversation.participants.forEach((participant) => {
          const participantId = participant.accountId._id.toString();
          const participantSocketId = onlineUsers.get(participantId);

          if (participantSocketId) {
            io.to(participantSocketId).emit("conversation:new", conversation);
          }
        });
      } catch (error) {
        console.error("Conversation created error:", error);
      }
    });

    // ==================== DISCONNECTION ====================

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.email} (${userId})`);

      // Remove from online users
      onlineUsers.delete(userId);

      // Clear all typing statuses for this user
      typingUsers.forEach((users, conversationId) => {
        if (users.has(userId)) {
          clearTypingStatus(conversationId, userId, io);
        }
      });

      // Notify others that user is offline
      socket.broadcast.emit("user:offline", { userId });
    });

    // ==================== ERROR HANDLING ====================

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

/**
 * Join user to all their conversation rooms
 */
async function joinUserConversations(socket, userId) {
  try {
    const conversations = await Conversation.find({
      "participants.accountId": userId,
      isActive: true,
    }).select("_id");

    conversations.forEach((conv) => {
      socket.join(conv._id.toString());
    });

    console.log(
      `User ${userId} joined ${conversations.length} conversation rooms`
    );
  } catch (error) {
    console.error("Join conversations error:", error);
  }
}

/**
 * Clear typing status for a user in a conversation
 */
function clearTypingStatus(conversationId, userId, io, socket = null) {
  if (typingUsers.has(conversationId)) {
    const users = typingUsers.get(conversationId);
    if (users.has(userId)) {
      users.delete(userId);

      // Notify others
      const emitter = socket || io;
      emitter.to(conversationId).emit("typing:stop", {
        conversationId,
        userId,
      });

      // Clean up empty sets
      if (users.size === 0) {
        typingUsers.delete(conversationId);
      }
    }
  }
}

/**
 * Get online users (for admin dashboard)
 */
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
