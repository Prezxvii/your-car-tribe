const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// --- 1. SIGNUP ---
router.post('/signup', async (req, res) => {
  try {
    console.log("--- Signup Attempt Received ---");
    const newUser = await User.create(req.body);
    
    // ✅ Generate token immediately so they are logged in after signup
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("✅ SUCCESS: User created in MongoDB");
    
    // ✅ Return complete user data and token
    return res.status(201).json({ 
      message: "Welcome to the Tribe!",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        tribes: newUser.tribes
      }
    });
  } catch (err) {
    console.error("❌ SIGNUP ERROR:", err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Username or Email already exists." });
    }
    return res.status(400).json({ error: err.message });
  }
});

// --- 2. LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return complete user data
    return res.json({ 
      token,
      id: user._id,
      username: user.username,
      role: user.role,
      tribes: user.tribes,
      knowWhats: user.knowWhats,
      profilePhoto: user.profilePhoto,
      fullName: user.fullName
    });
    
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --- 3. GET USER PROFILE ---
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); 
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error fetching profile" });
  }
});

// --- 4. UPDATE PROFILE ---
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { tribes, avatar, knowWhats } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          tribes: tribes,
          profilePhoto: avatar,
          knowWhats: knowWhats 
        } 
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Profile Updated for: ${updatedUser.username}`);
    return res.json(updatedUser);
  } catch (err) {
    console.error('❌ Update Error:', err);
    return res.status(500).json({ message: "Server error updating profile" });
  }
});

module.exports = router;