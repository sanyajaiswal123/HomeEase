const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', protect, authController.getMe);
router.put('/update-me', protect, authController.updateMe);
router.put('/update-password', protect, authController.updatePassword);
router.post('/deactivate', protect, authController.deactivateAccount);
router.get('/verification/status', protect, authController.getVerificationStatus);
router.post('/verification/submit', protect, authController.submitProviderVerification);
router.get('/provider/location', protect, authController.getProviderLocation);
router.put('/provider/location', protect, authController.updateProviderLocation);
router.get('/providers', authController.getProviders);
router.put('/providers/:id/verify', protect, restrictTo('admin'), authController.verifyProvider);

module.exports = router;
