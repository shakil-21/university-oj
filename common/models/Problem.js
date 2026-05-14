const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true }
});

const problemSchema = new mongoose.Schema({
    customId: { type: String, required: true, unique: true }, // e.g., "1001", "A"
    title: { type: String, required: true },
    description: { type: String, required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    inputFormat: String,
    outputFormat: String,
    constraints: {
        timeLimit: { type: Number, default: 1000 }, // ms
        memoryLimit: { type: Number, default: 256 } // MB
    },
    tags: [String],
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    hint: String,
    source: String,
    testCases: [testCaseSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);
