const mongoose = require('mongoose'); // ডেটাবেস (MongoDB) এর সাথে কাজ করার জন্য Mongoose ব্যবহার করা হয়
const bcrypt = require('bcryptjs'); // পাসওয়ার্ড এনক্রিপ্ট বা গোপন (Hash) করার জন্য

// ইউজারের ডেটাবেস স্ট্রাকচার বা মডেল (Schema) তৈরি করা হচ্ছে
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // ইউজারের নাম (অবশ্যই দিতে হবে এবং সবার আলাদা হতে হবে)
  email: { type: String, required: true, unique: true }, // ইউজারের ইমেইল
  password: { type: String, required: true }, // ইউজারের গোপন পাসওয়ার্ড
  role: { type: String, enum: ['student', 'admin'], default: 'student' }, // ইউজারের ধরণ (student অথবা admin)
  createdAt: { type: Date, default: Date.now }, // কখন অ্যাকাউন্ট খোলা হয়েছে তার সময়
  currentRating: { type: Number, default: 0 }, // ইউজারের বর্তমান রেটিং বা পয়েন্ট
  contestCount: { type: Number, default: 0 }, // ইউজার কয়টি কনটেস্টে অংশ নিয়েছে
  volatilityHistory: { type: [Number], default: [] }, // ইউজারের পারফরম্যান্স কতটা ওঠা-নামা করে তার রেকর্ড
  practiceSolvesLog: [{ // প্র্যাকটিসের জন্য সলভ করা প্রবলেমের লিস্ট
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }, // কোন প্রবলেম সলভ করেছে
    solvedAt: { type: Date, default: Date.now } // কখন সলভ করেছে
  }]
}, {
  toJSON: { virtuals: true }, // ডেটাকে JSON বানানোর সময় ভার্চুয়াল ফিল্ডগুলোও দেখানোর অনুমতি
  toObject: { virtuals: true }
});

// ইউজারের রেটিং অনুযায়ী টিয়ার বা র‍্যাংক (Gamified Rating Tiers)
const RATING_TIERS = [
  { min: 0, max: 999, name: 'Newbie', color: 'Gray' },
  { min: 1000, max: 1299, name: 'Bronze', color: 'Bronze' },
  { min: 1300, max: 1599, name: 'Silver', color: 'Silver' },
  { min: 1600, max: 1899, name: 'Gold', color: 'Yellow' },
  { min: 1900, max: 2199, name: 'Platinum', color: 'Cyan' },
  { min: 2200, max: 2499, name: 'Diamond', color: 'Purple' },
  { min: 2500, max: Infinity, name: 'Champion', color: 'Red' }
];

// ভার্চুয়াল ফিল্ড: ইউজারের বর্তমান রেটিং থেকে তার টিয়ার এবং কালার বের করা হবে
userSchema.virtual('tierDetails').get(function () {
  const rating = this.currentRating;
  // চেক করা হচ্ছে রেটিং কোন টিয়ারের মধ্যে পড়ে
  const tier = RATING_TIERS.find(t => rating >= t.min && rating <= t.max);
  return tier ? { name: tier.name, color: tier.color } : { name: 'Unranked', color: 'Black' };
});

// ডেটাবেসে সেভ করার আগে পাসওয়ার্ড এনক্রিপ্ট (Hash) করে নেওয়া হচ্ছে
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // যদি পাসওয়ার্ড পরিবর্তন না হয় তবে কিছু করবে না
  
  const salt = await bcrypt.genSalt(10); // পাসওয়ার্ডের সাথে কিছু এলোমেলো টেক্সট মেশানোর জন্য
  this.password = await bcrypt.hash(this.password, salt); // পাসওয়ার্ড গোপন (Hash) করা হলো
  next();
});

// লগইন করার সময় দেওয়া পাসওয়ার্ড এবং ডেটাবেসের গোপন পাসওয়ার্ড মেলানোর ফাংশন
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // দুইটা পাসওয়ার্ড মিলিয়ে দেখবে (true/false দিবে)
};

// এই মডেলটিকে এক্সপোর্ট করা হচ্ছে যাতে অন্য ফাইলগুলো এটি ব্যবহার করতে পারে
module.exports = mongoose.model('User', userSchema);
