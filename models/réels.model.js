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
            commenterId: String,
            commenterPseudo: String,
            text: String,
            timestamp: Number,
            commentMedia: {
                type: String,
            },
            commentType: {
                type: String,
                enum: ['video', 'image', 'audio', 'gif'],
            },
            commentLikers: {
                type: [String],
                default: [],
            },

            replies: {
                type: [{
                    replierId: {
                        type: String,
                        required: true,
                    },
                    replierPseudo: {
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
                    replyMedia: {
                        type: String,
                    },
                    replyType: {
                        type: String,
                        enum: ['image', 'audio', 'gif'],
                    },
                    replierLikers: {
                        type: [String],
                        default: [],
                    },
                    repliedTo: {
                        replierToId: {
                            type: String,
                            required: true,
                        },
                        replierToPseudo: {
                            type: String,
                            required: true,
                        },
                    },
                }],
                default: [],
            },
        }
    ],
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
