const router = require('express').Router()
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const uploadController = require('../controllers/upload.controller');
const multer = require('multer');
const UserModel = require('../models/user.model');
const upload = multer();


//authController
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);


//userController
router.get('/', userController.getAllUsers);
router.get('/:id', userController.userInfo);
router.put("/:id", userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/follow/:id', userController.follow);
router.patch('/unfollow/:id', userController.unfollow);


// get friends 
router.get("/friends/:id", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id)
        const friends = await Promise.all(
            user.following.map((friendId) => {
                return UserModel.findById(friendId)
            })
        )
        let friendList = [];
        friends.map((friend) => {
            const { _id, pseudo, picture } = friend;
            friendList.push({ _id, pseudo, picture })
        })
        res.status(200).json(friendList)
    } catch (error) {
        res.status(500).json(error)
        console.log(error)

    }
})

// upload image routes
router.post("/upload", upload.single("file"), uploadController.uploadProfil);


module.exports = router;