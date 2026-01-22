import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { Account } from "../models/account.model.js";
import { Student } from "../models/student.model.js";
import { Batch } from "../models/batch.model.js";
import { CoachProfile } from "../models/coach.model.js";

/**
 * Get all conversations for the authenticated user
 */
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      "participants.accountId": userId,
      isActive: true,
    })
      .populate("participants.accountId", "email role")
      .populate("batchId", "name level")
      .populate("lastMessage.senderId", "email role")
      .sort({ "lastMessage.timestamp": -1 });

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.getUnreadCount(conv._id, userId);
        return {
          ...conv.toObject(),
          unreadCount,
        };
      }),
    );

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

/**
 * Create a new conversation (with strict validation)
 */
export const createConversation = async (req, res) => {
  try {
    console.log("[CONTROLLER] createConversation called");
    console.log("[CONTROLLER] Request body:", req.body);
    console.log("[CONTROLLER] Current user:", req.user);

    const { conversationType, participants, batchId } = req.body;

    // Check if conversation already exists
    let existingConversation;

    if (conversationType === "DIRECT") {
      // Check for existing direct conversation between these two participants
      const participantIds = participants.map((p) => p.accountId);

      existingConversation = await Conversation.findOne({
        conversationType: "DIRECT",
        "participants.accountId": { $all: participantIds },
        isActive: true,
      });
    } else if (conversationType === "BATCH_GROUP" && batchId) {
      // Check for existing batch conversation
      existingConversation = await Conversation.findOne({
        conversationType: "BATCH_GROUP",
        batchId: batchId,
        isActive: true,
      });
    }

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Create new conversation
    const conversation = await Conversation.create({
      conversationType,
      participants,
      batchId: batchId || null,
      allowFiles: conversationType === "BATCH_GROUP",
    });

    await conversation.populate("participants.accountId", "email role");
    await conversation.populate("batchId", "name level");

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(400).json({
      message: error.message || "Failed to create conversation",
    });
  }
};

/**
 * Get messages for a specific conversation
 */
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
      .populate("senderId", "email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Mark messages as read
    const userId = req.user._id;
    await Promise.all(
      messages.map((msg) =>
        Message.markAsRead(msg._id, userId).catch((err) =>
          console.error("Mark as read error:", err),
        ),
      ),
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

/**
 * Send a message (REST endpoint - fallback for offline users)
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = "text" } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Get sender name
    let senderName = "User";
    if (userRole === "ADMIN") {
      senderName = "Admin";
    } else if (userRole === "COACH") {
      const account = await Account.findById(userId);
      senderName = account?.email?.split("@")[0] || "Coach";
    } else if (userRole === "CUSTOMER") {
      const student = await Student.findOne({ accountId: userId });
      senderName = student?.parentName || "Parent";
    }

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

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(400).json({
      message: error.message || "Failed to send message",
    });
  }
};

/**
 * Upload file in batch chat
 */
export const uploadFile = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const file = req.file; // From multer

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get sender name
    let senderName = "User";
    if (userRole === "ADMIN") {
      senderName = "Admin";
    } else if (userRole === "COACH") {
      const account = await Account.findById(userId);
      senderName = account?.email?.split("@")[0] || "Coach";
    } else if (userRole === "CUSTOMER") {
      const student = await Student.findOne({ accountId: userId });
      senderName = student?.parentName || "Parent";
    }

    // File URL (accessible via Express static middleware)
    const fileUrl = `/uploads/chat/${file.filename}`;

    const message = await Message.create({
      conversationId,
      senderId: userId,
      senderName,
      senderRole: userRole,
      content: file.originalname,
      messageType: "file",
      fileMetadata: {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        fileUrl: fileUrl,
      },
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content: `📎 ${file.originalname}`,
        senderId: userId,
        timestamp: new Date(),
      },
    });

    await message.populate("senderId", "email role");

    // Emit to WebSocket if available
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("message:receive", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(400).json({
      message: error.message || "Failed to upload file",
    });
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const unreadMessages = await Message.find({
      conversationId,
      "readBy.accountId": { $ne: userId },
      isDeleted: false,
    });

    await Promise.all(
      unreadMessages.map((msg) => Message.markAsRead(msg._id, userId)),
    );

    res.json({
      message: "Messages marked as read",
      count: unreadMessages.length,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

/**
 * Get available chat contacts (based on user role)
 */
export const getAvailableContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let contacts = [];

    if (userRole === "ADMIN") {
      // Admin can chat with anyone
      const [students, coaches, coachProfiles] = await Promise.all([
        Student.find({ status: "ACTIVE" })
          .populate("accountId", "email role")
          .select("studentName parentName accountId"),
        Account.find({ role: "COACH" }).select("email role"),
        CoachProfile.find().populate("accountId", "email role").select("fullName accountId"),
      ]);

      // Create a map of accountId to coach profile
      const coachProfileMap = new Map();
      coachProfiles.forEach((profile) => {
        if (profile.accountId) {
          coachProfileMap.set(profile.accountId._id.toString(), profile);
        }
      });

      contacts = [
        ...students
          .filter((s) => s.accountId) // Filter out students without accountId
          .map((s) => ({
            accountId: s.accountId._id,
            name: s.parentName || "Unknown Parent",
            studentName: s.studentName || "Unknown Student", // Add student name for UI
            role: "CUSTOMER",
            type: "parent",
          })),
        ...coaches.map((c) => {
          const profile = coachProfileMap.get(c._id.toString());
          return {
            accountId: c._id,
            name: profile?.fullName || c.email.split("@")[0],
            role: "COACH",
            type: "coach",
          };
        }),
      ];
    } else if (userRole === "COACH") {
      // Coach can only chat with Admin
      const admins = await Account.find({ role: "ADMIN" }).select("email role");
      contacts = admins.map((a) => ({
        accountId: a._id,
        name: "Admin",
        role: "ADMIN",
        type: "admin",
      }));
    } else if (userRole === "CUSTOMER") {
      // Customer can only chat with Admin
      const admins = await Account.find({ role: "ADMIN" }).select("email role");
      contacts = admins.map((a) => ({
        accountId: a._id,
        name: "Admin Support",
        role: "ADMIN",
        type: "admin",
      }));
    }

    res.json(contacts);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

/**
 * Get batch group chats for user
 */
export const getBatchGroupChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let batches = [];

    if (userRole === "ADMIN") {
      // Admin can access all batch chats
      batches = await Batch.find({ status: "ACTIVE" })
        .populate("coachId", "email role")
        .select("name level coachId");
    } else if (userRole === "COACH") {
      // Coach can access their assigned batches
      batches = await Batch.find({ coachId: userId, status: "ACTIVE" })
        .populate("coachId", "email role")
        .select("name level coachId");
    } else if (userRole === "CUSTOMER") {
      // Customer can access their assigned batch
      const student = await Student.findOne({ accountId: userId }).populate(
        "assignedBatchId",
      );
      if (student && student.assignedBatchId) {
        batches = [student.assignedBatchId];
      }
    }

    res.json(batches);
  } catch (error) {
    console.error("Get batch chats error:", error);
    res.status(500).json({ message: "Failed to fetch batch chats" });
  }
};
