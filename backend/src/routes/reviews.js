const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/provider/:providerId', reviewController.getProviderReviews);

// Protected routes
router.post('/', protect, reviewController.createReview);
router.get('/my', protect, reviewController.getMyProviderReviews);
router.post('/:id/reply', protect, reviewController.replyToReview);

module.exports = router;
