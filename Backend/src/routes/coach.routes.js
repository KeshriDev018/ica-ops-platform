import express from "express";
import {
  createCoach,
  getAllCoaches,
  deleteCoach,
} from "../controllers/coach.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, allowRoles("ADMIN"), getAllCoaches);
router.post("/create", authMiddleware, allowRoles("ADMIN"), createCoach);
router.delete("/:id", authMiddleware, allowRoles("ADMIN"), deleteCoach);

export default router;
