const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    posterId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    media: {
      type: String,
      
    },
    music: {
      type: String, 
    },
    likers: {
      type: [String],
      default: [], 
  },
    expires_at: {
      type: Date,
      required: true,
    },
    allowedViewers: {
      type: [String], 
      default: [],
    },
    views: {
      type: [
        {
          viewerId: {
            type: String,
            required: true,
          },
          viewed_at: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    comments: {
      type: [
        {
          commenterId: {
            type: String,
            required: true,
          },
          commenterPseudo: {
            type: String,
            required: true,
          },
          text: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Story", StorySchema);
