const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');

// Lire toutes les histoires
router.get('/', storyController.readStories);

// Créer une nouvelle histoire
router.post('/', storyController.createStory);

// Aimer une histoire
router.post('/:id/like-story', storyController.likeStory);

// Ne pas aimer une histoire
router.post('/:id/dislike-story', storyController.dislikeStory);

// Commenter une histoire
router.post('/comment-story', storyController.commentStory);

// Voir une histoire
router.post('/view-story', storyController.viewStory);

// Supprimer une histoire
router.delete('/:storyId', storyController.deleteStory);

module.exports = router;
