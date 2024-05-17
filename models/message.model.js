const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: String
  },
  senderId: {
    type: String
  },
  receiverId: {
    type: String
  },
  text: {
    type: String
  },
  type: {
    type: String
  },
  attachment: {
    type: {
      type: String,
      enum: ["image", "video", "document"]
    },
    url: {
      type: String
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},
  {
    timestamps: true
  });

module.exports = mongoose.model("Message", MessageSchema);
