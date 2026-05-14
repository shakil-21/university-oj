// প্রজেক্টে প্রয়োজনীয় মডেল এবং প্যাকেজ যুক্ত করা হচ্ছে
const User = require('../../common/models/User'); // ডেটাবেসের ইউজার মডেল
const Submission = require('../../common/models/Submission'); // ডেটাবেসের সাবমিশন মডেল
const jwt = require('jsonwebtoken'); // ইউজার লগইন করলে একটি সিক্রেট টোকেন দেওয়ার জন্য

// টোকেন তৈরি করার ফাংশন (এই টোকেন দিয়ে ইউজার পরবর্তীতে লগইন করা আছে কিনা চেক করা হয়)
const generateToken = (id) => {
    // ইউজারের আইডি এবং একটি গোপন কোড (JWT_SECRET) দিয়ে টোকেন বানানো হচ্ছে। এটি ৩০ দিন মেয়াদ থাকবে।
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    নতুন ইউজার রেজিস্ট্রেশন করার ফাংশন
// @route   POST /api/auth/register
// @access  Public (যে কেউ অ্যাক্সেস করতে পারবে)
exports.registerUser = async (req, res) => {
    try {
        // ক্লায়েন্ট (ব্রাউজার) থেকে ইউজারনেম, ইমেইল এবং পাসওয়ার্ড নেওয়া হচ্ছে
        const { username, email, password } = req.body;
        console.log("Register Request:", { username, email, password });

        // ডেটাবেসে চেক করা হচ্ছে যে এই ইমেইল বা ইউজারনেম দিয়ে আগে কেউ অ্যাকাউন্ট খুলেছে কিনা
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            // যদি অ্যাকাউন্ট থাকে, তবে একটি এরর (error) পাঠানো হবে
            return res.status(400).json({ error: 'User already exists' });
        }

        // নতুন ইউজার তৈরি করে ডেটাবেসে সেভ করা হচ্ছে
        const user = await User.create({ username, email, password });

        if (user) {
            // ইউজার সফলভাবে তৈরি হলে তার তথ্য এবং একটি টোকেন ক্লায়েন্টকে পাঠিয়ে দেওয়া হবে
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            // যদি কোনো কারণে ইউজার তৈরি না হয়
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        // কোডে কোনো সমস্যা হলে সার্ভার ক্র্যাশ না করে এই অংশে এরর দেখাবে
        console.error("Register Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    ইউজার লগইন করার ফাংশন
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; // ইমেইল আর পাসওয়ার্ড নেওয়া হচ্ছে
        
        // ডেটাবেস থেকে ইমেইল দিয়ে ইউজার খোঁজা হচ্ছে
        const user = await User.findOne({ email });

        // যদি ইউজার পাওয়া যায় এবং পাসওয়ার্ড মিলে যায় (matchPassword ফাংশন User মডেলে আছে)
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id), // লগইনের টোকেন দেওয়া হচ্ছে
            });
        } else {
            // ইমেইল বা পাসওয়ার্ড ভুল হলে
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    লগইন করা ইউজারের নিজের তথ্য দেখার ফাংশন
// @route   GET /api/auth/me
// @access  Private (শুধু লগইন করা ইউজার দেখতে পারবে)
exports.getMe = async (req, res) => {
    // Middleware থেকে ইউজারের আইডি নিয়ে ডেটাবেস থেকে ইউজারের সব তথ্য আনা হচ্ছে, শুধু পাসওয়ার্ড বাদে
    const user = await User.findById(req.user.id).select('-password');
    res.json(user); // তথ্যগুলো ব্রাউজারে পাঠিয়ে দেওয়া হচ্ছে
};

// @desc    যেকোনো ইউজারের প্রোফাইল এবং পরিসংখ্যান দেখার ফাংশন
// @route   GET /api/auth/profile/:username
// @access  Public
exports.getUserProfile = async (req, res) => {
    try {
        // ইউজারনেম দিয়ে ডেটাবেস থেকে ইউজার খোঁজা হচ্ছে
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' }); // ইউজার না পেলে এরর দিবে

        // এই ইউজার যতগুলো কোড সাবমিট করেছে তা বের করা হচ্ছে (নতুন থেকে পুরনো ক্রমে)
        const submissions = await Submission.find({ userId: user._id }).sort({ submittedAt: -1 });

        // কয়টি আলাদা আলাদা প্রবলেম সফলভাবে সলভ (AC - Accepted) করেছে তার হিসাব বের করা হচ্ছে
        const solvedCount = new Set(
            submissions.filter(s => s.status === 'AC').map(s => s.problemId.toString())
        ).size;

        const totalSubmissions = submissions.length; // মোট সাবমিশন সংখ্যা

        // ইউজারের তথ্য, পরিসংখ্যান এবং সর্বশেষ ১০টি সাবমিশন ব্রাউজারে পাঠানো হচ্ছে
        res.json({
            ...user.toObject(),
            solvedCount,
            totalSubmissions,
            recentSubmissions: submissions.slice(0, 10) // Last 10 submissions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    লগইন করা ইউজার কোন কোন প্রবলেম সলভ করেছে তার তালিকা পাওয়ার ফাংশন
// @route   GET /api/auth/solved
// @access  Private
exports.getSolvedProblems = async (req, res) => {
    try {
        // ডেটাবেস থেকে ইউজারের শুধু সফল (AC) সাবমিশনগুলোর প্রবলেম আইডিগুলো আনা হচ্ছে
        const solved = await Submission.find({
            userId: req.user.id,
            status: 'AC'
        }).distinct('problemId');

        res.json(solved); // ব্রাউজারে পাঠানো হচ্ছে
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
