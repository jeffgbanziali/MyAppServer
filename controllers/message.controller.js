const MessageSchema = require("../models/Message");
const ConversationSchema = require("../models/Conversation");
const router = require("express").Router();


//New Message

module.exports.newMessage = async (req, res) => {
    const newMessage = new MessageSchema(req.body);


    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
        console.log(savedMessage);

    } catch (err) {
        res.status(500).json(err);
    }

}


// new Conversation

module.exports.newConversation = async (req, res) => {
    const newConversation = new ConversationSchema({
        members: [req.body.senderId, req.body.receiverId],
    });

    try {
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
        console.log(savedConversation);
    }
    catch (err) {
        res.status(500).json(err);
    }

}


//Get Conversation of a user


module.exports = router;

module.exports.getConversation = async (req, res) => {

    const conversationId = await ConversationSchema.find({
        members: { $in: [req.params.conversationId] },
    });

    try {
        res.status(200).json(conversationId);
        console.log(conversationId);
    }
    catch (err) {

        res.status(500).json(err);
    }

}

//Get Message of a user

module.exports.getMessage = async (req, res) => {

    const message = await MessageSchema.find({
        conversationId: req.params.conversationId,

    });
    console.log(message);

    try {
        res.status(200).json(message);
        console.log(message);
    }
    catch (err) {

        res.status(500).json(err);
    }

}

//Delete Message

module.exports.deleteMessage = async (req, res) => {

    try {
        await MessageSchema.findByIdAndDelete(req.params.id);
        res.status(200).json("Message has been deleted...");
    }
    catch (err) {
        res.status(500).json(err);
    }

}