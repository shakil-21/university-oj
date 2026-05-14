const Contest = require('../../common/models/Contest');
const { processContestRatings } = require('./contestFinalizer');

const startAutoFinalizer = () => {
    setInterval(async () => {
        try {
            const endedContests = await Contest.find({
                endTime: { $lt: new Date() },
                ratingsProcessed: false
            });

            for (const contest of endedContests) {
                console.log(`[Cron] Auto-finalizing contest: ${contest.title}`);
                await processContestRatings(contest._id);
                console.log(`[Cron] Successfully finalized contest: ${contest.title}`);
            }
        } catch (error) {
            console.error('[Cron] Error processing contest ratings:', error);
        }
    }, 60 * 1000); // Check every 60 seconds
    console.log('[Cron] Auto-finalize contest service started');
};

module.exports = startAutoFinalizer;
