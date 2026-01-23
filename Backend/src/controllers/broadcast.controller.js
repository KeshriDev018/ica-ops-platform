import Broadcast from "../models/broadcast.model.js";
import { Account } from "../models/account.model.js";

// Create a new broadcast
export const createBroadcast = async (req, res) => {
  try {
    const { title, content, targetAudience } = req.body;
    const senderId = req.user._id;

    // Validate required fields
    if (!title || !content || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and target audience are required",
      });
    }

    // Validate target audience
    if (!["ALL", "COACHES", "STUDENTS"].includes(targetAudience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target audience",
      });
    }

    // Validate content length (~500 words = ~2500 characters)
    if (content.length > 2500) {
      return res.status(400).json({
        success: false,
        message: "Content exceeds 500 words limit",
      });
    }

    // Only ADMIN can create broadcasts
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can create broadcasts",
      });
    }

    // Set editableUntil to 10 minutes from now
    const editableUntil = new Date(Date.now() + 10 * 60 * 1000);

    const broadcast = await Broadcast.create({
      title,
      content,
      senderId,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      targetAudience,
      editableUntil,
    });

    // Emit broadcast via WebSocket (handled in socket)
    const io = req.app.get("io");
    if (io) {
      const broadcastData = {
        _id: broadcast._id,
        title: broadcast.title,
        content: broadcast.content,
        senderName: broadcast.senderName,
        targetAudience: broadcast.targetAudience,
        createdAt: broadcast.createdAt,
        isEditable: broadcast.isEditable,
      };

      // Emit to appropriate rooms based on target audience
      if (targetAudience === "ALL") {
        io.emit("broadcast:new", broadcastData);
      } else if (targetAudience === "COACHES") {
        io.to("coaches-room").emit("broadcast:new", broadcastData);
      } else if (targetAudience === "STUDENTS") {
        io.to("students-room").emit("broadcast:new", broadcastData);
      }
    }

    res.status(201).json({
      success: true,
      message: "Broadcast sent successfully",
      broadcast,
    });
  } catch (error) {
    console.error("Error creating broadcast:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create broadcast",
      error: error.message,
    });
  }
};

// Get all broadcasts (Admin only - for management)
export const getAllBroadcasts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const broadcasts = await Broadcast.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "firstName lastName email");

    const total = await Broadcast.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      broadcasts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch broadcasts",
      error: error.message,
    });
  }
};

// Get broadcasts for current user (based on role)
export const getMyBroadcasts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.user._id;
    const userRole = req.user.role;

    const result = await Broadcast.getBroadcastsForRole(userRole, page, limit);

    // Add isRead flag for each broadcast
    const broadcastsWithReadStatus = result.broadcasts.map((broadcast) => ({
      ...broadcast,
      isRead: broadcast.readBy.some(
        (read) => read.accountId.toString() === userId.toString()
      ),
    }));

    res.status(200).json({
      success: true,
      broadcasts: broadcastsWithReadStatus,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching user broadcasts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch broadcasts",
      error: error.message,
    });
  }
};

// Get unread broadcast count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const count = await Broadcast.getUnreadCount(userId, userRole);

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

// Mark broadcast as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const broadcast = await Broadcast.findById(id);

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found",
      });
    }

    await broadcast.markAsReadBy(userId);

    res.status(200).json({
      success: true,
      message: "Broadcast marked as read",
    });
  } catch (error) {
    console.error("Error marking broadcast as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark broadcast as read",
      error: error.message,
    });
  }
};

// Edit broadcast (within 10 minutes, admin only)
export const editBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user._id;

    const broadcast = await Broadcast.findById(id);

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found",
      });
    }

    // Check if user is the sender
    if (broadcast.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own broadcasts",
      });
    }

    // Check if still editable (within 10 minutes)
    if (!broadcast.isEditable) {
      return res.status(403).json({
        success: false,
        message: "Broadcast can only be edited within 10 minutes of creation",
      });
    }

    // Validate content length
    if (content && content.length > 2500) {
      return res.status(400).json({
        success: false,
        message: "Content exceeds 500 words limit",
      });
    }

    // Update fields
    if (title) broadcast.title = title;
    if (content) broadcast.content = content;

    await broadcast.save();

    // Emit update via WebSocket
    const io = req.app.get("io");
    if (io) {
      const broadcastData = {
        _id: broadcast._id,
        title: broadcast.title,
        content: broadcast.content,
        senderName: broadcast.senderName,
        targetAudience: broadcast.targetAudience,
        createdAt: broadcast.createdAt,
        updatedAt: broadcast.updatedAt,
        isEditable: broadcast.isEditable,
      };

      if (broadcast.targetAudience === "ALL") {
        io.emit("broadcast:updated", broadcastData);
      } else if (broadcast.targetAudience === "COACHES") {
        io.to("coaches-room").emit("broadcast:updated", broadcastData);
      } else if (broadcast.targetAudience === "STUDENTS") {
        io.to("students-room").emit("broadcast:updated", broadcastData);
      }
    }

    res.status(200).json({
      success: true,
      message: "Broadcast updated successfully",
      broadcast,
    });
  } catch (error) {
    console.error("Error editing broadcast:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit broadcast",
      error: error.message,
    });
  }
};

// Delete broadcast (within 10 minutes, admin only)
export const deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const broadcast = await Broadcast.findById(id);

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found",
      });
    }

    // Check if user is the sender
    if (broadcast.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own broadcasts",
      });
    }

    // Check if still editable (within 10 minutes)
    if (!broadcast.isEditable) {
      return res.status(403).json({
        success: false,
        message: "Broadcast can only be deleted within 10 minutes of creation",
      });
    }

    // Soft delete
    broadcast.isActive = false;
    await broadcast.save();

    // Emit deletion via WebSocket
    const io = req.app.get("io");
    if (io) {
      const deleteData = {
        _id: broadcast._id,
        targetAudience: broadcast.targetAudience,
      };

      if (broadcast.targetAudience === "ALL") {
        io.emit("broadcast:deleted", deleteData);
      } else if (broadcast.targetAudience === "COACHES") {
        io.to("coaches-room").emit("broadcast:deleted", deleteData);
      } else if (broadcast.targetAudience === "STUDENTS") {
        io.to("students-room").emit("broadcast:deleted", deleteData);
      }
    }

    res.status(200).json({
      success: true,
      message: "Broadcast deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting broadcast:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete broadcast",
      error: error.message,
    });
  }
};
