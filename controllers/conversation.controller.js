const ConversationModel = require("../models/conversation.model");


module.exports.createConversation = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Vérifiez si une conversation existe déjà
    const exist = await ConversationModel.findOne({
      'members.senderId': senderId,
      'members.receiverId': receiverId,
      "message.text": ""
    });

    if (exist) {
      return res.status(200).json('Conversation already exists');
    }

    // Créez une nouvelle conversation
    const newConversation = new ConversationModel({
      members: {
        senderId: senderId,
        receiverId: receiverId
      },
      message: { text: "" },
    });

    const savedConversation = await newConversation.save();
    console.log("Create new conversation", savedConversation);
    res.status(200).json(savedConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: error.message });
  }
};


module.exports.readConversation = async (req, res) => {
  try {
    const userId = req.params.id;
    const conversations = await ConversationModel.find({
      $or: [
        { 'members.senderId': userId },
        { 'members.receiverId': userId }
      ]
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await ConversationModel.findByIdAndDelete(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: 'Error deleting conversation' });
  }
};

module.exports.markConversationAsRead = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    // Recherche de la conversation dans la base de données
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.message.isRead = true;
    const conversationsSaved = await conversation.save();
   // console.log("Conversation marked as read", conversationsSaved);

    return res.status(200).json({ message: "Conversation marked as read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
