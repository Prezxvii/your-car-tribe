// backend/src/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Discussion', 'Post Question', 'Build Log', 'Tech Help'],
    default: 'Discussion'
  },
  tribe: { 
    type: String, 
    enum: ['Euro', 'JDM', 'Muscle', 'Classic', 'All'],
    default: 'All'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  voteCount: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamps
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema);
