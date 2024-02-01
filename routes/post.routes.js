const router = require('express').Router()
const postController = require('../controllers/post.controller');
const path = require('path');
const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, 'uploads/posts') });


//routes
router.get('/', postController.readPost);
router.get('/:id', postController.getPostsByUser);
router.post('/', upload.array("file", 5), postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.patch('/like-post/:id', postController.likePost);
router.patch('/unlike-post/:id', postController.unlikePost);

// comment routes
router.patch('/comment-post/:id', postController.commentPost);
router.patch('/edit-comment-post/:id', postController.editCommentPost);
router.delete('/delete-comment-post/:id', postController.deleteCommentPost);
router.post('/comment-post/:id/reply', postController.replyComment);
router.patch('/like-comment/:postId/:commentId', postController.likeComment);
router.patch('/unlike-comment/:postId/:commentId', postController.unlikeComment);
router.patch('/like-reply/:postId/:commentId/:replyId', postController.likeReply);
router.patch('/unlike-reply/:postId/:commentId/:replyId', postController.unlikeReply);

//postController

module.exports = router;