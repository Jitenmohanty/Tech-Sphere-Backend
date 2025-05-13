const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const commentController = require('../controllers/commentController');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/comments
// @desc    Create a comment
router.post('/', [protect, [
  check('content', 'Content is required').not().isEmpty(),
  check('blog', 'Blog ID is required').not().isEmpty()
]], commentController.createComment);

// @route   GET /api/comments/blog/:blogId
// @desc    Get all comments for a blog
router.get('/blog/:blogId', commentController.getBlogComments);

// @route   PUT /api/comments/:id
// @desc    Update a comment
router.put('/:id', protect, commentController.updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
router.delete('/:id', protect, commentController.deleteComment);

// @route   GET /api/comments/user/:userId
// @desc    Get all comments by a user
router.get('/user/:userId', commentController.getUserComments);

module.exports = router;