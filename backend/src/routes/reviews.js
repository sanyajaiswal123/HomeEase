const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/provider/:providerId', reviewController.getProviderReviews);

// Protected routes
router.post('/', protect, reviewController.createReview);

module.exports = router;
