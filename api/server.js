// প্রজেক্টে প্রয়োজনীয় প্যাকেজগুলো যুক্ত করা হচ্ছে
const express = require('express'); // Express হলো Node.js এর ফ্রেমওয়ার্ক যা দিয়ে সার্ভার তৈরি করা হয়
const cors = require('cors'); // CORS ব্যবহার করা হয় যাতে ফ্রন্টএন্ড (যেমন React) আমাদের ব্যাকএন্ড থেকে ডেটা আনতে পারে
const dotenv = require('dotenv'); // .env ফাইল থেকে গোপন তথ্য (যেমন পাসওয়ার্ড, পোর্ট) পড়ার জন্য
const connectDB = require('../common/db'); // আমাদের ডেটাবেস (MongoDB) কানেক্ট করার ফাংশন

// বিভিন্ন রাউট (Routes) বা লিংক এর ফাইলগুলো যুক্ত করা হচ্ছে
const submissionRoutes = require('./routes/submissionRoutes');
const problemRoutes = require('./routes/problemRoutes');
const authRoutes = require('./routes/authRoutes');
const contestRoutes = require('./routes/contestRoutes');
const startAutoFinalizer = require('./services/autoFinalizeCron');

// .env ফাইলের ভেরিয়েবলগুলো চালু করা হচ্ছে
dotenv.config();

// express অ্যাপ তৈরি করা হলো
const app = express();
// সার্ভার কোন পোর্টে চলবে তা ঠিক করা হচ্ছে। .env তে পোর্ট থাকলে সেটা নিবে, নাহলে 5000 এ চলবে।
const PORT = process.env.PORT || 5000;

// Middleware (মিডলওয়্যার) - ক্লায়েন্ট থেকে আসা রিকোয়েস্ট চেক করার জন্য
app.use(cors()); // অন্য ডোমেইন থেকে রিকোয়েস্ট এলাউ করা
app.use(express.json()); // রিকোয়েস্টের বডি থেকে JSON ডেটা পড়ার অনুমতি দেওয়া

// ডেটাবেস কানেকশন চালু করা
connectDB();

// ব্যাকগ্রাউন্ড সার্ভিস চালু করা (যেমন কনটেস্ট শেষ হলে স্বয়ংক্রিয় কাজ)
startAutoFinalizer();

// Routes (রাউটস) - কোন লিংকে গেলে কী হবে তা বলে দেওয়া হচ্ছে
app.get('/', (req, res) => res.send('University OJ API is running')); // মূল ওয়েবসাইটে গেলে এই টেক্সট দেখাবে

// বিভিন্ন কাজের জন্য আলাদা লিংক (API Endpoints) সেট করা হচ্ছে
app.use('/api/auth', authRoutes); // লগইন/রেজিস্ট্রেশনের জন্য
app.use('/api/submissions', submissionRoutes); // কোড সাবমিট করার জন্য
app.use('/api/problems', problemRoutes); // প্রবলেমগুলোর জন্য
app.use('/api/contests', contestRoutes); // কনটেস্টের জন্য

// Global Error Handler - সার্ভারে কোনো ভুল (error) হলে এই ফাংশনটা চলবে
app.use((err, req, res, next) => {
    console.error(err.stack); // টার্মিনালে ভুলটা দেখাবে
    res.status(500).json({ error: 'Server Error' }); // ইউজারকে মেসেজ দিবে যে সার্ভারে সমস্যা হয়েছে
});

// সার্ভার চালু করা হচ্ছে
app.listen(PORT, () => {
    console.log(`API Service running on port ${PORT}`); // সার্ভার চালু হলে টার্মিনালে এই লেখাটি দেখাবে
});
