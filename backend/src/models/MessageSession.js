const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // username or userId
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSessionSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyerUsername: { type: String, required: true },
  sellerUsername: { type: String, required: true },
  messages: [MessageSchema],
  isTransactionComplete: { type: Boolean, default: false },
  adminNotified: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure unique chat thread per buyer per car listing
ChatSessionSchema.index({ listingId: 1, buyerUsername: 1 }, { unique: true });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);