const router = require("express").Router();
const MessageModel = require("../models/Message");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

//add

// create message

router.post('/', async (req, res) => {
    try {
        const newMessage = new MessageModel(req.body);
        await newMessage.save();
        res.send(newMessage);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


//get message

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid user ID' });
        }

        const messages = await MessageModel.find({
            $or: [
                { sender: id },
                { receiver: id }
            ]
        });

        res.send(messages);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;