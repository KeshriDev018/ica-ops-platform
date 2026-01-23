import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2500, // ~500 words
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ["ALL", "COACHES", "STUDENTS"],
      required: true,
      index: true,
    },
    readBy: [
      {
        accountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    editableUntil: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
broadcastSchema.index({ targetAudience: 1, createdAt: -1 });
broadcastSchema.index({ "readBy.accountId": 1 });
broadcastSchema.index({ isActive: 1, createdAt: -1 });

// Virtual to check if broadcast is still editable
broadcastSchema.virtual("isEditable").get(function () {
  return new Date() < this.editableUntil;
});

// Method to check if user has read the broadcast
broadcastSchema.methods.isReadBy = function (accountId) {
  return this.readBy.some(
    (read) => read.accountId.toString() === accountId.toString()
  );
};

// Method to mark as read by user
broadcastSchema.methods.markAsReadBy = async function (accountId) {
  if (!this.isReadBy(accountId)) {
    this.readBy.push({
      accountId,
      readAt: new Date(),
    });
    await this.save();
  }
  return this;
};

// Static method to get broadcasts for a specific user role
broadcastSchema.statics.getBroadcastsForRole = async function (
  role,
  page = 1,
  limit = 20
) {
  const targetAudiences = ["ALL"];

  if (role === "COACH") {
    targetAudiences.push("COACHES");
  } else if (role === "CUSTOMER") {
    targetAudiences.push("STUDENTS");
  }

  const skip = (page - 1) * limit;

  const broadcasts = await this.find({
    targetAudience: { $in: targetAudiences },
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId", "firstName lastName email")
    .lean();

  const total = await this.countDocuments({
    targetAudience: { $in: targetAudiences },
    isActive: true,
  });

  return {
    broadcasts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Static method to get unread count for user
broadcastSchema.statics.getUnreadCount = async function (accountId, role) {
  const targetAudiences = ["ALL"];

  if (role === "COACH") {
    targetAudiences.push("COACHES");
  } else if (role === "CUSTOMER") {
    targetAudiences.push("STUDENTS");
  }

  return await this.countDocuments({
    targetAudience: { $in: targetAudiences },
    isActive: true,
    "readBy.accountId": { $ne: accountId },
  });
};

const Broadcast = mongoose.model("Broadcast", broadcastSchema);

export default Broadcast;
