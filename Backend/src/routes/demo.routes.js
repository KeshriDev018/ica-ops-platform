import express from "express";
import {
  createDemo,
  getAllDemos,
  verifyDemoByEmail,
  scheduleDemo,
  markDemoAttendance,
  submitDemoOutcome,
  getCoachDemos,
  coachMarkAttendance,
  markStudentInterest,
  updateDemoPreferences,
  getDemoByEmail,
} from "../controllers/demo.controller.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", createDemo); // public demo booking
router.get("/", authMiddleware, allowRoles("ADMIN"), getAllDemos); // admin get all demos
router.post("/verify", verifyDemoByEmail); // public demo verification by email

// Public routes for demo access page (no auth required)
router.patch("/:id/interest", markStudentInterest); // Mark interest (Interested/Not Interested)
router.patch("/:id/preferences", updateDemoPreferences); // Update coaching type & level
router.get("/by-email/:email", getDemoByEmail); // Get demo by email

router.patch(
  "/:id/schedule",
  authMiddleware,
  allowRoles("ADMIN"),
  scheduleDemo,
);

router.patch(
  "/:id/attendance",
  authMiddleware,
  allowRoles("ADMIN"),
  markDemoAttendance,
);

router.patch(
  "/:id/outcome",
  authMiddleware,
  allowRoles("ADMIN"),
  submitDemoOutcome,
);

// Coach: get own demos
router.get(
  "/coach/my-demos",
  authMiddleware,
  allowRoles("COACH"),
  getCoachDemos,
);

// Coach: mark attendance
router.patch(
  "/:id/coach-attendance",
  authMiddleware,
  allowRoles("COACH"),
  coachMarkAttendance,
);

export default router;
