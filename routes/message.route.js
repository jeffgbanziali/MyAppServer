const router = require("express").Router();
const messageController = require("../controllers/messages/message.controller");
const upload = require("../multer");

router.post("/", upload.single('attachment'), messageController.sendMessage);
router.get("/:conversationId", messageController.readMessage);
router.delete("/:messageId", messageController.deleteMessage);
router.put('/conversations/:conversationId/mark-read', messageController.markMessagesAsRead);

module.exports = router;
