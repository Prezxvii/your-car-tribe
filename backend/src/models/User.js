const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Fields from onboarding screens
  fullName: { type: String },           // "Name to a Face" screen
  bio: { type: String },                // "Short Bio" field
  profilePhoto: { type: String },       // "Upload Photo" field
  currentCar: { type: String },         // "Current Car / Project" screen
  mechanicalExperience: { type: String }, // "Mechanical Experience" screen
  tribes: [{ type: String }],           // "The Tribes" selection array
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Admin moderation fields
  banned: { type: Boolean, default: false },
  banReason: { type: String },
  bannedAt: { type: Date },
  strikes: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now }
});

// 1. Password hashing before saving 
// FIXED: Remove next() parameter and call - async functions don't need it
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 2. Added Helper Method: Compare password for Login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);