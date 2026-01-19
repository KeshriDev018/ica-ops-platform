import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    planId: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    billingCycle: {
      type: String,
      required: true,
      trim: true, // e.g. monthly / quarterly / yearly
    },

    status: {
      type: String,
      enum: ["ACTIVE", "PAST_DUE", "SUSPENDED", "CANCELLED"],
      required: true,
      default: "ACTIVE",
    },

    startedAt: {
      type: Date,
      required: true,
    },

    nextDueAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false, // spec defines explicit dates, not generic created_at
  }
);

// Indexes for admin & billing ops
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextDueAt: 1 });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
