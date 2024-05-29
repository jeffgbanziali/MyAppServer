const router = require('express').Router()
const authController = require('../controllers/users/auth.controller');
const userController = require('../controllers/users/user.controller');
const userPasswordController = require('../controllers/users/userPassword.controller');
const authMiddleware = require('../middleware/auth.middleware');



//authController
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);
router.post('/verify-account', authController.verifyAccount);
router.post('/auth/google', authController.googleSignIn);
router.post('/forgotPassword', userPasswordController.forgotPassword);
router.post('/resetPassword/:token', userPasswordController.resetPassword);

module.exports = router;

//router.post('/change-password/:id', authMiddleware.requireAuth, authController.changePassword);


//userController get
router.get('/', userController.getAllUsers);
router.get('/friends/:id', userController.getFriends);
router.get('/:id', userController.userInfo);

//userController post

router.post('/addFavPost', userController.addFavoritePost);
router.post('/removeFavPost', userController.removeFavoritePost);
router.post('/savedPost', userController.savedPost);
router.post('/add-education', userController.addEducation);
router.post('/add-experience', userController.addExperience);

//userController patch
router.patch("/updateProfile/:id", userController.updateProfile);
router.patch('/follow/:id', userController.follow);
router.patch('/unfollow/:id', userController.unfollow);
router.patch("/:id", userController.updateBio);

//userController put
router.put("/:id", userController.updatePseudo);
router.put('/user-modify/:id', userController.updateUser);


//userController delete
router.delete('/:id', userController.deleteUser);



//router.post('/remSavedPost', userController.removeSavedPost);




module.exports = router;