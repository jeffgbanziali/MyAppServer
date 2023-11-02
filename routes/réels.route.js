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
router.patch("/comment-videoReels/:id", videoRéelsController.commentVideoRéels);

// Voir une vidéo réelle
router.post("/view-videoReels", videoRéelsController.viewVideoRéels);

// Supprimer une vidéo réelle
router.delete("/:id", videoRéelsController.deleteVideoRéels);

module.exports = router;
