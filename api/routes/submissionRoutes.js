const express = require('express');
const router = express.Router();
const { createSubmission, getSubmission } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSubmission);
router.get('/:id', getSubmission);

module.exports = router;
