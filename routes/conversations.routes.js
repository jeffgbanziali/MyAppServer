const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

// Récupérer toutes les conversations
router.get('/', async (req, res) => {
    try {
        const conversations = await Conversation.find();
        res.json(conversations);
        console.log(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
        console.log(err);
    }
});

// Obtenir une conversation spécifique
router.get('/:id', getConversation, (req, res) => {
    res.json(res.conversation);
    cosnole.log(res.conversation);
});

// Créer une nouvelle conversation
router.post('/', async (req, res) => {
    const conversation = new Conversation({
        members: req.body.members
    });
    try {
        const newConversation = await conversation.save();
        res.status(201).json(newConversation);
        console.log(newConversation);
    } catch (err) {
        res.status(400).json({ message: err.message });
        console.log(err);
    }
});

// Mettre à jour une conversation
router.patch('/:id', getConversation, async (req, res) => {
    if (req.body.members != null) {
        res.conversation.members = req.body.members;
    }
    try {
        const updatedConversation = await res.conversation.save();
        res.json(updatedConversation);
        console.log(updatedConversation);
    } catch (err) {
        res.status(400).json({ message: err.message });
        console.log(err);
    }
});

// Supprimer une conversation
router.delete('/:id', getConversation, async (req, res) => {
    try {
        await res.conversation.remove();
        res.json({ message: 'Conversation supprimée' });
        console.log('Conversation supprimée');
    } catch (err) {
        res.status(500).json({ message: err.message });
        console.log(err);
    }
});

// Middleware pour récupérer une conversation spécifique
async function getConversation(req, res, next) {
    let conversation;
    try {
        conversation = await Conversation.findById(req.params.id);
        if (conversation == null) {
            return res.status(404).json({ message: 'Impossible de trouver la conversation' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
        console.log(err);
    }

    res.conversation = conversation;
    next();
}

module.exports = router;
