const express = require('express');
const complaintController = require('../controllers/complaintController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/', complaintController.createComplaint);
router.get('/my', complaintController.getMyComplaints);

module.exports = router;
