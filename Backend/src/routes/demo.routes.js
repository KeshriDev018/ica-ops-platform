import express from "express";
import {
  createDemo,
  getAllDemos,
  verifyDemoByEmail,
  scheduleDemo,
  markDemoAttendance,
  submitDemoOutcome,
} from "../controllers/demo.controller.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", createDemo); // public demo booking
router.get("/", authMiddleware, allowRoles("ADMIN"), getAllDemos); // admin get all demos
router.post("/verify", verifyDemoByEmail); // public demo verification by email

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

export default router;
