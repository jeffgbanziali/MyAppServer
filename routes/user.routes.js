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

router.get("/", async (req, res) => {
    const pseudo = req.query.pseudo;
    try {
        const user = await UserModel.findOne({ pseudo: pseudo });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });

        }
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
        console.log("Utilisateur non trouvé");
    } catch (err) {
        res.status(500).json({ message: "Une erreur interne s'est produite" });
        console.log("Utilisateur non trouvé");
    }
});



// get friends 
router.get("/friends/:id", userController.getFriends);


// upload image routes
router.post("/upload", upload.single("file"), uploadController.uploadProfil);


module.exports = router;