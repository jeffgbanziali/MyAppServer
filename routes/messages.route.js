const router = require('express').Router()
const messageController = require('../controllers/message.controller');


//New Message


//router.post('/', messageController.getMessage);

//Get Conversation of a user

router.get('/:conversationId', messageController.getConversation);






module.exports = router;