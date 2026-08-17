const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// All routes here are strictly restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard & Stats
router.get('/stats', adminController.getDashboardStats);

// Customer Management
router.get('/customers', adminController.getAllCustomers);
router.get('/customers/:id', adminController.getCustomerProfile);

// Provider Management & Profile
router.get('/providers', adminController.getAllProviders);
router.get('/providers/:id', adminController.getProviderProfile);

// User Block / Delete Actions
router.patch('/users/:id/block', adminController.toggleBlockUser);
router.delete('/users/:id', adminController.softDeleteUser);

// Verification Routes (KYC)
router.get('/verifications', adminController.getPendingVerifications);
router.put('/verifications/:id/approve', adminController.approveProvider);
router.put('/verifications/:id/reject', adminController.rejectProvider);

// Booking Routes
router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/cancel', adminController.cancelBookingAdmin);
router.patch('/bookings/:id/assign', adminController.assignProvider);

// Complaint Routes
router.get('/complaints', adminController.getAllComplaints);
router.patch('/complaints/:id/assign', adminController.assignComplaint);
router.patch('/complaints/:id/status', adminController.updateComplaintStatus);

// Review Routes
router.get('/reviews', adminController.getAllReviews);
router.patch('/reviews/:id/hide', adminController.toggleHideReview);
router.delete('/reviews/:id', adminController.deleteReview);

// Payments & Refunds
router.get('/payments', adminController.getPayments);
router.post('/payments/:bookingId/refund', adminController.processRefund);

// Payout Management
router.get('/payouts', adminController.getAdminPayouts);
router.put('/payouts/:id/status', adminController.updateAdminPayoutStatus);

// Analytics & Reports
router.get('/analytics', adminController.getAnalyticsData);

// Admin Notifications System
router.get('/notifications', adminController.getAdminNotifications);
router.post('/notifications', adminController.sendAdminNotification);

// System Settings
router.get('/settings', adminController.getAdminSettings);
router.put('/settings', adminController.updateAdminSettings);

// Audit Trail Logs
router.get('/audit-logs', adminController.getAuditLogs);

// Admin Profile Update
router.put('/profile', adminController.updateAdminProfile);

module.exports = router;
