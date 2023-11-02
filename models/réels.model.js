// Video.js

const mongoose = require("mongoose");

const videoRéelsSchema = new mongoose.Schema({
  posterId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoPath: {
    type: String,
    required: true,
  },
  music: {
    type: String,
    required: true,
  },
  likers: {
    type: [String],
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
  viewers: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("VideoRéels", videoRéelsSchema);
