const ConversationModel = require("../models/conversation.model");

module.exports.createConversation = async (req, res) => {
  const newConversation = new ConversationModel({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.readConversation = async (req, res) => {
    try {
      const conversations = await ConversationModel.find({
        members: req.params.id,
      });
      res.status(200).json(conversations);
    } catch (err) {
      res.status(500).json(err);
    }
  };
  
