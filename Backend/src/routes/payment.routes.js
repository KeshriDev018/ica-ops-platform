import express from "express";
import { Demo } from "../models/demo.model.js";
import { createRazorpayOrder } from "../services/payment.service.js";
import {
  createPaymentOrder,
  verifyPayment,
  createSubscriptionRenewalOrder,
  verifySubscriptionRenewal,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Subscription renewal endpoints (protected - student can pay anytime)
router.post(
  "/create-renewal-order",
  authMiddleware,
  allowRoles("CUSTOMER"),
  createSubscriptionRenewalOrder
);

router.post(
  "/verify-renewal",
  authMiddleware,
  allowRoles("CUSTOMER"),
  verifySubscriptionRenewal
);

// Public endpoint for demo users to create payment order (no auth)
router.post("/create-demo-order", async (req, res) => {
  try {
    const { amount, demoId } = req.body;
    console.log("[CREATE DEMO ORDER] amount:", amount, "demoId:", demoId);
    if (!amount || !demoId) {
      console.error("[CREATE DEMO ORDER] Missing amount or demoId", {
        amount,
        demoId,
      });
      return res
        .status(400)
        .json({ message: "Amount and demoId are required" });
    }
    const demo = await Demo.findById(demoId);
    console.log("[CREATE DEMO ORDER] Demo lookup result:", demo);
    if (!demo) {
      console.error("[CREATE DEMO ORDER] Demo not found", { demoId });
      return res.status(400).json({ message: "Demo not found" });
    }
    const order = await createRazorpayOrder({
      amount,
      receiptId: `demo_${demoId}`,
    });
    demo.status = "PAYMENT_PENDING";
    demo.paymentOrderId = order.id;
    demo.paymentAmount = order.amount;
    await demo.save();
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "[CREATE DEMO ORDER] ERROR:",
      error && error.stack ? error.stack : error,
    );
    res
      .status(500)
      .json({
        message: "Failed to create demo order",
        error: error && error.message,
      });
  }
});

// Allow students to create payment order themselves
router.post("/create-order", authMiddleware, createPaymentOrder);

/* Real payment verification */
router.post("/verify", verifyPayment);

export default router;
