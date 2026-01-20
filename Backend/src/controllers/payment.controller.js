import { Demo } from "../models/demo.model.js";
import { Account } from "../models/account.model.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/payment.service.js";
import { createStudentAndSubscriptionFromDemo } from "../services/conversion.service.js";
import { generateSetPasswordToken } from "../utils/passToken.util.js";
import { sendSetPasswordEmail } from "../utils/email.util.js";

/* =====================================================
   CREATE PAYMENT ORDER
   ===================================================== */
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, demoId } = req.body;

    if (!amount || !demoId) {
      return res.status(400).json({
        message: "Amount and demoId are required",
      });
    }

    const demo = await Demo.findById(demoId);
    if (!demo || demo.status !== "INTERESTED") {
      return res.status(400).json({
        message: "Demo not eligible for payment",
      });
    }

    const order = await createRazorpayOrder({
      amount,
      receiptId: `demo_${demoId}`,
    });

    demo.status = "PAYMENT_PENDING";
    demo.paymentOrderId = order.id;
    demo.paymentAmount = order.amount; // Store amount in paise
    await demo.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/* =====================================================
   VERIFY PAYMENT (ONLY SUCCESS ENTRY)
   ===================================================== */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      demoId,
      amount,
      billingCycle,
    } = req.body;

    const isValid = verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    await createStudentAndSubscriptionFromDemo(
      demoId,
      {
        amount,
        billingCycle,
      },
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentMethod: "Razorpay",
      },
    );

    const demo = await Demo.findById(demoId);
    const account = await Account.findById(demo.accountId);

    const { rawToken, hashedToken } = generateSetPasswordToken();
    account.setPasswordToken = hashedToken;
    account.setPasswordExpiresAt = Date.now() + 15 * 60 * 1000;
    await account.save();

    const link = `${process.env.FRONTEND_URL}/set-password?token=${rawToken}`;
    await sendSetPasswordEmail(account.email, link, "CUSTOMER");

    res.json({
      message: "Payment verified, student created, onboarding started",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: error.message });
  }
};
