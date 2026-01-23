import express from "express";
import {
  verifyCoachPayout,
  payCoach,
  getMyPayoutHistory,
  getCoachPayoutHistoryById,
  getNextUnpaidPeriod,
} from "../controllers/coachPayout.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/* =====================================================
   COACH ROUTES
===================================================== */

/**
 * COACH: Get own payout history
 */
router.get(
  "/my/payouts",
  authMiddleware,
  allowRoles("COACH"),
  getMyPayoutHistory,
);

/* =====================================================
   ADMIN ROUTES
===================================================== */

/**
 * ADMIN: Verify coach payout details (create Razorpay contact & fund account)
 */
router.post(
  "/admin/coach/:coachAccountId/verify-payout",
  authMiddleware,
  allowRoles("ADMIN"),
  verifyCoachPayout,
);

/**
 * ADMIN: Pay a coach
 */
router.post("/admin/coach/pay", authMiddleware, allowRoles("ADMIN"), payCoach);

/**
 * ADMIN: Get payout history for ONE coach (by coachAccountId)
 */
router.get(
  "/admin/coach/:coachAccountId/payouts",
  authMiddleware,
  allowRoles("ADMIN"),
  getCoachPayoutHistoryById,
);

/**
 * ADMIN: Get next unpaid period for a coach
 */
router.get(
  "/admin/coach/:coachAccountId/next-period",
  authMiddleware,
  allowRoles("ADMIN"),
  getNextUnpaidPeriod,
);

export default router;
