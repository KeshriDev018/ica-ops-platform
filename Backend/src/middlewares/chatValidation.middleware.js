import { Conversation } from "../models/conversation.model.js";

/**
 * Middleware to validate if a user can participate in a conversation
 */
export const validateConversationAccess = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.accountId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You do not have access to this conversation",
      });
    }

    // Attach conversation to request
    req.conversation = conversation;
    next();
  } catch (error) {
    console.error("Conversation access validation error:", error);
    res.status(500).json({ message: "Failed to validate conversation access" });
  }
};

/**
 * Middleware to validate conversation creation rules
 */
export const validateConversationCreation = async (req, res, next) => {
  try {
    console.log("[VALIDATION] Starting conversation creation validation");
    console.log("[VALIDATION] Request body:", req.body);
    console.log("[VALIDATION] Current user:", req.user);
    
    const { conversationType, participants, batchId } = req.body;
    const currentUser = req.user;

    if (!conversationType || !participants || participants.length === 0) {
      console.log("[VALIDATION] Missing conversationType or participants");
      return res.status(400).json({
        message: "conversationType and participants are required",
      });
    }

    // Ensure current user is included in participants
    const currentUserInParticipants = participants.some(
      (p) => {
        const pId = typeof p.accountId === 'string' ? p.accountId : p.accountId?.toString();
        return pId === currentUser._id.toString();
      }
    );

    console.log("[VALIDATION] Current user in participants:", currentUserInParticipants);

    if (!currentUserInParticipants) {
      console.log("[VALIDATION] Current user not in participants");
      return res.status(400).json({
        message: "You must be included in the conversation participants",
      });
    }

    console.log("[VALIDATION] Calling validateConversationRules");
    // Validate using Conversation model static method
    const validation = Conversation.validateConversationRules(
      conversationType,
      participants,
      batchId
    );
    console.log("[VALIDATION] Validation result:", validation);

    if (!validation.valid) {
      console.log("[VALIDATION] Validation failed:", validation.error);
      return res.status(403).json({
        message: validation.error,
      });
    }

    // Additional role-based restrictions
    if (currentUser.role === "COACH") {
      console.log("[VALIDATION] Checking COACH restrictions");
      // Coach can only create conversations with Admin
      const hasNonAdminParticipant = participants.some(
        (p) => p.role !== "ADMIN" && p.role !== "COACH"
      );

      if (conversationType === "DIRECT" && hasNonAdminParticipant) {
        console.log("[VALIDATION] COACH restriction failed");
        return res.status(403).json({
          message: "Coaches can only start direct conversations with Admins",
        });
      }
    }

    if (currentUser.role === "CUSTOMER") {
      console.log("[VALIDATION] Checking CUSTOMER restrictions");
      // Customer can only create conversations with Admin
      const hasNonAdminParticipant = participants.some(
        (p) => p.role !== "ADMIN" && p.role !== "CUSTOMER"
      );

      if (conversationType === "DIRECT" && hasNonAdminParticipant) {
        console.log("[VALIDATION] CUSTOMER restriction failed");
        return res.status(403).json({
          message: "Parents can only start direct conversations with Admins",
        });
      }
    }

    console.log("[VALIDATION] All checks passed, calling next()");
    console.log("[VALIDATION] typeof next:", typeof next);
    next();
  } catch (error) {
    console.error("[VALIDATION] Conversation creation validation error:", error);
    console.error("[VALIDATION] Error stack:", error.stack);
    res
      .status(500)
      .json({ message: error.message || "Failed to validate conversation creation" });
  }
};

/**
 * Middleware to validate file uploads
 */
export const validateFileUpload = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if files are allowed in this conversation
    if (!conversation.allowFiles) {
      return res.status(403).json({
        message:
          "Files can only be uploaded in batch group chats, not in direct conversations",
      });
    }

    // Validate file exists (multer should have processed it)
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // File size is already validated by multer
    req.conversation = conversation;
    next();
  } catch (error) {
    console.error("File upload validation error:", error);
    res.status(500).json({ message: "Failed to validate file upload" });
  }
};

/**
 * Middleware to prevent exposing personal contact information
 */
export const sanitizeUserData = (user) => {
  // Remove phone numbers and personal emails from user data
  return {
    _id: user._id,
    name: user.name || "User",
    role: user.role,
    // Never expose email or phone
  };
};
