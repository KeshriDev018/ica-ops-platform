import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true, // one account ↔ one student
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    studentAge: {
      type: Number,
      required: true,
      min: 1,
    },

    parentName: {
      type: String,
      required: true,
      trim: true,
    },

    parentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    timezone: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    studentType: {
      type: String,
      enum: ["1-1", "group"],
      required: true,
    },

    level: {
      type: String,
      required: true,
    },

    chessUsernames: {
      type: [String], // optional
      default: [],
    },

    rating: {
      type: Number,
    },

    assignedCoachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
      default: null,
    },

    assignedBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // nullable for 1-1
    },

    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "CANCELLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true, // created_at, updated_at
  },
);

// Indexes for ops & dashboards
studentSchema.index({ assignedCoachId: 1 });
studentSchema.index({ assignedBatchId: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ studentType: 1 });

export const Student = mongoose.model("Student", studentSchema);
