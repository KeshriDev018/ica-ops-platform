import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "COACH", "CUSTOMER"],
      required: true,
    },

    password: {
      type: String,
      select: false,
      default: null,
    },
    setPasswordToken: {
      type: String,
      select: false,
    },
    setPasswordExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ email: 1 });

export const Account = mongoose.model("Account", accountSchema);
