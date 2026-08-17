const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // Secure all booking routes

router.post('/', bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/provider-stats', bookingController.getProviderDashboardStats);

// Availability & Calendar Routes
router.get('/availability/slots', bookingController.getAvailableTimeSlots);
router.get('/availability/me', bookingController.getMyAvailabilitySettings);
router.put('/availability/me', bookingController.updateMyAvailabilitySettings);

// Provider Customer Management Routes
router.get('/provider-customers', bookingController.getProviderCustomers);
router.get('/provider-customers/:customerId', bookingController.getProviderCustomerDetails);

// Provider Financial & Earnings Routes
router.get('/provider-earnings', bookingController.getProviderEarnings);
router.get('/provider-transactions/:bookingId', bookingController.getProviderTransactionDetails);

// Provider Payout Management Routes
router.get('/provider-payouts', bookingController.getProviderPayouts);
router.post('/provider-payouts/request', bookingController.requestProviderPayout);
router.put('/provider-payouts/account', bookingController.updateProviderPayoutAccount);
router.get('/provider-payouts/:id', bookingController.getProviderPayoutDetails);

// Provider Analytics & Reports Route
router.get('/provider-analytics', bookingController.getProviderAnalytics);

router.get('/:id', bookingController.getBookingDetails);
router.put('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
