import { Subscription } from "../models/subscription.model.js";
import { Student } from "../models/student.model.js";
import { Payment } from "../models/payment.model.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/payment.service.js";

/**
 * ADMIN: View all subscriptions
 */
export const getAllSubscriptions = async (req, res) => {
  const subscriptions = await Subscription.find().populate(
    "accountId",
    "role email",
  );

  // Enrich with student data
  const enrichedSubscriptions = await Promise.all(
    subscriptions.map(async (sub) => {
      const student = await Student.findOne({ accountId: sub.accountId._id });

      return {
        _id: sub._id,
        accountId: sub.accountId,
        planId: sub.planId,
        amount: sub.amount,
        billingCycle: sub.billingCycle,
        status: sub.status,
        startedAt: sub.startedAt,
        nextDueAt: sub.nextDueAt,
        // Student details
        studentName: student?.studentName || "Unknown",
        studentEmail: student?.parentEmail || sub.accountId?.email || "N/A",
        studentLevel: student?.level || "N/A",
        studentType: student?.studentType || "N/A",
      };
    }),
  );

  res.json(enrichedSubscriptions);
};

/**
 * ADMIN: Pause subscription
 */
export const pauseSubscription = async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  subscription.status = "SUSPENDED";
  await subscription.save();

  // Pause student as well
  await Student.findOneAndUpdate(
    { accountId: subscription.accountId },
    { status: "PAUSED" },
  );

  res.json({ message: "Subscription paused" });
};

/**
 * ADMIN: Resume subscription
 */
export const resumeSubscription = async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  subscription.status = "ACTIVE";
  await subscription.save();

  // Resume student
  await Student.findOneAndUpdate(
    { accountId: subscription.accountId },
    { status: "ACTIVE" },
  );

  res.json({ message: "Subscription resumed" });
};

/**
 * ADMIN: Cancel subscription
 */
export const cancelSubscription = async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  subscription.status = "CANCELLED";
  await subscription.save();

  // Cancel student
  await Student.findOneAndUpdate(
    { accountId: subscription.accountId },
    { status: "CANCELLED" },
  );

  res.json({ message: "Subscription cancelled" });
};

/**
 * ================================
 * ADMIN: Create Payment Order for Student Subscription
 * ================================
 */
export const createSubscriptionPaymentOrder = async (req, res) => {
  try {
    const { studentId, amount, notes } = req.body;

    // Validate student
    const student = await Student.findById(studentId).populate("accountId");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find active subscription
    const subscription = await Subscription.findOne({
      accountId: student.accountId._id,
      status: "ACTIVE",
    });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    // Create Razorpay order
    const order = await createRazorpayOrder(
      amount || subscription.amount * 100,
    ); // Convert to paise

    // Calculate billing period (current month)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Create payment record
    const payment = await Payment.create({
      studentId: student._id,
      accountId: student.accountId._id,
      subscriptionId: subscription._id,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "PENDING",
      paymentFor: "SUBSCRIPTION",
      billingPeriod: {
        startDate,
        endDate,
      },
      notes: notes || `Monthly payment for ${student.studentName}`,
    });

    res.json({
      message: "Payment order created successfully",
      payment: {
        _id: payment._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        studentName: student.studentName,
        parentEmail: student.parentEmail,
      },
    });
  } catch (error) {
    console.error("Create subscription payment order error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ================================
 * CUSTOMER: Verify Subscription Payment
 * ================================
 */
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod,
    } = req.body;

    // Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    }).populate("subscriptionId");

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Verify signature
    const isValid = verifyRazorpayPayment({
      orderId: razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      payment.status = "FAILED";
      payment.failureReason = "Signature verification failed";
      await payment.save();

      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    // Update payment record
    payment.status = "SUCCESS";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paymentMethod = paymentMethod;
    await payment.save();

    // Update subscription next due date
    const subscription = payment.subscriptionId;
    if (subscription) {
      const nextDue = new Date(subscription.nextDueAt);
      nextDue.setMonth(nextDue.getMonth() + 1);
      subscription.nextDueAt = nextDue;
      await subscription.save();
    }

    res.json({
      message: "Payment verified successfully",
      payment: {
        _id: payment._id,
        status: payment.status,
        amount: payment.amount,
        paymentId: payment.razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error("Verify subscription payment error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ================================
 * CUSTOMER: Get My Payment History
 * ================================
 */
export const getMyPaymentHistory = async (req, res) => {
  try {
    const accountId = req.user._id;

    const payments = await Payment.find({ accountId })
      .populate("studentId", "studentName")
      .populate("subscriptionId", "planId")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedPayments = payments.map((payment) => ({
      _id: payment._id,
      date: payment.createdAt,
      amount: payment.amount / 100, // Convert from paise to rupees
      plan:
        payment.subscriptionId?.planId || payment.paymentFor || "Unknown Plan",
      status: payment.status,
      paymentId: payment.razorpayPaymentId || payment.razorpayOrderId,
      method: payment.paymentMethod || "N/A",
      studentName: payment.studentId?.studentName,
      billingPeriod: payment.billingPeriod,
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ================================
 * ADMIN: Get All Payments
 * ================================
 */
export const getAllPayments = async (req, res) => {
  try {
    const { status, studentId, limit = 100 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;

    const payments = await Payment.find(filter)
      .populate("studentId", "studentName parentEmail")
      .populate("accountId", "email")
      .populate("subscriptionId", "planId amount")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(payments);
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ================================
 * CUSTOMER: Get My Subscription
 * ================================
 */
export const getMySubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log("🔍 Finding subscription for accountId:", userId);
    
    // Find student by account ID
    const student = await Student.findOne({ accountId: userId });
    if (!student) {
      console.log("❌ Student not found for accountId:", userId);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("✅ Student found:", student.studentName);

    // Find active subscription
    const subscription = await Subscription.findOne({ 
      accountId: userId,
      status: { $in: ["ACTIVE", "PAST_DUE", "SUSPENDED"] }
    });
    
    if (!subscription) {
      console.log("❌ No subscription found for accountId:", userId);
      return res.status(404).json({ message: "No subscription found" });
    }

    console.log("✅ Subscription found, nextDueAt:", subscription.nextDueAt);
    res.json(subscription);
  } catch (error) {
    console.error("❌ Get my subscription error:", error);
    res.status(500).json({ message: error.message });
  }
};
