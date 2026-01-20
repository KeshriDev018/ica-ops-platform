import express from "express";
import {
  createClass,
  getCoachClasses,
  getStudentClasses,
  deactivateClass,
} from "../controllers/class.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * COACH: Create class
 */
router.post("/", authMiddleware, allowRoles("COACH"), createClass);

/**
 * COACH: Get my classes
 */
router.get("/coach", authMiddleware, allowRoles("COACH"), getCoachClasses);

/**
 * STUDENT/CUSTOMER: Get my classes
 */
router.get(
  "/student",
  authMiddleware,
  allowRoles("CUSTOMER"),
  getStudentClasses,
);

/**
 * COACH: Deactivate class
 */
router.patch(
  "/:classId/deactivate",
  authMiddleware,
  allowRoles("COACH"),
  deactivateClass,
);

export default router;
