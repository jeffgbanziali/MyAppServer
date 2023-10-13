const MessageModel = require("../models/message.model");

module.exports.sendMessage = async (req, res) => {
  const newMessage = new MessageModel(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.readMessage = async (req, res) => {
  try {
    const message = await MessageModel.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json(err);
  }
};
