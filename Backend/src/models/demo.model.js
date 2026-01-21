import mongoose from "mongoose";

const demoSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
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

    country: {
      type: String,
      required: true,
      trim: true,
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

    scheduledStart: {
      type: Date,
      required: true,
    },

    scheduledEnd: {
      type: Date,
      required: true,
    },

    studentInterest: {
      type: String,
      enum: ["INTERESTED", "NOT_INTERESTED", "PENDING"],
      default: "PENDING",
      index: true,
    },

    coachAttendance: {
      type: String,
      enum: ["ATTENDED", "ABSENT", "NOT_MARKED"],
      default: "NOT_MARKED",
      index: true,
    },

    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null, // ✅ admin sets later
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null, // ✅ admin sets later
    },

    meetingLink: {
      type: String,
      default: null,
    },

    paymentOrderId: {
      type: String,
      default: null,
      index: true,
    },

    paymentAmount: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "BOOKED",
        "ATTENDED",
        "NO_SHOW",
        "RESCHEDULED",
        "CANCELLED",
        "INTERESTED",
        "NOT_INTERESTED",
        "PAYMENT_PENDING",
        "CONVERTED",
        "DROPPED",
      ],
      required: true,
      default: "BOOKED",
    },

    recommendedStudentType: {
      type: String,
      enum: ["1-1", "group"],
    },

    recommendedLevel: {
      type: String,
    },

    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // created_at, updated_at
  },
);

// Indexes for analytics & dashboards
demoSchema.index({ status: 1 });
demoSchema.index({ coachId: 1 });
demoSchema.index({ adminId: 1 });
demoSchema.index({ scheduledStart: 1 });

export const Demo = mongoose.model("Demo", demoSchema);
