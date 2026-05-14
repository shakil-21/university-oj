const Problem = require('../../common/models/Problem');
const Contest = require('../../common/models/Contest');

// GET all problems
exports.getProblems = async (req, res) => {
    try {
        const activeContests = await Contest.find({ endTime: { $gte: new Date() } }).select('_id');
        const activeContestIds = activeContests.map(c => c._id);
        
        const problems = await Problem.find({ contestId: { $nin: activeContestIds } }).select('-testCases'); 
        res.json(problems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET single problem
exports.getProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).populate('contestId');
        if (!problem) return res.status(404).json({ error: 'Problem not found' });

        if (problem.contestId && new Date(problem.contestId.startTime) > new Date()) {
            return res.status(403).json({ error: 'This problem is locked until the contest starts.' });
        }

        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST new problem (for seeding)
exports.createProblem = async (req, res) => {
    try {
        const problem = new Problem(req.body);
        await problem.save();
        
        if (req.body.contestId) {
            await Contest.findByIdAndUpdate(req.body.contestId, { $push: { problems: problem._id } });
        }
        res.status(201).json(problem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
