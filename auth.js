const express = require('express');
const router = express.Router();

// In-memory user store
const usersMap = new Map();

function getOrCreateUser(email, name) {
  const cleanEmail = (email || 'alex@thinkpoint.dev').toLowerCase().trim();
  if (usersMap.has(cleanEmail)) {
    const existing = usersMap.get(cleanEmail);
    if (name) existing.name = name;
    return existing;
  }
  const userName = name || (email ? email.split('@')[0] : 'Learner');
  const newUser = {
    id: `user-${cleanEmail.replace(/[^a-z0-9]/g, '') || Date.now()}`,
    name: userName,
    email: cleanEmail,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    dailyGoal: 3,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  };
  usersMap.set(cleanEmail, newUser);
  return newUser;
}

let activeUser = getOrCreateUser('alex@thinkpoint.dev', 'Alex Rivera');

function getCurrentUser() {
  return activeUser;
}

function setCurrentUser(user) {
  if (user && user.email) {
    activeUser = getOrCreateUser(user.email, user.name);
  }
}

// Login
router.post('/login', (req, res) => {
  try {
    const { email } = req.body || {};
    activeUser = getOrCreateUser(email, null);
    return res.json({ success: true, user: activeUser, token: "demo-jwt-token-12345" });
  } catch (err) {
    console.error("Login route error:", err);
    return res.json({ success: true, user: getCurrentUser(), token: "demo-jwt-token-12345" });
  }
});

// Signup
router.post('/signup', (req, res) => {
  try {
    const { name, email } = req.body || {};
    activeUser = getOrCreateUser(email, name);
    return res.json({ success: true, user: activeUser, token: "demo-jwt-token-12345" });
  } catch (err) {
    console.error("Signup route error:", err);
    return res.json({ success: true, user: getCurrentUser(), token: "demo-jwt-token-12345" });
  }
});

// Get User Profile
router.get('/profile', (req, res) => {
  try {
    return res.json({ user: getCurrentUser() });
  } catch (err) {
    console.error("Profile route error:", err);
    return res.json({ user: getCurrentUser() });
  }
});

// Update Daily Goal
router.put('/goal', (req, res) => {
  try {
    const { dailyGoal } = req.body || {};
    const user = getCurrentUser();
    if (dailyGoal && Number(dailyGoal) > 0) {
      user.dailyGoal = Number(dailyGoal);
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.error("Goal route error:", err);
    return res.json({ success: true, user: getCurrentUser() });
  }
});

module.exports = { router, getCurrentUser, setCurrentUser };
