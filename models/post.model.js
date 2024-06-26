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
        location: {
            type: {
                city: String,
                department: String,
                country: String
            }
        },
        tags: {
            type: [String]
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
        categories: {
            type: [String]
        },
        media: [{
            mediaUrl: {
                type: String,
            },
            duration: {
                type: Number,
            },
            fileName: {
                type: String,
            },
            fileSize: {
                type: Number,
            },
            height: {
                type: Number,
            },
            width: {
                type: Number,
            },
            mediaType: {
                type: String,
                enum: ['video', 'image', 'audio', 'gif'],
            },
        }],
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
                        enum: ['text', 'video', 'image', 'audio', 'gif'],
                        default: "",
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

        privacy: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        },
        event: {
            type: {
                name: String,
                date: Date,
                location: String,
                description: String,
            }
        },
        links: {
            type: [String]
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
        },
        moderationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        mentions: {
            type: [String],
        },
        shares: {
            type: [
                {
                    sharedId: {
                        type: String,
                        required: true,
                    },
                    shared_at: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            default: [],
        },
        collections: {
            type: [String],
        },
        permissions: {
            type: {
                edit: [String],
                delete: [String],
                share: [String],
            }
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Post', PostSchema);
