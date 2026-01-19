import express from "express";
import { createCoach } from "../controllers/coach.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/create",authMiddleware,allowRoles("ADMIN"), createCoach);



export default router;
