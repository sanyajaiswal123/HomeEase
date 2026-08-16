const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // Secure all booking routes

router.post('/', bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingDetails);
router.put('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
