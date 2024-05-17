const router = require("express").Router();
const messageController = require("../controllers/message.controller");
const upload = require("../multer");

router.post("/", upload.single('attachment'), messageController.sendMessage);
router.get("/:conversationId", messageController.readMessage);
router.delete("/:messageId", messageController.deleteMessage);
router.put('/markAsRead/:conversationId', messageController.markMessagesAsRead);

module.exports = router;
