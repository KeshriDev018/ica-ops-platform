import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      index: true,
    },

    // Razorpay Order Details
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    // Razorpay Payment Details (filled after payment)
    razorpayPaymentId: {
      type: String,
      sparse: true, // Only filled after successful payment
    },

    razorpaySignature: {
      type: String,
      sparse: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    paymentMethod: {
      type: String, // UPI, Card, Net Banking, etc.
    },

    paymentFor: {
      type: String,
      enum: ["DEMO", "SUBSCRIPTION", "RENEWAL"],
      required: true,
    },

    billingPeriod: {
      startDate: Date,
      endDate: Date,
    },

    notes: {
      type: String,
    },

    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ studentId: 1, createdAt: -1 });
paymentSchema.index({ accountId: 1, createdAt: -1 });

export const Payment = mongoose.model("Payment", paymentSchema);
