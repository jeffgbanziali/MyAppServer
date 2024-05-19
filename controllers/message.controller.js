const conversationModel = require("../models/conversation.model");
const MessageModel = require("../models/message.model");

module.exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, conversationId, text, attachment } = req.body;

  let newMessage;

  // Crée le nouveau message en fonction des données reçues
  if (text && attachment && attachment.type === "image") {
    newMessage = new MessageModel({
      senderId,
      receiverId,
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
      receiverId,
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
      receiverId,
      conversationId,
      text,
    });
  } else if (attachment && attachment.type === "image") {
    newMessage = new MessageModel({
      senderId,
      receiverId,
      conversationId,
      attachment: {
        type: "image",
        url: attachment.url,
      },
    });
  } else if (attachment && attachment.type === "document") {
    newMessage = new MessageModel({
      senderId,
      receiverId,
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

      // Vérifie si c'est le premier message de la conversation
      const conversation = await conversationModel.findById(conversationId);
      let updateData = {};

      if (!conversation.message || !conversation.message.text || conversation.message.text.length === 0) {
        // Si c'est le premier message, met à jour les membres de la conversation et le message
        updateData = {
          members: {
            senderId: senderId,
            receiverId: receiverId
          },
          message: {
            text: text,
            isRead: false
          }
        };
      } else {
        // Si ce n'est pas le premier message, met à jour seulement le message et les membres
        updateData = {
          $set: {
            "members.senderId": senderId,
            "members.receiverId": receiverId,
            "message.text": text,
            "message.isRead": false
          }
        };
      }

      // Mettre à jour la conversation avec les données de mise à jour
      await conversationModel.findByIdAndUpdate(
        conversationId,
        updateData,
        { new: true }
      );

      res.status(200).json(savedMessage);
      //console.log("Enregistre toi", savedMessage)
    } else {
      res.status(400).json({ error: "Invalid message format" });
    }
  } catch (err) {
    res.status(500).json(err);
  }

};


module.exports.markMessagesAsRead = async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;

  try {
    await MessageModel.updateMany(
      {
        conversationId: conversationId,
        receiverId: userId,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: "Error marking messages as read" });
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


