import express from "express";
import {
  getDemoConversionPrediction,
  getAdminFollowUpSLA,
  getCoachEffectiveness,
  getEarlyDropOffRisks,
  getDemoAuditTimeline,
  recommendCoach,
  getIntelligenceOverview,
  simulateFunnel
} from "../controllers/intelligence.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/conversion-prediction",
  authMiddleware,
  allowRoles("ADMIN"),
  getDemoConversionPrediction
);

router.get(
  "/admin-sla",
  authMiddleware,
  allowRoles("ADMIN"),
  getAdminFollowUpSLA
);

router.get(
  "/coach-effectiveness",
  authMiddleware,
  allowRoles("ADMIN"),
  getCoachEffectiveness
);


router.get(
  "/dropoff-risk",
  authMiddleware,
  allowRoles("ADMIN"),
  getEarlyDropOffRisks
);



router.get(
  "/demo/:demoId/timeline",
  authMiddleware,
  allowRoles("ADMIN"),
  getDemoAuditTimeline
);
router.get(
  "/simulate-funnel",
  authMiddleware,
  allowRoles("ADMIN"),
  simulateFunnel
);

router.get(
  "/coach-recommendation",
  authMiddleware,
  allowRoles("ADMIN"),
  recommendCoach
);


router.get(
  "/overview",
  authMiddleware,
  allowRoles("ADMIN"),
  getIntelligenceOverview
);




export default router;
