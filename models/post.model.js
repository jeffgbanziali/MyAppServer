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
            default: [], // Tu peux utiliser default pour initialiser à une liste vide si besoin
        },
        comments: {
            type: [
                {
                    commenterId: String,
                    commenterPseudo: String,
                    text: String,
                    timestamp: Number,
                }
            ],
            default: [], // Tu peux utiliser default pour initialiser à une liste vide si besoin
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Post', PostSchema); // J'ai changé 'post' en 'Post' pour respecter les conventions de nommage
