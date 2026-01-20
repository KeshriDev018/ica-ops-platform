import express from "express";
import {
  getAllSubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  createSubscriptionPaymentOrder,
  verifySubscriptionPayment,
  getMyPaymentHistory,
  getAllPayments,
} from "../controllers/subscription.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// ADMIN: Subscription Management
router.get("/", authMiddleware, allowRoles("ADMIN"), getAllSubscriptions);

router.patch(
  "/:subscriptionId/pause",
  authMiddleware,
  allowRoles("ADMIN"),
  pauseSubscription,
);

router.patch(
  "/:subscriptionId/resume",
  authMiddleware,
  allowRoles("ADMIN"),
  resumeSubscription,
);

router.patch(
  "/:subscriptionId/cancel",
  authMiddleware,
  allowRoles("ADMIN"),
  cancelSubscription,
);

// ADMIN: Create payment order for student
router.post(
  "/payment-order",
  authMiddleware,
  allowRoles("ADMIN"),
  createSubscriptionPaymentOrder,
);

// ADMIN: View all payments
router.get("/payments", authMiddleware, allowRoles("ADMIN"), getAllPayments);

// CUSTOMER: Verify subscription payment
router.post(
  "/verify-payment",
  authMiddleware,
  allowRoles("CUSTOMER"),
  verifySubscriptionPayment,
);

// CUSTOMER: Get my payment history
router.get(
  "/my-payments",
  authMiddleware,
  allowRoles("CUSTOMER"),
  getMyPaymentHistory,
);

export default router;
