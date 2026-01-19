import express from "express";
import { adminAssistant } from "../controllers/assistant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/query", authMiddleware, allowRoles("ADMIN"), adminAssistant);

export default router;
