const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }, // Optional, for contest submissions
    code: { type: String, required: true },
    language: { type: String, required: true, enum: ['c', 'cpp', 'python', 'java'] }, // Extended for future
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'AC', 'WA', 'TLE', 'MLE', 'CE', 'RE'],
        default: 'Pending'
    },
    output: String, // For errors or sample output
    executionTime: Number, // ms
    memoryUsed: Number, // KB
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
