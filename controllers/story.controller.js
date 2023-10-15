const StoryModel = require('../models/story.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.readStories = (req, res) => {
    StoryModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log("Error to get data : " + err);
    }).sort({ createdAt: -1 });
};

module.exports.createStory = async (req, res) => {
    try {
        let mediaUrl = null;

        if (req.body.mediaFileName) {
            mediaUrl = req.body.mediaFileName;
        }

        const newStory = new StoryModel({
            posterId: req.body.posterId,
            content: req.body.content,
            media: mediaUrl,
            music: req.body.music,
            expires_at: req.body.expires_at,
            allowedViewers: req.body.allowedViewers,
            likers: [],
            comments: [],
        });

        const savedStory = await newStory.save();
        console.log('Story saved to MongoDB:', savedStory);

        res.status(201).json({
            _id: savedStory._id,
            posterId: savedStory.posterId,
            content: savedStory.content,
            mediaFileName: savedStory.mediaFileName,
            music: savedStory.music,
            expires_at: savedStory.expires_at,
            allowedViewers: savedStory.allowedViewers,
            likers: savedStory.likers,
            comments: savedStory.comments,
            createdAt: savedStory.createdAt,
            updatedAt: savedStory.updatedAt,
        });
    } catch (err) {
        console.error('Error during story creation:', err);
        let errorMessage = 'An error occurred during story creation.';
        if (err.message) errorMessage = err.message;

        res.status(500).json({ errors: { message: errorMessage } });
    }
};

// Like story
module.exports.likeStory = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await StoryModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { likers: req.body.id },
            },
            { new: true }
        )
            .then((data) => {
                UserModel.findByIdAndUpdate(
                    req.body.id,
                    {
                        $addToSet: { likes: req.params.id },
                    },
                    { new: true }
                )
                    .then((data) => res.send(data))
                    .catch((err) => res.status(501).send({ message: err }));
            })
            .catch((err) => res.status(502).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};

// Dislike story
module.exports.dislikeStory = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        let storyUpdate = await StoryModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id },
            },
            { new: true }
        );
        if (!storyUpdate) return res.status(404).send({ message: "Story not found" });

        let userUpdate = await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id },
            },
            { new: true }
        );
        if (!userUpdate) return res.status(404).send({ message: "User not found" });

        res.send(storyUpdate);
    } catch (err) {
        return res.status(400).send(err);
    }
};

// ...

module.exports.commentStory = async (req, res) => {
    const { storyId, commenterId, commenterPseudo, text } = req.body;

    try {
        const story = await StoryModel.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        const comment = {
            commenterId,
            commenterPseudo,
            text,
            timestamp: Date.now(),
        };

        story.comments.push(comment);

        const updatedStory = await story.save();

        res.json(updatedStory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.viewStory = async (req, res) => {
    const { storyId, viewerId } = req.body;

    try {
        const story = await StoryModel.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        const view = {
            viewerId,
            viewed_at: Date.now(),
        };

        story.views.push(view);

        const updatedStory = await story.save();

        res.json(updatedStory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ...


module.exports.deleteStory = async (req, res) => {
    if (!ObjectID.isValid(req.params.storyId))
        return res.status(400).send("ID unknown : " + req.params.storyId);

    try {
        const deletedStory = await StoryModel.findByIdAndRemove(req.params.storyId);
        if (!deletedStory) return res.status(404).send({ message: "Story not found" });

        // Retire la référence de la story supprimée des likes des utilisateurs
        await UserModel.updateMany({ likes: req.params.storyId }, { $pull: { likes: req.params.storyId } });

        res.send(deletedStory);
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

const cleanExpiredStories = async () => {
    const now = new Date();
    try {
        await StoryModel.deleteMany({ expires_at: { $lt: now } });
        console.log('Expired stories cleaned up');
    } catch (error) {
        console.error('Error cleaning up expired stories:', error);
    }

    // Exécute la fonction de nettoyage toutes les 24 heures (86400000 millisecondes)

};
setInterval(cleanExpiredStories, 86400000);


