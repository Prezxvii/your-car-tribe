const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  finalPrice: {
    type: Number,
    required: true
  },
  proofUrl: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['approved', 'pending_review', 'rejected'],
    default: 'approved' // Automatically marks as approved when forced by an admin
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);