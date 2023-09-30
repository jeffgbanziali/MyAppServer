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
module.exports.commentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp: new Date().getTime(),
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