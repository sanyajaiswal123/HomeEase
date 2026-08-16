const express = require('express');
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', serviceController.getAllServices);

// Admin-only routes
router.post('/', protect, restrictTo('admin'), serviceController.createService);
router.put('/:id', protect, restrictTo('admin'), serviceController.updateService);
router.delete('/:id', protect, restrictTo('admin'), serviceController.deleteService);

module.exports = router;
