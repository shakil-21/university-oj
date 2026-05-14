const Contest = require('../../common/models/Contest');
const Submission = require('../../common/models/Submission');
const User = require('../../common/models/User');
const { calculateDVWRS } = require('./ratingService');

exports.processContestRatings = async (contestId) => {
    const contest = await Contest.findById(contestId);
    if (!contest) throw new Error('Contest not found');

    if (contest.ratingsProcessed) {
        return { message: 'Ratings already processed for this contest' };
    }

    const submissions = await Submission.find({ contestId: contestId, status: 'AC' }).populate('userId');

    const userScoreMap = {};
    submissions.forEach(sub => {
        const userId = sub.userId._id.toString();
        if (!userScoreMap[userId]) {
            userScoreMap[userId] = { user: sub.userId, solved: new Set() };
        }
        userScoreMap[userId].solved.add(sub.problemId.toString());
    });

    const rankedUsers = Object.values(userScoreMap).map(entry => ({
        user: entry.user,
        solvedCount: entry.solved.size
    })).sort((a, b) => b.solvedCount - a.solvedCount);

    const totalParticipants = rankedUsers.length;
    if (totalParticipants === 0) {
        contest.ratingsProcessed = true;
        await contest.save();
        return { message: 'No participants to rate' };
    }

    const avgRating = rankedUsers.reduce((sum, entry) => sum + entry.user.currentRating, 0) / totalParticipants;

    const updates = rankedUsers.map((entry, index) => {
        const user = entry.user;
        const rank = index + 1;

        const userStats = {
            currentRating: user.currentRating,
            volatility: user.volatilityHistory.length > 0 ? user.volatilityHistory[user.volatilityHistory.length - 1] : 1,
            contestCount: user.contestCount,
            recentPracticeSolves: 0
        };

        const contestData = { averageRating: avgRating, actualRank: rank, totalParticipants };

        const newRating = calculateDVWRS(userStats, contestData);
        const delta = newRating - user.currentRating;
        const newVolatility = Math.max(1, Math.abs(delta) / 10);

        return User.findByIdAndUpdate(user._id, {
            currentRating: newRating,
            $inc: { contestCount: 1 },
            $push: { volatilityHistory: newVolatility }
        });
    });

    await Promise.all(updates);

    contest.ratingsProcessed = true;
    await contest.save();

    return { message: 'Ratings updated successfully', participantsProcessed: totalParticipants };
};
