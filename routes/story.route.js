const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');

// Lire toutes les histoires
router.get('/', storyController.readStories);
router.get('/:id', storyController.readStoriesById);

// Créer une nouvelle histoire
router.post('/', storyController.createStory);

// Aimer une histoire
router.patch('/like-story/:id', storyController.likeStory);

// Ne pas aimer une histoire
router.patch('/dislike-story/:id', storyController.unlikeStory);


// Commenter une histoire
router.patch('/comment-story/:id', storyController.commentStory);

// Voir une histoire
router.patch('/view-story/:id', storyController.viewStory);


// Supprimer une histoire
router.delete('/:id', storyController.deleteStory);

module.exports = router;
