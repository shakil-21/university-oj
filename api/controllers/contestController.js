const Contest = require('../../common/models/Contest');
const Submission = require('../../common/models/Submission');
const User = require('../../common/models/User');
const { calculateDVWRS } = require('../services/ratingService');

// @desc    Create a contest
// @route   POST /api/contests
// @access  Admin
exports.createContest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, problems } = req.body;
        const contest = await Contest.create({
            title,
            description,
            startTime,
            endTime,
            problems,
            createdBy: req.user.id
        });
        res.status(201).json(contest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
exports.getContests = async (req, res) => {
    try {
        const contests = await Contest.find().sort({ startTime: -1 });
        res.json(contests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get contest details
// @route   GET /api/contests/:id
// @access  Public
exports.getContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('problems', 'title customId');
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        
        if (new Date(contest.startTime) > new Date()) {
            contest.problems = []; // Hide problems before contest universally
        }
        res.json(contest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        // Find all submissions for this contest
        const submissions = await Submission.find({
            contestId: req.params.id,
            status: 'AC'
        }).populate('userId', 'username');

        // Aggregate scores
        const leaderboard = {};

        submissions.forEach(sub => {
            const userId = sub.userId._id.toString();
            const username = sub.userId.username;

            if (!leaderboard[userId]) {
                leaderboard[userId] = {
                    username,
                    solved: new Set(),
                    totalTime: 0 // Simplification: penalty logic omitted for now
                };
            }
            leaderboard[userId].solved.add(sub.problemId.toString());
        });

        // Convert to array and sort
        const result = Object.values(leaderboard).map(user => ({
            username: user.username,
            solvedCount: user.solved.size
        })).sort((a, b) => b.solvedCount - a.solvedCount);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const { processContestRatings } = require('../services/contestFinalizer');

// @desc    Finalize contest and update ratings
// @route   POST /api/contests/:id/finalize
// @access  Admin
exports.finalizeContest = async (req, res) => {
    try {
        const result = await processContestRatings(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(error.message === 'Contest not found' ? 404 : 500).json({ error: error.message });
    }
};
