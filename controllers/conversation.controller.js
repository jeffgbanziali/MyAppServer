const ConversationModel = require("../models/conversation.model");

module.exports.createConversation = async (req, res) => {
  let senderId = req.body.senderId;
  let receiverId = req.body.receiverId;

  const exist = await ConversationModel.findOne({ members: { $all: [receiverId, senderId] } });

  if (exist) {
    res.status(200).json('Conversation already exists');
    return;
  }

  const newConversation = new ConversationModel({
    members: [senderId, receiverId]
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports.readConversation = async (req, res) => {
  try {
    const conversations = await ConversationModel.find({
      members: req.params.id,
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json(error);
  }
};
