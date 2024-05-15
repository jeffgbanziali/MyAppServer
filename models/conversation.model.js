const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    members: {
        type: Array
    },
    message: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
},
    {
        timestamps: true
    }
);
module.exports = mongoose.model('Conversation', ConversationSchema);