const { Router } = require('express')
const router = Router()
const { signUp } = require('../controllers/auth.controller');

router.post('/register', signUp);


module.exports = router;