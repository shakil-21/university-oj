const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ratingsProcessed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Contest', contestSchema);
