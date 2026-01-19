import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    level: {
      type: String,
      required: true,
    },

    timezone: {
      type: String,
      required: true,
    },

    // 👇 students inside batch
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    maxStudents: {
      type: Number,
      default: 5,
      immutable: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "FULL", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

// 🔐 Safety index
batchSchema.index({ coachId: 1 });
batchSchema.index({ status: 1 });

export const Batch = mongoose.model("Batch", batchSchema);
