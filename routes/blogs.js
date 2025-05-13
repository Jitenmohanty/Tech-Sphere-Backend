const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../utils/multer'); // Extracted multer config
const blogController = require('../controllers/blogController');

// Public routes
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlogById);
router.get('/user/:userId', blogController.getBlogsByUser);

// Protected routes
router.post('/', protect, upload.single('featuredImage'), blogController.createBlog);
router.put('/:id', protect, upload.single('featuredImage'), blogController.updateBlog);
router.delete('/:id', protect, blogController.deleteBlog);
router.put('/:id/like', protect, blogController.toggleLikeBlog);

module.exports = router;
