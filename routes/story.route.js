const express = require('express');
const router = express.Router();
const multer = require("multer");
const storyController = require('../controllers/stories/story.controller');
const storageConfig = multer.memoryStorage();
const upload = multer({ storage: storageConfig });

// Lire toutes les histoires
router.get('/', storyController.readStories);
router.get('/:id', storyController.readStoriesById);

// Créer une nouvelle histoire
router.post('/', storyController.createStory);
//router.post('/', upload.single("filename"), storyController.createStory);

// Aimer une histoire
router.patch('/like-story/:id', storyController.likeStory);

// Ne pas aimer une histoire
router.patch('/dislike-story/:id', storyController.unlikeStory);


// Commenter une histoire
router.patch('/comment-story/:id', storyController.commentStory);

// Voir une histoire
router.post('/view-story/:containerId/:storyId', storyController.viewStory);


router.get("/storiesWithViews", storyController.getAllStoriesWithViews);


// Supprimer une histoire
router.delete('/:id', storyController.deleteStory);

module.exports = router;
