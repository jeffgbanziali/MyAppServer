const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const UserModel = require('../models/user.model');

// Créer une nouvelle conversation
router.post("/", async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        const conversationExists = await Conversation.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (conversationExists) {
            res.status(409).json({ message: 'Conversation already exists' });
            return;
        }

        const newConversation = new Conversation({
            members: [senderId, receiverId]
        });

        const savedConversation = await newConversation.save();

        res.status(201).json(savedConversation);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create conversation', error: err });
    }
});

// Obtenir toutes les conversations d'un utilisateur
// Obtenir les conversations d'un utilisateur
router.get("/:id", async (req, res) => {
    try {
        // Récupération des conversations de l'utilisateur
        const conversations = await Conversation.find({
            members: { $in: [req.params.id] },
        });

        // Récupération des pseudos et images associées à chaque conversation
        const conversationsWithUserInfo = await Promise.all(
            conversations.map(async (conversation) => {
                const conversationInfo = conversation.toObject();
                for (let i = 0; i < conversationInfo.members.length; i++) {
                    const userId = conversationInfo.members[i];
                    const user = await UserModel.findById(userId);
                    if (!user) {
                        console.log(`User with ID ${userId} not found`);
                        continue;
                    }
                    conversationInfo.members[i] = {
                        _id: user._id,
                        pseudo: user.pseudo,
                        picture: user.picture,
                    };
                }
                return conversationInfo;
            })
        );

        res.status(200).json(conversationsWithUserInfo);
    } catch (err) {
        res.status(500).json(err);
    }
});



// Obtenir une conversation en particulier
router.get("/:firstUserId/:secondUserId", async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] }
        });

        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        const members = await User.find({ _id: { $in: conversation.members } });
        const { _id, ...rest } = conversation.toObject();
        const conversationWithUserInfo = {
            id: _id,
            members: members.map((user) => ({
                id: user._id,
                pseudo: user.pseudo,
                picture: user.picture
            })),
            ...rest
        };

        res.status(200).json(conversationWithUserInfo);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get conversation', error: err });
    }
});


module.exports = router;
