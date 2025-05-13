const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// @route   POST /api/ai/explain
// @desc    Get AI explanation for selected text
router.post('/explain', protect, aiController.getExplanation);

module.exports = router;