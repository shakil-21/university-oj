// ওয়েবসাইটের এক পেজ থেকে অন্য পেজে যাওয়ার জন্য React Router এর প্যাকেজগুলো
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ইউজারের লগইন সম্পর্কিত তথ্য পুরো প্রজেক্টে শেয়ার করার জন্য AuthProvider
import { AuthProvider } from './context/AuthContext';

// ওয়েবসাইটের বিভিন্ন পেজ (Components) ইমপোর্ট করা হচ্ছে
import Home from './pages/Home'; // মূল পেজ
import Problem from './pages/Problem'; // প্রবলেম সলভ করার পেজ
import Login from './pages/Login'; // লগইন পেজ
import Register from './pages/Register'; // রেজিস্ট্রেশন পেজ
import Profile from './pages/Profile'; // ইউজারের প্রোফাইল পেজ
import './index.css'; // ওয়েবসাইটের ডিজাইন বা স্টাইল শিট

import CreateProblem from './pages/CreateProblem'; // নতুন প্রবলেম তৈরি করার পেজ
import CreateContest from './pages/CreateContest'; // নতুন কনটেস্ট তৈরি করার পেজ

import Contests from './pages/Contests'; // কনটেস্টের লিস্ট দেখানোর পেজ
import Contest from './pages/Contest'; // নির্দিষ্ট একটি কনটেস্টের পেজ
import Leaderboard from './pages/Leaderboard'; // র‍্যাঙ্কিং বা লিডারবোর্ড দেখার পেজ

function App() {
  return (
    // AuthProvider দিয়ে পুরো ওয়েবসাইটকে ঘিরে দেওয়া হয়েছে, যাতে যে কোনো পেজ থেকে ইউজারের তথ্য (লগইন করা আছে কিনা) জানা যায়
    <AuthProvider>
      {/* Router এর মাধ্যমে পেজ পরিবর্তন (Navigation) কন্ট্রোল করা হয় */}
      <Router>
        <Routes>
          {/* এখানে বলা হচ্ছে কোন লিংকে (path) গেলে কোন পেজ (element) দেখাবে */}
          <Route path="/" element={<Home />} /> {/* হোম পেজ */}
          <Route path="/problem/:id" element={<Problem />} /> {/* নির্দিষ্ট প্রবলেমের পেজ (যেমন: /problem/123) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:username" element={<Profile />} /> {/* নির্দিষ্ট ইউজারের প্রোফাইল */}
          <Route path="/create-problem" element={<CreateProblem />} />
          <Route path="/create-contest" element={<CreateContest />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/contest/:id" element={<Contest />} />
          <Route path="/contest/:id/leaderboard" element={<Leaderboard />} /> {/* লিডারবোর্ড */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// App কম্পোনেন্টটিকে এক্সপোর্ট করা হচ্ছে যাতে main.jsx এটি ব্রাউজারে দেখাতে পারে
export default App;
