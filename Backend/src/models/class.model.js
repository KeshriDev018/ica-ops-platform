import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    // ONE of these must exist
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    // Weekly schedule
    weekdays: {
      type: [String],
      enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      required: true,
    },

    startTime: {
      type: String, // "18:30"
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
    },

    // Timezone in which the class is scheduled
    coachTimezone: {
      type: String,
      required: true, // e.g., "Asia/Kolkata", "America/New_York"
    },

    meetLink: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    materials: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          trim: true,
        },

        fileUrl: {
          type: String, // Cloudinary URL
          required: true,
        },

        filePublicId: {
          type: String, // Cloudinary public_id (for delete/update)
          required: true,
        },

        fileType: {
          type: String,
          enum: ["PDF", "IMAGE", "VIDEO", "DOC", "LINK"],
          required: true,
        },

        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account", // coach
          required: true,
        },

        isVisible: {
          type: Boolean,
          default: true, // coach can hide material
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

// Validation: either batch OR student
classSchema.pre("validate", function () {
  const hasBatch = this.batch && this.batch.toString() !== "null";
  const hasStudent = this.student && this.student.toString() !== "null";

  if (!hasBatch && !hasStudent) {
    throw new Error("Class must be assigned to a batch or a student");
  }
  if (hasBatch && hasStudent) {
    throw new Error("Class cannot have both batch and student");
  }
});

export const ClassSession = mongoose.model("ClassSession", classSchema);
