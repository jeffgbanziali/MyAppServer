const { sendNotification } = require("../config/firebase");
const express = require('express');
const router = express.Router();


let deviceTokens = [];

// Route pour sauvegarder le token
router.post('/save-token', (req, res) => {
  const { token } = req.body;
  if (!deviceTokens.includes(token)) {
    deviceTokens.push(token);
  }
  console.log('Tokens sauvegardés:', deviceTokens);
  res.status(200).send('Token sauvegardé avec succès');
});

// Route pour envoyer une notification
router.post('/send-notification', async (req, res) => {
  const { title, body } = req.body;
  const token = req.body.token || deviceTokens[0]; // Pour tester, utiliser le premier token sauvegardé

  try {
    const response = await sendNotification(token, title, body);
    console.log('Notification envoyée avec succès:', response);
    res.status(200).send('Notification envoyée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    res.status(500).send('Erreur lors de l\'envoi de la notification');
  }
});

module.exports = router;
  
  module.exports = router;