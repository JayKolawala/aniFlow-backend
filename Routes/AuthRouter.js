const express = require('express');
const router = express.Router();
const AuthController = require('../Controllers/AuthController');
const AuthValidation = require('../Middlewares/AuthValidation');
const verifyToken = require('../Middlewares/verifyToken'); // You'll need to create this

router.post('/signup', AuthValidation.signupValidation, AuthController.signup);
router.post('/login', AuthValidation.loginValidation, AuthController.login);
router.put('/update-profile', verifyToken, AuthController.updateProfile);

module.exports = router;