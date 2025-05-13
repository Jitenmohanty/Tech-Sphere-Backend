const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], authController.register);

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], authController.login);

// @route   POST /api/auth/google
// @desc    Authenticate user with Google
router.post('/google', authController.googleAuth);

// @route   GET /api/auth/logout
// @desc    Logout user
router.get('/logout', authController.logout);

// @route   GET /api/auth/user
// @desc    Get current user
router.get('/user', authController.getUser);

module.exports = router;