import express from "express";
import {
  createDemo,
  scheduleDemo,
  markDemoAttendance,
  submitDemoOutcome,
} from "../controllers/demo.controller.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", createDemo); // public demo booking

router.patch(
  "/:id/schedule",
  authMiddleware,
  allowRoles("ADMIN"),
  scheduleDemo
);


router.patch(
  "/:id/attendance",
  authMiddleware,
  allowRoles("ADMIN"),
  markDemoAttendance
);

router.patch(
  "/:id/outcome",
  authMiddleware,
  allowRoles("ADMIN"),
  submitDemoOutcome
);

export default router;
