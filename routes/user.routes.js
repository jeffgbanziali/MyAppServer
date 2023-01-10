const router = require('express').Router()
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');


//authController
router.post('/register', authController.signUp);


//userController
router.get('/', userController.getAllUsers);
router.get('/:id', userController.userInfo);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);


module.exports = router;