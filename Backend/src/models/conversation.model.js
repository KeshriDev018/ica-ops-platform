import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    conversationType: {
      type: String,
      enum: ["DIRECT", "BATCH_GROUP"],
      required: true,
    },

    // For BATCH_GROUP conversations
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    // Array of participant account IDs
    participants: [
      {
        accountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
          required: true,
        },
        role: {
          type: String,
          enum: ["ADMIN", "COACH", "CUSTOMER"],
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Files only allowed in batch group chats
    allowFiles: {
      type: Boolean,
      default: false,
    },

    // Last message info for conversation list
    lastMessage: {
      content: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      timestamp: Date,
    },

    // Soft delete
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
conversationSchema.index({ "participants.accountId": 1 });
conversationSchema.index({ batchId: 1 });
conversationSchema.index({ conversationType: 1 });
conversationSchema.index({ isActive: 1 });

// Validation middleware - ENFORCE COMMUNICATION RULES
conversationSchema.pre("save", async function () {
  const conversation = this;

  // Rule: Batch group chats must have batchId
  if (conversation.conversationType === "BATCH_GROUP") {
    if (!conversation.batchId) {
      throw new Error("Batch group conversations must have a batchId");
    }

    // Rule: Batch chats allow files
    conversation.allowFiles = true;

    // Rule: Batch chats must have at least Coach + Admin + Parent
    const roles = conversation.participants.map((p) => p.role);
    const hasAdmin = roles.includes("ADMIN");
    const hasCoach = roles.includes("COACH");
    const hasCustomer = roles.includes("CUSTOMER");

    if (!hasAdmin) {
      throw new Error("Batch group chat must include at least one ADMIN");
    }
    if (!hasCoach) {
      throw new Error("Batch group chat must include the COACH");
    }
    if (!hasCustomer) {
      throw new Error("Batch group chat must include at least one CUSTOMER");
    }
  }

  // Rule: Direct chats
  if (conversation.conversationType === "DIRECT") {
    if (conversation.batchId) {
      throw new Error("Direct conversations cannot have a batchId");
    }

    // Rule: Direct chats don't allow files
    conversation.allowFiles = false;

    // Rule: Must have exactly 2 participants
    if (conversation.participants.length !== 2) {
      throw new Error("Direct conversations must have exactly 2 participants");
    }

    const roles = conversation.participants.map((p) => p.role);

    // Rule: At least one must be ADMIN
    if (!roles.includes("ADMIN")) {
      throw new Error("Direct conversations must include at least one ADMIN");
    }

    // Rule: COACH can ONLY chat with ADMIN (not CUSTOMER)
    if (roles.includes("COACH") && roles.includes("CUSTOMER")) {
      throw new Error(
        "COACH and CUSTOMER cannot have direct conversation. COACH can only chat with ADMIN."
      );
    }

    // Rule: CUSTOMER can ONLY chat with ADMIN (not COACH)
    // This is already covered by the above rule, but making it explicit
    const nonAdminRoles = roles.filter((r) => r !== "ADMIN");
    if (nonAdminRoles.length === 2) {
      throw new Error("Direct conversations must include at least one ADMIN");
    }
  }
});

// Static method to validate if a conversation can be created
conversationSchema.statics.validateConversationRules = function (
  conversationType,
  participants,
  batchId = null
) {
  const roles = participants.map((p) => p.role);

  if (conversationType === "DIRECT") {
    // Must have exactly 2 participants
    if (participants.length !== 2) {
      return {
        valid: false,
        error: "Direct conversations must have exactly 2 participants",
      };
    }

    // At least one must be ADMIN
    if (!roles.includes("ADMIN")) {
      return {
        valid: false,
        error: "Direct conversations must include at least one ADMIN",
      };
    }

    // No COACH ↔ CUSTOMER direct chat
    if (roles.includes("COACH") && roles.includes("CUSTOMER")) {
      return {
        valid: false,
        error: "COACH cannot chat directly with CUSTOMER",
      };
    }

    return { valid: true };
  }

  if (conversationType === "BATCH_GROUP") {
    // Must have batchId
    if (!batchId) {
      return { valid: false, error: "Batch group chat must have a batchId" };
    }

    // Must have Admin + Coach + at least one Customer
    if (!roles.includes("ADMIN")) {
      return {
        valid: false,
        error: "Batch group chat must include at least one ADMIN",
      };
    }
    if (!roles.includes("COACH")) {
      return {
        valid: false,
        error: "Batch group chat must include the COACH",
      };
    }
    if (!roles.includes("CUSTOMER")) {
      return {
        valid: false,
        error: "Batch group chat must include at least one CUSTOMER (parent)",
      };
    }

    return { valid: true };
  }

  return { valid: false, error: "Invalid conversation type" };
};

export const Conversation = mongoose.model("Conversation", conversationSchema);
