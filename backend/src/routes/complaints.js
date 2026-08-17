const express = require('express');
const complaintController = require('../controllers/complaintController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/my', complaintController.getMyComplaints);
router.post('/', complaintController.createComplaint);
router.get('/:id', complaintController.getComplaintDetails);
router.post('/:id/reply', complaintController.replyToComplaint);
router.put('/:id/reopen', complaintController.reopenComplaint);

module.exports = router;
