const router = require('express').Router()
const conversationController = require('../controllers/message.controller');

//New Conversation

//router.post('/', conversationController.newConversation);

//Get Conversation of a user

router.get('/:coversationId', conversationController.getConversation);


module.exports = router;