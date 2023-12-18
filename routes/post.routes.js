const router = require('express').Router()
const postController = require('../controllers/post.controller');
const multer = require("multer");
const UserModel = require('../models/user.model');
const upload = multer();

//routes
router.get('/', postController.readPost);
router.get('/:id', postController.getPostsByUser);
router.post('/', upload.single("file"), postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.patch('/like-post/:id', postController.likePost);
router.patch('/unlike-post/:id', postController.unlikePost);

// comment routes
router.patch('/comment-post/:id', postController.commentPost);
router.patch('/edit-comment-post/:id', postController.editCommentPost);
router.patch('/delete-comment-post/:id', postController.deleteCommentPost);
router.post('/comment-post/:id/reply', postController.replyComment); 
router.patch('/like-comment/:postId/:commentId', postController.likeComment);


//postController

module.exports = router;