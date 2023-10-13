const router = require("express").Router();
const messageController = require("../controllers/message.controller");

router.post("/", messageController.sendMessage);
router.get("/:conversationId", messageController.readMessage);

module.exports = router;
