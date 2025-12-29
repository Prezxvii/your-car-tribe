const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// --- 1. SIGNUP ---
router.post('/signup', async (req, res) => {
  try {
    console.log("--- Signup Attempt Received ---");
    console.log("Data:", req.body);
    
    const newUser = await User.create(req.body);
    console.log("✅ SUCCESS: User created in MongoDB");
    
    return res.status(201).json({ 
      message: "Welcome to the Tribe!",
      userId: newUser._id 
    });
  } catch (err) {
    console.error("❌ SIGNUP ERROR:", err.message);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: "Username or Email already exists." 
      });
    }
    return res.status(400).json({ error: err.message });
  }
});

// --- 2. LOGIN (FIXED) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Ensure user exists and password matches
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token lasts 7 days
    );
    
    console.log('✅ Login successful for:', user.username);
    
    // FIXED: Return complete user data including ID
    return res.json({ 
      token,
      id: user._id,           // CRITICAL: Include user ID
      username: user.username,
      role: user.role,
      tribes: user.tribes,
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
    // req.user.id is provided by the 'protect' middleware after decoding the JWT
    const user = await User.findById(req.user.id).select('-password'); 
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error fetching profile" });
  }
});

module.exports = router;