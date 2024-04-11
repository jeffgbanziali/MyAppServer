const conversationModel = require("../models/conversation.model");
const MessageModel = require("../models/message.model");

module.exports.sendMessage = async (req, res) => {
  const { senderId, conversationId, text, attachment } = req.body;

  let newMessage;

  // Crée le nouveau message en fonction des données reçues
  if (text && attachment && attachment.type === "image") {
    newMessage = new MessageModel({
      senderId,
      conversationId,
      text,
      attachment: {
        type: "image",
        url: attachment.url,
      },
    });
  } else if (text && attachment && attachment.type === "document") {
    newMessage = new MessageModel({
      senderId,
      conversationId,
      text,
      attachment: {
        type: "document",
        url: attachment.url,
      },
    });
  } else if (text) {
    newMessage = new MessageModel({
      senderId,
      conversationId,
      text,
    });
  } else if (attachment && attachment.type === "image") {
    newMessage = new MessageModel({
      senderId,
      conversationId,
      attachment: {
        type: "image",
        url: attachment.url,
      },
    });
  } else if (attachment && attachment.type === "document") {
    newMessage = new MessageModel({
      senderId,
      conversationId,
      attachment: {
        type: "document",
        url: attachment.url,
      },
    });
  }

  try {
    if (newMessage) {
      // Enregistre le nouveau message dans la base de données
      const savedMessage = await newMessage.save();

      // Met à jour le champ 'message' dans le modèle de conversation avec le texte du nouveau message
      await conversationModel.findByIdAndUpdate(
        conversationId,
        { message: text }, // Met à jour le champ 'message' avec le texte du nouveau message
        { new: true } // Renvoie le document mis à jour après la mise à jour
      );

      res.status(200).json(savedMessage);
    } else {
      res.status(400).json({ error: "Invalid message format" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};



module.exports.readMessage = async (req, res) => {
  try {
    const messages = await MessageModel.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.deleteMessage = async (req, res) => {
  try {
    const deletedMessage = await MessageModel.findByIdAndRemove(req.params.messageId);

    if (deletedMessage) {
      res.status(200).json({ message: "Message deleted successfully" });
    } else {
      res.status(404).json({ message: "Message not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};


