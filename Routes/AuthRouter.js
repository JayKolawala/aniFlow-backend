// const { signup, login } = require('../Controllers/AuthController');
// const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');

// const router = require('express').Router();

// router.post('/login', loginValidation, login);
// router.post('/signup', signupValidation, signup);

// module.exports = router;

const express = require('express');
const router = express.Router();
const AuthController = require('../Controllers/AuthController');
const AuthValidation = require('../Middlewares/AuthValidation');
const verifyToken = require('../Middlewares/verifyToken'); // You'll need to create this

router.post('/signup', AuthValidation.signupValidation, AuthController.signup);
router.post('/login', AuthValidation.loginValidation, AuthController.login);
router.put('/update-profile', verifyToken, AuthController.updateProfile);

module.exports = router;