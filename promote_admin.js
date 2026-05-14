const mongoose = require('mongoose');
const User = require('./common/models/User');
const dotenv = require('dotenv');

dotenv.config();

const username = process.argv[2];

if (!username) {
    console.log('Usage: node promote_admin.js <username>');
    process.exit(1);
}

const promoteUser = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/university_oj');
        console.log('Connected to MongoDB');

        const user = await User.findOne({ username });

        if (!user) {
            console.log(`User '${username}' not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`SUCCESS: User '${username}' is now an Admin!`);
        console.log('You can now see the "+ Problem" and "+ Contest" buttons in the navbar.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

promoteUser();
