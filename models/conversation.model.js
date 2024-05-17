const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    members: {
        senderId: {
            type: String,
            required: true
        },
        receiverId: {
            type: String,
            required: true
        }
    },
    message: {
        text: {
            type: String,
            //required: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);
