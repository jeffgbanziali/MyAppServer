const router = require("express").Router();
const conversationController = require("../controllers/conversation.controller");







router.post("/", conversationController.createConversation);
router.get("/:id", conversationController.readConversation);

module.exports = router;
