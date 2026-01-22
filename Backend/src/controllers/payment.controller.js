import { Demo } from "../models/demo.model.js";
import { Account } from "../models/account.model.js";
import { Student } from "../models/student.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Payment } from "../models/payment.model.js";
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

    // Only allow students to create order for their own demo
    const demo = await Demo.findById(demoId);
    if (!demo || demo.status !== "INTERESTED") {
      return res.status(400).json({
        message: "Demo not eligible for payment",
      });
    }

    // Optionally, check that req.user.accountId === demo.accountId
    if (
      req.user.role === "CUSTOMER" &&
      req.user.accountId.toString() !== demo.accountId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
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

/* =====================================================
   CREATE SUBSCRIPTION RENEWAL ORDER (Pay Anytime)
   ===================================================== */
export const createSubscriptionRenewalOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log("🔄 Creating renewal order for accountId:", userId);
    
    // Find student by account ID
    const student = await Student.findOne({ accountId: userId });
    if (!student) {
      console.log("❌ Student not found for accountId:", userId);
      return res.status(404).json({ message: "Student not found" });
    }
    
    console.log("✅ Student found:", student.studentName);

    // Find active subscription (student can pay anytime)
    const subscription = await Subscription.findOne({ 
      accountId: userId,
      status: { $in: ["ACTIVE", "PAST_DUE", "SUSPENDED"] }
    });
    
    if (!subscription) {
      console.log("❌ No subscription found for accountId:", userId);
      return res.status(404).json({ message: "No active subscription found" });
    }

    console.log("✅ Subscription found, current nextDueAt:", subscription.nextDueAt);

    // Determine amount based on student type (in paise)
    const amount = student.studentType === "1-1" ? 299900 : 149900;
    console.log("💰 Amount for", student.studentType, "plan:", amount, "paise");

    // Create Razorpay order with short receipt ID (max 40 chars)
    const shortSubId = subscription._id.toString().slice(-8);
    const timestamp = Date.now().toString().slice(-10);
    const receiptId = `rnw_${shortSubId}_${timestamp}`; // Max 26 chars
    
    const order = await createRazorpayOrder({
      amount,
      receiptId,
    });

    console.log("✅ Razorpay order created:", order.id);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      subscriptionId: subscription._id,
      studentId: student._id,
      studentType: student.studentType,
    });
  } catch (error) {
    console.error("❌ Create subscription renewal order error:", error);
    res.status(500).json({ message: "Failed to create renewal order" });
  }
};

/* =====================================================
   VERIFY SUBSCRIPTION RENEWAL PAYMENT
   Extends nextDueAt by 30 days from current due date
   ===================================================== */
export const verifySubscriptionRenewal = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscriptionId,
      studentId,
      amount,
    } = req.body;

    console.log("🔍 Verifying renewal payment:", razorpay_payment_id);

    // Verify Razorpay signature
    const isValid = verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      console.log("❌ Signature verification failed");
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    console.log("✅ Signature verified");

    // Find subscription
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create payment record
    const payment = new Payment({
      studentId: student._id,
      accountId: student.accountId,
      subscriptionId: subscription._id,
      amount: amount,
      currency: "INR",
      paymentFor: "RENEWAL",
      paymentMethod: "Razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "SUCCESS",
    });
    await payment.save();

    console.log("✅ Payment record created:", payment._id);

    // PAY ANYTIME LOGIC: Add 30 days to CURRENT nextDueAt (not today)
    const currentDueDate = new Date(subscription.nextDueAt);
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + 30);
    
    console.log("📅 Extending subscription:");
    console.log("   Current nextDueAt:", currentDueDate);
    console.log("   New nextDueAt:", newDueDate);
    
    subscription.nextDueAt = newDueDate;
    subscription.status = "ACTIVE"; // Reactivate if was suspended
    await subscription.save();

    console.log("✅ Subscription extended successfully");

    res.json({
      message: "Payment verified, subscription renewed successfully",
      nextDueAt: newDueDate,
      payment: {
        _id: payment._id,
        amount: payment.amount,
        status: payment.status,
        razorpayPaymentId: payment.razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error("❌ Verify subscription renewal error:", error);
    res.status(500).json({ message: error.message });
  }
};
