import express from "express";
import {
  createBroadcast,
  getAllBroadcasts,
  getMyBroadcasts,
  getUnreadCount,
  markAsRead,
  editBroadcast,
  deleteBroadcast,
} from "../controllers/broadcast.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Admin only - create broadcast
router.post("/", allowRoles("ADMIN"), createBroadcast);

// Admin only - get all broadcasts for management
router.get("/all", allowRoles("ADMIN"), getAllBroadcasts);

// Get broadcasts for current user (role-based)
router.get("/my", getMyBroadcasts);

// Get unread broadcast count
router.get("/unread/count", getUnreadCount);

// Mark broadcast as read
router.patch("/:id/read", markAsRead);

// Admin only - edit broadcast (within 10 minutes)
router.patch("/:id", allowRoles("ADMIN"), editBroadcast);

// Admin only - delete broadcast (within 10 minutes)
router.delete("/:id", allowRoles("ADMIN"), deleteBroadcast);

export default router;
