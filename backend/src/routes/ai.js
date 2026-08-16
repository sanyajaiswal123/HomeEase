const express = require('express');
const aiController = require('../controllers/aiController');
// const { protect } = require('../middlewares/auth');

const router = express.Router();

// Allow public access to AI Diagnostic for landing page usage
router.post('/diagnose', aiController.diagnoseIssue);

module.exports = router;
