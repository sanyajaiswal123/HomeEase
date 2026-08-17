const express = require('express');
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo, optionalProtect } = require('../middlewares/auth');

const router = express.Router();

// Public / Optional Protect routes
router.get('/', optionalProtect, serviceController.getAllServices);
router.get('/:id', optionalProtect, serviceController.getService);

// Provider Service Management routes
router.get('/my', protect, restrictTo('provider'), serviceController.getMyServices);
router.post('/provider-services', protect, restrictTo('provider'), serviceController.createProviderService);
router.put('/provider-services/:id', protect, restrictTo('provider'), serviceController.updateProviderService);
router.patch('/provider-services/:id/toggle', protect, restrictTo('provider'), serviceController.toggleProviderServiceStatus);
router.delete('/provider-services/:id', protect, restrictTo('provider'), serviceController.deleteProviderService);

// Admin-only routes for Category management
router.post('/', protect, restrictTo('admin'), serviceController.createService);
router.put('/:id', protect, restrictTo('admin'), serviceController.updateService);
router.patch('/:id/toggle', protect, restrictTo('admin'), serviceController.toggleServiceStatus);
router.delete('/:id', protect, restrictTo('admin'), serviceController.deleteService);

// Admin-only routes for Sub-Services management
router.post('/:id/subservices', protect, restrictTo('admin'), serviceController.addSubService);
router.put('/:id/subservices/:subId', protect, restrictTo('admin'), serviceController.updateSubService);
router.patch('/:id/subservices/:subId/toggle', protect, restrictTo('admin'), serviceController.toggleSubServiceStatus);
router.delete('/:id/subservices/:subId', protect, restrictTo('admin'), serviceController.deleteSubService);

module.exports = router;
