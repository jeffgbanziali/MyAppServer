const router = require('express').Router()
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');



//authController
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);
router.post('/verify-account', authController.verifyAccount);
router.post('/auth/google', authController.googleSignIn);
//router.post('/change-password/:id', authMiddleware.requireAuth, authController.changePassword);


//userController
router.get('/', userController.getAllUsers);
router.patch("/updateProfile/:id", userController.updateProfile);
router.get('/:id', userController.userInfo);
router.patch("/:id", userController.updateBio);
router.put("/:id", userController.updatePseudo);
router.put('/user-modify/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/follow/:id', userController.follow);
router.patch('/unfollow/:id', userController.unfollow);
router.get('/friends/:id', userController.getFriends);
router.post('/addFavPost', userController.addFavoritePost);
router.post('/removeFavPost', userController.removeFavoritePost);
router.post('/savedPost', userController.savedPost);
//router.post('/remSavedPost', userController.removeSavedPost);




module.exports = router;