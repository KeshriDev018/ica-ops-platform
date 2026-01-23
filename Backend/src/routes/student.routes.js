import express from "express";
import {
  getMyStudent,
  getCoachStudents,
  getAllStudents,
  updateStudentStatus,
  reassignStudent,
  updateMyTimezone,
} from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/me", authMiddleware, allowRoles("CUSTOMER"), getMyStudent);

router.patch(
  "/me/timezone",
  authMiddleware,
  allowRoles("CUSTOMER"),
  updateMyTimezone
);

router.get("/coach", authMiddleware, allowRoles("COACH"), getCoachStudents);

router.get("/", authMiddleware, allowRoles("ADMIN"), getAllStudents);

router.patch(
  "/:studentId/status",
  authMiddleware,
  allowRoles("ADMIN"),
  updateStudentStatus
);

router.patch(
  "/:studentId/reassign",
  authMiddleware,
  allowRoles("ADMIN"),
  reassignStudent
);

export default router;
