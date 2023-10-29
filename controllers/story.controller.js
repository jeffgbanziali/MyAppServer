const StoryModel = require('../models/story.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;
const { uploadErrors } = require('../utils/errors.utils');

module.exports.readStories = (req, res) => {
    StoryModel.find({}, 'container', (err, containers) => {
        if (!err) {
            res.send(containers);
        } else {
            console.log("Erreur lors de la récupération des données : " + err);
            res.status(500).send("Erreur serveur");
        }
    }).sort({ createdAt: -1 });
};

module.exports.createStory = async (req, res) => {
    try {
        let mediaUrl = null;
        let mediaType = null;

        if (req.body.media) {
            mediaUrl = req.body.media.url;
            mediaType = req.body.media.type;
        }

        // Vérifie si le conteneur existe pour l'utilisateur
        let existingContainer = await StoryModel.findOne({ 'container.posterId': req.body.posterId });

        // Si le conteneur n'existe pas, crée un nouveau conteneur avec cette histoire
        if (!existingContainer) {
            existingContainer = new StoryModel({
                container: {
                    posterId: req.body.posterId,
                    stories: [
                        {
                            text: req.body.text,
                            expires_at: req.body.expires_at,
                            media: mediaUrl,
                            media_type: mediaType
                        },
                    ],
                },
            });

            await existingContainer.save();
            console.log({ message: 'Story created successfully!', story: existingContainer.container.stories[0] });
        } else {
            // Si le conteneur existe, ajoute cette histoire au tableau 'stories'
            const newStory = {
                text: req.body.text,
                expires_at: req.body.expires_at,
                media: mediaUrl,
                media_type: mediaType,
            };

            existingContainer.container.stories.push(newStory);

            // Enregistre le conteneur mis à jour dans la base de données
            await existingContainer.save();
            console.log({ message: 'Story added to container successfully!', story: newStory });
        }

        res.status(201).json({ message: 'Story added to container successfully' });
    } catch (err) {
        console.error('Error during story creation:', err);
        let errorMessage = 'An error occurred during story creation.';
        if (err.message) errorMessage = err.message;

        const errors = uploadErrors(errorMessage);
        res.status(500).json({ errors });
    }
};



module.exports.likeStory = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await StoryModel.findOneAndUpdate(
            { 'container.stories._id': req.params.id },
            {
                $addToSet: { 'container.stories.$.likers': req.body.id },
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

module.exports.unlikeStory = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        let storyUpdate = await StoryModel.findOneAndUpdate(
            { 'container.stories._id': req.params.id },
            {
                $pull: { 'container.stories.$.likers': req.body.id },
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

module.exports.deleteStory = (req, res) => {

    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    StoryModel.findByIdAndRemove(req.params.id, (err, docs) => {
        if (!err) res.send(docs);
        else console.log("Delete error : " + err);
    });
};

module.exports.commentStory = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const updatedStory = await StoryModel.findOneAndUpdate(
            { 'container.stories._id': req.params.id },
            {
                $push: {
                    'container.stories.$.comments': {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp: new Date().getTime(),
                    },
                },
            },
            { new: true }
        );

        const lastComment = updatedStory.container.stories[0].comments[updatedStory.container.stories[0].comments.length - 1];
        const commentId = lastComment._id;

        res.send({ commentId });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};


module.exports.viewStory = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const story = await StoryModel.findOne({ 'container.stories._id': req.params.id });

        if (!story) return res.status(404).send({ message: "Story not found" });

        const viewerId = req.body.viewerId;

        if (!story.container.stories[0].views.find((view) => view.viewerId === viewerId)) {
            story.container.stories[0].views.push({
                viewerId: viewerId,
                viewed_at: Date.now(),
            });

            await story.save();
        }

        res.send(story);
    } catch (err) {
        return res.status(400).send(err);
    }
};

// Suppression des histoires après 24 heures
setInterval(async () => {
    const currentTime = Date.now();
    try {
        const storiesToDelete = await StoryModel.find({
            'container.stories.expires_at': { $lt: currentTime },
        });

        for (const story of storiesToDelete) {
            await StoryModel.findByIdAndRemove(story._id);
        }

        console.log(`${storiesToDelete.length} expired stories cleaned up`);
    } catch (error) {
        console.error('Error cleaning up expired stories:', error);
    }
}, 86400000); // Exécute la vérification toutes les 24 heures (24 * 60 * 60 * 1000 milliseconds)
