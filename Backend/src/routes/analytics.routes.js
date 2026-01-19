import express from "express";
import {
  getFunnelMetrics,
  getCoachMetrics,
  getAdminMetrics,
  getFunnelByStudentType,
} from "../controllers/analytics.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware, allowRoles("ADMIN"));

router.get("/funnel", getFunnelMetrics);
router.get("/coach", getCoachMetrics);
router.get("/admin", getAdminMetrics);
router.get("/funnel-by-type", getFunnelByStudentType);

export default router;
