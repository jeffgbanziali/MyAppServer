const router = require("express").Router();
const conversationController = require("../controllers/messages/conversation.controller");







router.post("/", conversationController.createConversation);
router.get("/:id", conversationController.readConversation);
router.delete('/:id', conversationController.deleteConversation);
router.put('/:conversationId/read', conversationController.markConversationAsRead);

module.exports = router;
