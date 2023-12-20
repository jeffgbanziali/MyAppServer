const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const { uploadErrors } = require('../utils/errors.utils');
const ObjectID = require('mongoose').Types.ObjectId;
const sizeOf = require('image-size');


const MAX_FILE_SIZE = 500000;
const ALLOWED_IMAGE_TYPES = ["image/jpg", "image/png", "image/jpeg"];

module.exports.readPost = (req, res) => {
    PostModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log("Error to get data : " + err);
    }).sort({ createdAt: -1 });
};


module.exports.getPostsByUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const userPosts = await PostModel.find({ posterId: userId }).sort({ createdAt: -1 });

        res.status(200).json(userPosts);
    } catch (err) {
        console.error('Error while getting user posts:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports.createPost = async (req, res) => {
    try {
        let imageUrl = null;  // Initialise imageUrl à null

        // Vérifie si l'URL de l'image a été envoyée depuis le client
        if (req.body.imageFileName) {
            imageUrl = req.body.imageFileName;
        }

        // Création d'une nouvelle instance du modèle de poste
        const newPost = new PostModel({
            posterId: req.body.posterId,
            message: req.body.message,
            picture: imageUrl,  // Utilise l'URL de l'image
            likers: [],
            comments: [],
        });

        // Sauvegarde du nouveau poste dans la base de données MongoDB
        const savedPost = await newPost.save();
        console.log('Post saved to MongoDB:', savedPost);

        // Renvoie les informations nécessaires au front-end
        res.status(201).json({
            _id: savedPost._id,
            posterId: savedPost.posterId,
            message: savedPost.message,
            imageFileName: savedPost.imageFileName,
            likers: savedPost.likers,
            comments: savedPost.comments,
            createdAt: savedPost.createdAt,
            updatedAt: savedPost.updatedAt,
        });
    } catch (err) {
        console.error('Error during post creation:', err);
        let errorMessage = 'An error occurred during post creation.';
        if (err.message) errorMessage = err.message;

        const errors = uploadErrors(errorMessage);
        res.status(500).json({ errors });
    }
};



module.exports.updatePost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    const updatedRecord = {
        message: req.body.message,
    };

    PostModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true },
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("Update error : " + err);
        }
    );
};

module.exports.deletePost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    PostModel.findByIdAndRemove(req.params.id, (err, docs) => {
        if (!err) res.send(docs);
        else console.log("Delete error : " + err);
    });
};


//like post model
module.exports.likePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { likers: req.body.id },
            },
            { new: true })
            .then((data) => {
                UserModel.findByIdAndUpdate(
                    req.body.id,
                    {
                        $addToSet: { likes: req.params.id },
                    },
                    { new: true })
                    .then((data) => res.send(data))
                    .catch((err) => res.status(501).send({ message: err }));
            })
            .catch((err) => res.status(502).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};

//unlikde post model
module.exports.unlikePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        let postUpdate = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id },
            },
            { new: true });
        if (!postUpdate) return res.status(404).send({ message: "Post not found" });

        let userUpdate = await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id },
            },
            { new: true });
        if (!userUpdate) return res.status(404).send({ message: "User not found" });

        res.send(postUpdate);
    } catch (err) {
        return res.status(400).send(err);
    }
};





//write comment the post
module.exports.commentPost = async (req, res) => {
    try {
        // Validate post ID
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send("ID unknown : " + req.params.id);

        // Initialize media variables
        let mediaUrl = null;
        let mediaType = null;

        // Check if media exists in the request
        if (req.body.media) {
            mediaUrl = req.body.media.url;
            mediaType = req.body.media.type;
        }

        // Update the post with a new comment
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp: new Date().getTime(),
                        commentMedia: req.body.commentMedia,
                        commentType: req.body.commentType,
                    },
                },
            },
            { new: true }
        );

        // Add media properties to the post if they exist
        if (mediaUrl) {
            updatedPost.commentMedia = mediaUrl;
        }

        if (mediaType) {
            updatedPost.commentType = mediaType;
        }

        // Get the ID of the last added comment
        const lastComment = updatedPost.comments[updatedPost.comments.length - 1];
        const commentId = lastComment._id;

        // Send the response with the comment ID
        res.send({ commentId });
    } catch (err) {
        // Log and handle errors
        console.error('Error during comment operation:', err);
        return res.status(500).send({ message: 'An error occurred during comment operation.' });
    }
};


// Reply to a comment on a post
module.exports.replyComment = async (req, res) => {
    try {
        // Validate post ID
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send("ID unknown : " + req.params.id);

        // Extract necessary information
        const postId = req.params.id;
        const commentId = req.body.commentId;
        const repliedTo = req.body.repliedTo;

        // Initialize media variables
        let mediaUrl = null;
        let mediaType = null;

        // Check if media exists in the request
        if (req.body.media) {
            mediaUrl = req.body.media.url;
            mediaType = req.body.media.type;
        }

        // Construct the update object for adding a reply
        const update = {
            $push: {
                "comments.$[outerComment].replies": {
                    replierId: req.body.replierId,
                    replierPseudo: req.body.replierPseudo,
                    text: req.body.text,
                    timestamp: new Date().getTime(),
                    replyMedia: req.body.replyMedia,
                    replyType: req.body.replyType,
                    repliedTo: req.body.repliedTo,
                },
            },
        };

        // Add media properties to the update object if they exist
        if (mediaUrl) {
            update.replyMedia = mediaUrl;
        }

        if (mediaType) {
            update.replyType = mediaType;
        }

        // Add repliedTo information to the update object if provided
        if (repliedTo) {
            update.$push["comments.$[outerComment].replies"].repliedTo = {
                replierToId: repliedTo.replierToId || null,
                replierToPseudo: repliedTo.replierToPseudo || null,
            };
        }

        // Update the post with the new reply
        const updatedPost = await PostModel.findByIdAndUpdate(
            postId,
            update,
            {
                new: true,
                arrayFilters: [{ "outerComment._id": commentId }],
            }
        );

        // Send the updated post in the response
        res.send(updatedPost);
    } catch (err) {
        // Log and handle errors
        console.error('Error during reply operation:', err);
        return res.status(500).send({ message: 'An error occurred during reply operation.' });
    }
};


// edit a comment post
module.exports.editCommentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        return PostModel.findById(req.params.id, (err, docs) => {
            const theComment = docs.comments.find((comment) =>
                comment._id.equals(req.body.commentId)
            );

            if (!theComment) return res.status(404).send("Comment not found");
            theComment.text = req.body.text;

            return docs.save((err) => {
                if (!err) return res.status(200).send(docs);
                return res.status(500).send(err);
            });
        });
    } catch (err) {
        return res.status(400).send(err);
    }
};

// delete a comment post
module.exports.deleteCommentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: {
                        _id: req.body.commentId,
                    },
                },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};

// like a comment post

module.exports.likeComment = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const userId = req.body.userId;

    if (!ObjectID.isValid(postId) || !ObjectID.isValid(commentId))
        return res.status(400).send("Invalid post or comment ID");

    try {
        const updatedPost = await PostModel.findOneAndUpdate(
            { _id: postId, "comments._id": commentId },
            {
                $addToSet: { "comments.$.commentLikers": userId },
            },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).send("Post or comment not found");
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                $addToSet: { likedComments: commentId },
            },
            { new: true }
        );

        res.send({ updatedPost, updatedUser });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


