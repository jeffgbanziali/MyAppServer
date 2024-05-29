const StoryModel = require('../../models/story.model');
const UserModel = require('../../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;
const multer = require('multer');
const { uploadErrors } = require('../../utils/errors.utils');
const { uploadStoryToFirebase } = require('../../config/firebase');

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
        let media = null;
        let mediaType = null;

        if (req.body.media) {
            media = {
                url: req.body.media.url,
                duration: req.body.media.duration,
                fileName: req.body.media.fileName,
                fileSize: req.body.media.fileSize,
                height: req.body.media.height,
                width: req.body.media.width,
            };
            mediaType = req.body.media.type; // Correction : assigner le type de média à partir de req.body.media.type
        }

        // Vérifie si le conteneur existe pour l'utilisateur
        let existingContainer = await StoryModel.findOne({ 'container.posterId': req.body.posterId });

        // Crée un nouvel objet story en fonction de la présence de text, de média et de type de média
        const newStory = {
            text: req.body.text,
            expires_at: req.body.expires_at,
        };

        // Ajoute media s'il est présent
        if (media) {
            newStory.media = media;
        }

        // Ajoute media_type s'il est présent
        if (mediaType) {
            newStory.media_type = mediaType;
        }

        //newStory.expires_at = new Date(+new Date() + 24 * 60 * 60 * 1000);
        newStory.expires_at = new Date(+new Date() + 30 * 1000);


        // Si le conteneur existe, ajoute cette histoire au tableau 'stories'
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
            // Vérifie si newStory contient la propriété media avant de l'ajouter
            if (newStory.media) {
                existingContainer.container.stories.push(newStory);
            } else {
                // Générez une erreur ou faites une manipulation appropriée si media est manquant
                console.error('Error: Media is required for the story.');
                throw new Error('Media is required for the story.');
            }

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
            // Si le conteneur n'a plus d'histoires, supprimez le conteneur entièrement
            if (container.container.stories.length === 0) {
                await StoryModel.findByIdAndDelete(container._id);
                console.log("Container deleted successfully:", container._id);
                res.status(200).json({ message: "Container deleted successfully" });
            } else {
                console.log("Story deleted successfully:", req.params.id);
                res.status(200).json({ message: "Story deleted successfully" });
            }
        } else {
            console.log("Delete error: Story not found");
            res.status(404).json({ message: "Story not found" });
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
}




//fonction pour la suppresion automatique d'une story après 24h 
async function cleanUpExpiredStories() {
    const currentTime = Date.now();
    console.log("C'est toi le currentTime", currentTime);
    try {
        // Rechercher  les histoires expirées
        const expiredStories = await StoryModel.find({ 'container.stories.expires_at': { $lte: currentTime } });


        for (const story of expiredStories) {


            const myId = story._id.toString()

            const container = story.container;
            let updatedStories = container.stories.filter(story => story.expires_at = currentTime);

            if (updatedStories.length === 0) {
                // Si le conteneur ne contient plus aucune histoire, le supprimer
                await StoryModel.findByIdAndDelete(myId);
                console.log(`Container deleted for posterId: ${container.posterId}`);
            } else {
                // Mettre à jour le conteneur avec les histoires non expirées
                await StoryModel.findOneAndUpdate(
                    { _id: story._id },
                    { $set: { 'container.stories': updatedStories } }
                );
                const deletedStoriesCount = container.stories.length - updatedStories.length;
                console.log(`${deletedStoriesCount} expired stories cleaned up for posterId: ${container.posterId}`);
            }
        }

        console.log(`${expiredStories.length} expired stories cleaned up`);
    } catch (error) {
        console.error('Error cleaning up expired stories:', error);
    }
}

setInterval(cleanUpExpiredStories, 86400000);

