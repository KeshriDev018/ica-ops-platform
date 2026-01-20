import { Demo } from "../models/demo.model.js";
import { Student } from "../models/student.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Payment } from "../models/payment.model.js";

export const createStudentAndSubscriptionFromDemo = async (
  demoId,
  paymentDetails,
  razorpayDetails = {},
) => {
  const demo = await Demo.findById(demoId);

  if (!demo) {
    throw new Error("Demo not found");
  }

  // ✅ Correct state
  if (demo.status !== "PAYMENT_PENDING") {
    throw new Error("Demo is not eligible for conversion");
  }

  const existingStudent = await Student.findOne({
    accountId: demo.accountId,
  });

  if (existingStudent) {
    throw new Error("Student already exists for this account");
  }

  const student = await Student.create({
    accountId: demo.accountId,
    studentName: demo.studentName,
    studentAge: demo.studentAge,
    parentName: demo.parentName,
    parentEmail: demo.parentEmail,
    timezone: demo.timezone,
    country: demo.country,
    studentType: demo.recommendedStudentType,
    level: demo.recommendedLevel,
    assignedCoachId: demo.coachId,
    status: "ACTIVE",
  });

  const startedAt = new Date();

  let nextDueAt = new Date(startedAt);

  switch (paymentDetails.billingCycle) {
    case "MONTHLY":
      nextDueAt.setMonth(nextDueAt.getMonth() + 1);
      break;

    case "QUARTERLY":
      nextDueAt.setMonth(nextDueAt.getMonth() + 3);
      break;

    case "YEARLY":
      nextDueAt.setFullYear(nextDueAt.getFullYear() + 1);
      break;

    default:
      throw new Error("Invalid billing cycle");
  }

  const subscription = await Subscription.create({
    accountId: demo.accountId,
    planId: demo.recommendedStudentType,
    amount: paymentDetails.amount,
    billingCycle: paymentDetails.billingCycle,
    status: "ACTIVE",
    startedAt,
    nextDueAt, // ✅ REQUIRED
  });

  // Create Payment record for demo payment
  await Payment.create({
    studentId: student._id,
    accountId: demo.accountId,
    subscriptionId: subscription._id,
    razorpayOrderId: demo.paymentOrderId,
    razorpayPaymentId: razorpayDetails.razorpay_payment_id,
    razorpaySignature: razorpayDetails.razorpay_signature,
    amount: demo.paymentAmount || paymentDetails.amount * 100,
    currency: "INR",
    status: "SUCCESS",
    paymentFor: "DEMO",
    paymentMethod: razorpayDetails.paymentMethod || "Unknown",
    notes: `Initial payment for demo conversion - ${student.studentName}`,
  });

  demo.status = "CONVERTED";
  await demo.save();

  return { student, subscription };
};
