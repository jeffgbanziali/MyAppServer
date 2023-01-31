const router = require('express').Router();
const Message = require('../models/Message');


// 
router.post('/messages', (req, res) => {
    const message = new Message({
        conversationId: req.body.conversationId,
        sender: req.body.sender,
        text: req.body.text
    });
    message.save()
        .then(() => {
            res.status(201).json({
                message: 'Message envoyé avec succès'
            });
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
});

// 
router.get('/messages', (req, res) => {
    Message.find()
        .then(messages => {
            res.status(200).json(messages);
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
});



module.exports = router;