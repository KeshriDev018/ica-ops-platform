import mongoose from "mongoose";

const coachProfileSchema = new mongoose.Schema(
  {
    /**
     * 🔗 AUTH LINK
     * One CoachProfile ↔ One Account (role = COACH)
     */
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
      index: true,
    },

    /**
     * 👤 BASIC PROFILE (Coach managed)
     */
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      required: true,
    },

    timezone: {
      type: String,
      required: true,
    },

    languages: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      trim: true,
    },

    /**
     * ♟️ PROFESSIONAL INFO
     */
    experienceYears: {
      type: Number,
      min: 0,
    },

    specialization: {
      type: [String], // ["Beginner", "Intermediate", "Advanced"]
      default: [],
    },

    internalRating: {
      type: Number, // Admin-only internal rating
      min: 0,
      max: 5,
    },

    /**
     * 💰 PAYOUT DETAILS
     * Coach ENTERS bank/UPI
     * Admin VERIFIES & LINKS Razorpay
     */
    payout: {
      // Coach-selected payout method
      method: {
        type: String,
        enum: ["BANK", "UPI"],
        required: true,
      },

      /**
       * Razorpay system references (ADMIN ONLY)
       */
      razorpayContactId: {
        type: String,
        default: null,
      },

      razorpayFundAccountId: {
        type: String,
        default: null,
      },

      /**
       * Bank details (used only if method === BANK)
       */
      bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
      },

      /**
       * UPI ID (used only if method === UPI)
       */
      upiId: {
        type: String,
      },

      /**
       * Admin verification flag
       * Payouts allowed ONLY if true
       */
      isVerified: {
        type: Boolean,
        default: false,
      },
    },

    /**
     * 💵 COMMERCIAL TERMS (ADMIN SETS)
     */
    payoutPerClass: {
      type: Number,
      required: true,
      min: 0,
    },

    payoutPerBatch: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    /**
     * ⚙️ OPERATIONAL
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Useful indexes
coachProfileSchema.index({ isActive: 1 });

export const CoachProfile = mongoose.model("CoachProfile", coachProfileSchema);
