import mongoose from "mongoose";

const coachPayoutSchema = new mongoose.Schema(
  {
    /**
     * 🔗 Who is getting paid
     */
    coachAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    /**
     * 🔗 Optional profile reference
     */
    coachProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoachProfile",
      required: true,
    },

    /**
     * 💰 Amount details
     */
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    /**
     * 📅 Period this payout is for
     * Example: JAN-2026, WEEK-12-2026
     */
    payoutPeriod: {
      type: String,
      required: true,
      index: true,
    },

    periodStart: {
      type: Date,
      required: true,
    },

    periodEnd: {
      type: Date,
      required: true,
    },

    /**
     * 📊 Breakdown (for transparency)
     */
    breakdown: {
      classesCount: {
        type: Number,
        default: 0,
      },
      batchesCount: {
        type: Number,
        default: 0,
      },
      perClassRate: Number,
      perBatchRate: Number,
    },

    /**
     * 🧾 Razorpay payout reference
     */
    razorpayPayoutId: {
      type: String,
      unique: true,
      sparse: true,
    },

    /**
     * 📌 Payout status
     */
    status: {
      type: String,
      enum: ["INITIATED", "PROCESSED", "FAILED"],
      default: "INITIATED",
      index: true,
    },

    failureReason: {
      type: String,
    },

    /**
     * 👑 Admin info
     */
    processedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Useful indexes
coachPayoutSchema.index({ coachAccountId: 1, createdAt: -1 });
coachPayoutSchema.index({ status: 1 });

export const CoachPayout = mongoose.model("CoachPayout", coachPayoutSchema);
