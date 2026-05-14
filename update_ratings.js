const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./common/db');
const User = require('./common/models/User');

const updateRatings = async () => {
    try {
        await connectDB();
        
        const sowvick = await User.findOneAndUpdate(
            { username: 'sowvick' },
            { $set: { currentRating: 2500 } },
            { new: true }
        );
        if (sowvick) console.log(`Updated sowvick rating to ${sowvick.currentRating}`);
        else console.log('User sowvick not found');

        const shakil = await User.findOneAndUpdate(
            { username: 'shakil' },
            { $set: { currentRating: 9999 } },
            { new: true }
        );
        if (shakil) console.log(`Updated shakil rating to ${shakil.currentRating}`);
        else console.log('User shakil not found');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateRatings();
