const express = require("express");
const router = express.Router();
const videoRéelsController = require("../controllers/réels.controller");

// Lire toutes les vidéos réelles
router.get("/", videoRéelsController.readVideoRéels);
router.get("/:id", videoRéelsController.readVideoRéelsById);

// Créer une nouvelle vidéo réelle
router.post("/", videoRéelsController.createVideoRéels);

// Aimer une vidéo réelle
router.patch("/like-videoReels/:id", videoRéelsController.likeVideoRéels);

// Ne pas aimer une vidéo réelle
router.patch("/dislike-videoReels/:id", videoRéelsController.dislikeVideoRéels);

// Commenter une vidéo réelle
router.patch('/comment-post/:id', videoRéelsController.commentVideoRéels);
router.patch('/edit-comment-post/:id', videoRéelsController.editCommentVideoRéels);
router.patch('/delete-comment-post/:id', videoRéelsController.deleteCommentVideoRéels);
router.post('/comment-post/:id/reply', videoRéelsController.replyCommentVideoRéels);
router.patch('/like-comment/:postId/:commentId', videoRéelsController.likeCommentVideoRéels);
router.patch('/unlike-comment/:postId/:commentId', videoRéelsController.unlikecommentVideoRéels);
router.patch('/like-reply/:postId/:commentId/:replyId', videoRéelsController.likeReplyCommentVideoRéels);
router.patch('/unlike-reply/:postId/:commentId/:replyId', videoRéelsController.unlikeReplyCommentVideoRéels);
// Voir une vidéo réelle
router.post("/view-videoReels", videoRéelsController.viewVideoRéels);

// Supprimer une vidéo réelle
router.delete("/:id", videoRéelsController.deleteVideoRéels);

module.exports = router;
