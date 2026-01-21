import express from "express";
import {
  getUserConversations,
  createConversation,
  getConversationMessages,
  sendMessage,
  uploadFile,
  markMessagesAsRead,
  getAvailableContacts,
  getBatchGroupChats,
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  validateConversationAccess,
  validateConversationCreation,
  validateFileUpload,
} from "../middlewares/chatValidation.middleware.js";
import { upload } from "../config/upload.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's conversations
router.get("/conversations", getUserConversations);

// Create new conversation (with validation)
router.post("/conversations", validateConversationCreation, createConversation);

// Get messages for a conversation
router.get(
  "/conversations/:conversationId/messages",
  validateConversationAccess,
  getConversationMessages
);

// Send a message (REST fallback)
router.post(
  "/conversations/:conversationId/messages",
  validateConversationAccess,
  sendMessage
);

// Upload file (batch chats only)
router.post(
  "/conversations/:conversationId/upload",
  upload.single("file"),
  validateConversationAccess,
  validateFileUpload,
  uploadFile
);

// Mark messages as read
router.patch(
  "/conversations/:conversationId/read",
  validateConversationAccess,
  markMessagesAsRead
);

// Get available contacts for chat
router.get("/contacts", getAvailableContacts);

// Get batch group chats
router.get("/batches", getBatchGroupChats);

export default router;
