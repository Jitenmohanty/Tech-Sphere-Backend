const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userProfileController = require('../controllers/userProfileController');
const upload = require('../utils/multer');

// Public routes
router.get('/:userId', userProfileController.getUserProfile);
router.get('/:userId/blogs', userProfileController.getUserBlogs);

// Protected routes
router.get('/profile/me', protect, userProfileController.getCurrentUserProfile);
router.put(
  '/profile', 
  protect, 
  upload.single('profilePicture'), 
  userProfileController.updateUserProfile
);

module.exports = router;