const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        posterId: {
            type: String,
            required: true
        },
        message: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        picture: {
            type: String,
        },
        video: {
            type: String,
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
                        enum: ['image', 'audio', 'gif'],
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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Post', PostSchema);
