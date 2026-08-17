const express = require('express');
const offerController = require('../controllers/offerController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/service/:serviceId', offerController.getActiveServiceOffers);
router.post('/validate', offerController.validateOfferCode);

// Protected Provider routes
router.get('/my', protect, offerController.getMyProviderOffers);
router.post('/', protect, offerController.createOffer);
router.put('/:id', protect, offerController.updateOffer);
router.delete('/:id', protect, offerController.deleteOffer);

module.exports = router;
