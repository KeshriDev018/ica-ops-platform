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
    const { amount, demoId, planId, billingCycle } = req.body;
    console.log("[CREATE DEMO ORDER] Request:", { amount, demoId, planId, billingCycle });
    
    if (!amount || !demoId) {
      console.error("[CREATE DEMO ORDER] Missing required fields", {
        amount,
        demoId,
      });
      return res
        .status(400)
        .json({ message: "Amount and demoId are required" });
    }

    // Validate planId if provided
    if (planId && !["1-1", "group"].includes(planId)) {
      return res.status(400).json({ message: "Invalid planId. Must be '1-1' or 'group'" });
    }

    // Validate billingCycle if provided
    if (billingCycle && !["MONTHLY", "QUARTERLY", "YEARLY"].includes(billingCycle)) {
      return res.status(400).json({ message: "Invalid billingCycle. Must be MONTHLY, QUARTERLY, or YEARLY" });
    }

    const demo = await Demo.findById(demoId);
    console.log("[CREATE DEMO ORDER] Demo lookup result:", demo);
    if (!demo) {
      console.error("[CREATE DEMO ORDER] Demo not found", { demoId });
      return res.status(400).json({ message: "Demo not found" });
    }

    // Get INR amount (no currency conversion)
    let inrAmount;
    if (planId) {
      const BASE_PRICES = {
        "1-1": 2999,
        "group": 1499,
      };
      inrAmount = BASE_PRICES[planId];
      console.log("[CREATE DEMO ORDER] Plan price:", { planId, inrAmount });
    } else {
      // Fallback if no planId (use provided amount)
      inrAmount = amount / 100;
    }

    // Razorpay requires amount in smallest currency unit (paise for INR)
    const razorpayAmount = Math.round(inrAmount * 100);

    const order = await createRazorpayOrder({
      amount: razorpayAmount,
      receiptId: `demo_${demoId}`,
      currency: "INR",
    });
    
    // Update demo with payment details and selected plan
    demo.status = "PAYMENT_PENDING";
    demo.paymentOrderId = order.id;
    demo.paymentAmount = order.amount;
    demo.currency = "INR";
    demo.totalAmount = inrAmount;
    
    // Store selected plan details
    if (planId) {
      demo.selectedPlanId = planId;
      demo.selectedPlanAmount = inrAmount;
    }
    if (billingCycle) {
      demo.selectedBillingCycle = billingCycle;
    }
    
    await demo.save();
    console.log("[CREATE DEMO ORDER] Demo updated with plan details:", {
      selectedPlanId: demo.selectedPlanId,
      selectedPlanAmount: demo.selectedPlanAmount,
    });
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
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
