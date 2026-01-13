const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- FIELDS FROM ONBOARDING & LICENSE ---
  fullName: { type: String },           // "Name to a Face" screen
  personalName: { type: String, default: 'Verified Member' }, // Displayed on License
  bio: { type: String },                // "Short Bio" field
  profilePhoto: { type: String },       // Stores Base64 or URL (License Avatar)
  currentCar: { type: String },         // "Current Car / Project" screen
  mechanicalExperience: { type: String }, // "Mechanical Experience" screen
  
  // --- DYNAMIC ARRAYS FOR LICENSE & PREFERENCES ---
  tribes: [{ type: String }],           // Holds Vehicle Kinds & Event Interests
  knowWhats: { 
    type: [String], 
    default: ["Active Contributor", "Tribe Member"] // Editable expertise
  },

  // --- ACCESS & MODERATION ---
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  banned: { type: Boolean, default: false },
  banReason: { type: String },
  bannedAt: { type: Date },
  strikes: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now }
});

// 1. Password hashing before saving 
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 2. Helper Method: Compare password for Login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);