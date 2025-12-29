const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    trim: true
  },
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String, // For anonymous questions
    trim: true
  },
  category: {
    type: String,
    enum: ['Account', 'Marketplace', 'Forum', 'Technical', 'Safety', 'General'],
    default: 'General'
  },
  answered: {
    type: Boolean,
    default: false
  },
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  answeredAt: {
    type: Date
  },
  published: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);