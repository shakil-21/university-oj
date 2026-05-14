const Submission = require('../../common/models/Submission');
const { Queue } = require('bullmq');
const redisConfig = {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
};

const submissionQueue = new Queue('submissionQueue', redisConfig);

exports.createSubmission = async (req, res) => {
    try {
        const { problemId, contestId, code, language } = req.body;
        const userId = req.user._id;

        if (!code || !language || !problemId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create Submission Record
        const submission = await Submission.create({
            userId,
            problemId,
            contestId: contestId || null,
            code,
            language,
            status: 'Pending'
        });

        // Push to Queue
        await submissionQueue.add('processSubmission', {
            submissionId: submission._id,
            code,
            language,
            problemId
        });

        res.status(201).json({
            message: 'Submission received',
            submissionId: submission._id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.json(submission);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
