const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  miles: { type: String, required: true },
  location: { type: String, required: true },
  images: [{ type: String }], // Array of image URLs
  youtubeUrl: { type: String },
  description: { type: String },
  highlights: [{ type: String }], // Technical Highlights from Step 3
  specs: {
    engine: String,
    transmission: String,
    drivetrain: String,
    vin: String
  },
  seller: {
    name: String,
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  status: { type: String, enum: ['pending', 'active', 'sold'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);