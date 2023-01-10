const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;


//read post model

module.exports.readPost = (req, res) => {
    PostModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log("Error to get data : " + err);
    }).sort({ createdAt: -1 });
};

// create post model

module.exports.createPost = async (req, res) => {
    const newPost = new PostModel({
        userId: req.body.userId,
        message: req.body.message,
        video: req.body.video,
        likers: [],
        comments: [],
    });

    try {
        const post = await newPost.save();
        return res.status(201).json(post);
    } catch (err) {
        return res.status(400).send(err);
    }
};

// update post model

module.exports.updatePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    const updatedRecord = {
        message: req.body.message,
    }

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

// delete post model

module.exports.deletePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    PostModel.findByIdAndDelete(req.params.id, (err, docs) => {
        if (!err) res.send(docs);
        else console.log("Delete error : " + err);
    });
};


// like post model 

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
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));

        await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: { likes: req.params.id },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
}


//unlike post model

module.exports.unlikePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));

        await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
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