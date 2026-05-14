const express = require('express');
const router = express.Router(); // রাউটার তৈরি করা হচ্ছে, যা দিয়ে বিভিন্ন লিংকের ট্রাফিক কন্ট্রোল করা হবে

// কন্ট্রোলার (Controller) থেকে ফাংশনগুলো আনা হচ্ছে। এই ফাংশনগুলোই আসল কাজ করবে।
const { registerUser, loginUser, getMe, getUserProfile, getSolvedProblems } = require('../controllers/authController');

// মিডলওয়্যার (Middleware) আনা হচ্ছে। 'protect' ফাংশনটি চেক করবে ইউজার লগইন করা আছে কিনা।
const { protect } = require('../middleware/authMiddleware');

// রাউটগুলো (লিংক) সেট করা হচ্ছে:

// POST /api/auth/register লিংকে কেউ ডেটা পাঠালে registerUser ফাংশনটি চলবে
router.post('/register', registerUser);

// POST /api/auth/login লিংকে ডেটা পাঠালে loginUser ফাংশনটি চলবে
router.post('/login', loginUser);

// GET /api/auth/me লিংকে গেলে প্রথমে protect চেক করবে ইউজার লগইন করা কিনা, তারপর getMe ফাংশনটি ইউজারের তথ্য দিবে
router.get('/me', protect, getMe);

// GET /api/auth/solved লিংকে গেলে লগইন করা ইউজারের সলভ করা প্রবলেমের লিস্ট দিবে (protect দিয়ে সুরক্ষিত)
router.get('/solved', protect, getSolvedProblems);

// GET /api/auth/profile/:username লিংকে গেলে (যেমন: /profile/shakil) সেই ইউজারের পাবলিক প্রোফাইল দেখাবে
router.get('/profile/:username', getUserProfile);

// রাউটারটিকে এক্সপোর্ট করা হচ্ছে যাতে server.js এটি ব্যবহার করতে পারে
module.exports = router;
