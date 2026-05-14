const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const connectDB = require('../common/db');
const Submission = require('../common/models/Submission');
const Problem = require('../common/models/Problem');
const { runCode } = require('./executor/dockerRunner');
const dotenv = require('dotenv');

dotenv.config();
connectDB();

const redisConfig = {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
};

const worker = new Worker('submissionQueue', async job => {
    console.log(`Processing Job ${job.id}`);
    const { submissionId, code, language, problemId } = job.data;

    const submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.status = 'Processing';
    await submission.save();

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) throw new Error('Problem not found');

        // Execute against all test cases
        let allPassed = true;
        let totalTime = 0;
        let maxMemory = 0;

        for (const testCase of problem.testCases) {
            const result = await runCode(code, language, testCase.input);

            // Check Execution/Compilation Error
            if (result.exitCode !== 0) {
                if (result.output.toLowerCase().includes('error:')) {
                    submission.status = 'CE'; // Compilation Error
                } else {
                    submission.status = 'RE'; // Runtime Error
                }
                submission.output = result.output;
                allPassed = false;
                break;
            }

            // Normalize line endings and trim
            const normalize = (str) => str.replace(/\r\n/g, '\n').trim();

            if (normalize(result.output) !== normalize(testCase.output)) {
                submission.status = 'WA'; // Wrong Answer
                submission.output = `Expected: ${testCase.output}, Got: ${result.output}`;
                allPassed = false;
                break;
            }

            // Check TLE (simplified)
            if (result.executionTime > problem.constraints.timeLimit) {
                submission.status = 'TLE';
                allPassed = false;
                break;
            }

            totalTime = Math.max(totalTime, result.executionTime);
        }

        if (allPassed) {
            submission.status = 'AC';
        }

        submission.executionTime = totalTime;
        await submission.save();

    } catch (err) {
        console.error(err);
        submission.status = 'RE'; // Runtime Error or System Error
        submission.output = err.message;
        await submission.save();
    }

}, redisConfig);

worker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} has failed with ${err.message}`);
});

console.log('Worker is running...');
