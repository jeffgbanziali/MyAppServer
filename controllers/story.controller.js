const StoryModel = require('../models/story.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;
const multer = require('multer');
const { uploadErrors } = require('../utils/errors.utils');
const { uploadStoryToFirebase } = require('../config/firebase');

module.exports.readStories = async (req, res) => {
    try {
        const stories = await StoryModel.find({}).sort({ createdAt: -1 });
        res.send(stories);
    } catch (err) {
        console.error("Error during story retrieval:", err);
        res.status(500).send("Server error");
    }
};

module.exports.readStoriesById = async (req, res) => {
    try {
        const userId = req.params.id;

        const userPosts = await StoryModel.find({ posterId: userId }).sort({ createdAt: -1 });

        res.status(200).json(userPosts);
    } catch (err) {
        console.error('Error while getting user posts:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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

        // Crée un nouvel objet story en fonction de la présence de text, de média et de type de média
        const newStory = {
            text: req.body.text,
            expires_at: req.body.expires_at,
        };

        // Ajoute media et media_type s'ils sont présents
        if (mediaUrl) {
            newStory.media = mediaUrl;
        }

        if (mediaType) {
            newStory.media_type = mediaType;
        }

        // Si le conteneur n'existe pas, crée un nouveau conteneur avec cette histoire
        if (!existingContainer) {
            existingContainer = new StoryModel({
                container: {
                    posterId: req.body.posterId,
                    stories: [newStory],
                },
            });

            await existingContainer.save();
            console.log({ message: 'Story created successfully!', story: newStory });
        } else {
            // Si le conteneur existe, ajoute cette histoire au tableau 'stories'
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



/*module.exports.createStory = async (req, res) => {
    try {
        let mediaUrl = null;

        const mediaName = `${Date.now()}-${req.body.media}`;

        // Vérifie si le conteneur existe pour l'utilisateur
        let existingContainer = await StoryModel.findOne({ 'container.posterId': req.body.posterId });

        // Crée un nouvel objet story en fonction de la présence de texte, de média et de type de média
        const newStory = {
            text: req.body.text,
            media: mediaUrl = await uploadStoryToFirebase(req.body.media, mediaName),
            media_type: req.body.media.type || "image",
            expires_at: req.body.expires_at,
        };

        // Si le conteneur n'existe pas, crée un nouveau conteneur avec cette histoire
        if (!existingContainer) {
            existingContainer = new StoryModel({
                container: {
                    posterId: req.body.posterId,
                    stories: [newStory],
                },
            });

            await existingContainer.save();
            console.log({ message: 'Story created successfully!', story: newStory });
        } else {
            // Si le conteneur existe, ajoute cette histoire au tableau 'stories'
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
};*/





module.exports.likeStory = async (req, res) => {

    console.log('unlikeStory called');
    console.log('req.params.id:', req.params.id);
    console.log('req.body.id:', req.body.id);
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const storyUpdate = await StoryModel.findOneAndUpdate(
            {
                'container.stories._id': req.params.id
            },

            {
                $addToSet: { 'container.stories.$[story].likers': req.body.id },
            },
            { new: true, arrayFilters: [{ 'story._id': req.params.id }] }
        );

        const userUpdate = await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: { likes: req.params.id },
            },
            { new: true }
        );

        res.send({ storyUpdate, userUpdate });
    } catch (err) {
        return res.status(400).send(err);
    }
};


module.exports.unlikeStory = async (req, res) => {

    console.log('unlikeStory called');
    console.log('req.params.id:', req.params.id);
    console.log('req.body.id:', req.body.id);
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const storyUpdate = await StoryModel.findOneAndUpdate(
            {
                'container.stories._id': req.params.id
            },
            {
                $pull: { 'container.stories.$[story].likers': req.body.id },
            },
            { new: true, arrayFilters: [{ 'story._id': req.params.id }] }
        );

        if (!storyUpdate) return res.status(404).send({ message: "Story not found" });

        const userUpdate = await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id },
            },
            { new: true }
        );

        if (!userUpdate) return res.status(404).send({ message: "User not found" });

        res.send({ storyUpdate, userUpdate });
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.deleteStory = async (req, res) => {
    try {
        const container = await StoryModel.findOneAndUpdate(
            { "container.stories._id": req.params.id },
            {
                $pull: {
                    "container.stories": { _id: req.params.id }
                }
            },
            { new: true }
        );

        if (container) {
            res.status(200).json({ message: "Story deleted successfully" });
            console.log("Deleted successfully:", req.params.id);
        } else {
            console.log("Delete error: Container not found");
            res.status(404).json({ message: "Container not found" });
        }
    } catch (err) {
        console.log("Delete error:", err);
        res.status(500).json(err);
    }
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
    const containerId = req.params.containerId;
    const storyId = req.params.storyId;

    if (!ObjectID.isValid(containerId) || !ObjectID.isValid(storyId))
        return res.status(400).send("Invalid IDs: " + containerId + ", " + storyId);

    try {
        const story = await StoryModel.findOne({ 'container._id': containerId, 'container.stories._id': storyId });

        if (!story)
            return res.status(404).send({ message: "Story not found" });

        const viewerId = req.body.viewerId;

        // Parcourir chaque histoire dans le container
        for (let i = 0; i < story.container.stories.length; i++) {
            const currentStory = story.container.stories[i];

            if (currentStory._id.toString() === storyId) {
                // Vérifier si l'utilisateur a déjà vu cette histoire
                const hasViewed = currentStory.views.some(view => view.viewerId === viewerId);

                // Vérifier si le viewer n'est pas le même que le posterId du container
                const isPoster = story.container.posterId === viewerId;

                // Si l'utilisateur n'a pas encore vu cette histoire et n'est pas le poster, l'ajouter à la liste des vues
                if (!hasViewed && !isPoster) {
                    currentStory.views.push({
                        viewerId: viewerId,
                        viewed_at: Date.now(),
                    });
                }
                break; // Sortir de la boucle une fois que l'histoire est trouvée
            }
        }

        await story.save();
        console.log("Story updated with new view:", story);


        res.send(story);
    } catch (err) {
        return res.status(400).send(err);
    }
}



module.exports.getAllStoriesWithViews = async (req, res, next) => {
    try {

        const storiesWithViews = await Story.find().populate("container.stories.views.viewerId");
        res.json(storiesWithViews);
    } catch (err) {
        console.error("Error retrieving stories with views:", err);
        res.status(500).json({ error: "Internal server error" });
    }
},




    // Supprimer les histoires expirées après 24 heures
    setInterval(async () => {
        const currentTime = Date.now();
        try {
            // Rechercher les histoires expirées
            const expiredStories = await StoryModel.find({ 'container.stories.expires_at': { $lt: currentTime } });

            // Supprimer chaque histoire expirée
            for (const story of expiredStories) {
                await StoryModel.findOneAndUpdate(
                    { "container.stories._id": story._id },
                    { $pull: { "container.stories": { _id: story._id } } },
                    { new: true }
                );
            }

            console.log(`${expiredStories.length} expired stories cleaned up`);
        } catch (error) {
            console.error('Error cleaning up expired stories:', error);
        }
    }, 86400000); // Exécuter toutes les 24 heures (24 * 60 * 60 * 1000 millisecondes)

