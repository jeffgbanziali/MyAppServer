const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');

// Lire toutes les histoires
router.get('/', storyController.readStories);

// Créer une nouvelle histoire
router.post('/', storyController.createStory);

// Aimer une histoire
router.post('/:id/like', storyController.likeStory);

// Ne pas aimer une histoire
router.post('/:id/dislike', storyController.dislikeStory);

// Supprimer une histoire
router.delete('/:storyId', storyController.deleteStory);

module.exports = router;
