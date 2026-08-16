const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// All routes here are restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/customers', adminController.getAllCustomers);
router.get('/providers', adminController.getAllProviders);

// User action routes
router.patch('/users/:id/block', adminController.toggleBlockUser);
router.delete('/users/:id', adminController.softDeleteUser);

// Verification routes
router.get('/verifications', adminController.getPendingVerifications);
router.put('/verifications/:id/approve', adminController.approveProvider);
router.put('/verifications/:id/reject', adminController.rejectProvider);

// Booking routes
router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/cancel', adminController.cancelBookingAdmin);
router.patch('/bookings/:id/assign', adminController.assignProvider);

// Complaint routes
router.get('/complaints', adminController.getAllComplaints);
router.patch('/complaints/:id/assign', adminController.assignComplaint);
router.patch('/complaints/:id/status', adminController.updateComplaintStatus);

// Review routes
router.get('/reviews', adminController.getAllReviews);
router.patch('/reviews/:id/hide', adminController.toggleHideReview);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;
