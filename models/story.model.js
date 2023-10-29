const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    container: {
      posterId: {
        type: String,
        required: true,
      },
      stories: [
        {
          text: {
            type: String,
            trim: true,
            maxlength: 500,
          },
          media: {
            type: String,
          },
          media_type: {
            type: String,
            enum: ['image', 'video']
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
            default: () => new Date(+new Date() + 24 * 60 * 60 * 1000),
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
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Story", StorySchema);
