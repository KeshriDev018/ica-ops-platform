import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    senderName: {
      type: String,
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["ADMIN", "COACH", "CUSTOMER"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    messageType: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text",
      required: true,
    },

    // File metadata (only if messageType === 'file')
    fileMetadata: {
      fileName: String,
      fileSize: Number,
      fileType: String,
      fileUrl: String,
    },

    // Read receipts - track who has read this message
    readBy: [
      {
        accountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // For replies/threads (optional future feature)
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ "readBy.accountId": 1 });
messageSchema.index({ isDeleted: 1 });

// Validation middleware - ENFORCE FILE RULES
messageSchema.pre("save", async function () {
  const message = this;

  // Rule: Files only allowed in batch group chats
  if (message.messageType === "file") {
    const Conversation = mongoose.model("Conversation");
    const conversation = await Conversation.findById(message.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.allowFiles) {
      throw new Error(
        "Files can only be sent in batch group chats, not in direct conversations"
      );
    }

    // Validate file metadata
    if (!message.fileMetadata || !message.fileMetadata.fileName) {
      throw new Error("File messages must include file metadata");
    }

    // File size limit: 10MB
    if (message.fileMetadata.fileSize > 10 * 1024 * 1024) {
      throw new Error("File size cannot exceed 10MB");
    }
  }

  // Automatically mark as read by sender
  const alreadyRead = message.readBy.some(
    (r) => r.accountId.toString() === message.senderId.toString()
  );

  if (!alreadyRead) {
    message.readBy.push({
      accountId: message.senderId,
      readAt: new Date(),
    });
  }
});

// Static method to mark message as read
messageSchema.statics.markAsRead = async function (messageId, accountId) {
  const message = await this.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  const alreadyRead = message.readBy.some(
    (r) => r.accountId.toString() === accountId.toString()
  );

  if (!alreadyRead) {
    message.readBy.push({
      accountId: accountId,
      readAt: new Date(),
    });
    await message.save();
  }

  return message;
};

// Static method to get unread count for a user in a conversation
messageSchema.statics.getUnreadCount = async function (
  conversationId,
  accountId
) {
  const count = await this.countDocuments({
    conversationId,
    "readBy.accountId": { $ne: accountId },
    isDeleted: false,
  });

  return count;
};

export const Message = mongoose.model("Message", messageSchema);
