const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', protect, authController.getMe);
router.put('/update-me', protect, authController.updateMe);
router.get('/providers', authController.getProviders);
router.put('/providers/:id/verify', protect, restrictTo('admin'), authController.verifyProvider);

module.exports = router;
