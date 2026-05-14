const express = require('express');
const router = express.Router();
const { createContest, getContests, getContest, getLeaderboard, finalizeContest } = require('../controllers/contestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createContest);
router.get('/', getContests);
router.get('/:id', getContest);
router.get('/:id/leaderboard', getLeaderboard);
router.post('/:id/finalize', protect, finalizeContest); // Only authorized users can finalize

module.exports = router;
