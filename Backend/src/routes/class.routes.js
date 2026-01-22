import express from "express";
import {
  createClass,
  getCoachClasses,
  getStudentClasses,
  deactivateClass,
  uploadClassMaterial,
  getCoachClassMaterials,
  getStudentClassMaterials,
} from "../controllers/class.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import upload from "../middlewares/multer.middleware.js";

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

/**
 * COACH: Upload class material
 */
router.post(
  "/:classId/materials",
  authMiddleware,
  allowRoles("COACH"),
  upload.single("file"), // multer + cloudinary
  uploadClassMaterial,
);

/**
 * COACH: Get all my class materials
 */
router.get(
  "/coach/materials",
  authMiddleware,
  allowRoles("COACH"),
  getCoachClassMaterials,
);

/**
 * CUSTOMER: Get all my class materials
 */
router.get(
  "/student/materials",
  authMiddleware,
  allowRoles("CUSTOMER"),
  getStudentClassMaterials,
);

export default router;
