import express from "express";
import {
  createBatch,
  getAllBatches,
  getBatchById,
  addStudentToBatch,
  removeStudentFromBatch,
  deleteBatch,
  getMyBatches
} from "../controllers/batch.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/my-batches", authMiddleware, allowRoles("COACH"), getMyBatches);

router.post("/", authMiddleware, allowRoles("ADMIN"), createBatch);

router.get("/", authMiddleware, allowRoles("ADMIN"), getAllBatches);

router.get("/:batchId", authMiddleware, allowRoles("ADMIN"), getBatchById);

router.post(
  "/:batchId/students/:studentId",
  authMiddleware,
  allowRoles("ADMIN"),
  addStudentToBatch,
);

router.delete(
  "/:batchId/students/:studentId",
  authMiddleware,
  allowRoles("ADMIN"),
  removeStudentFromBatch,
);


router.delete("/:batchId", authMiddleware, allowRoles("ADMIN"), deleteBatch);


export default router;
