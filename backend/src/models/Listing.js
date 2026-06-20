const mongoose = require('mongoose');

// ─── REVIEW SCHEMA ───
const reviewSchema = new mongoose.Schema({
  // Relink user to their actual account instead of hardcoded strings
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  userAvatar: { type: String },
  tribe: { type: String }, // e.g., 'JDM', 'Euro'
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ─── LISTING SCHEMA ───
const listingSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  miles: { type: String, required: true }, // Tip: If you want to filter/sort by miles, change this to Number
  location: { type: String, required: true },
  zipCode: { type: String },
  
  // Technical categorization
  tag: { type: String, enum: ['JDM', 'EURO', 'MUSCLE', '4X4', 'CLASSIC', 'OTHER'], default: 'OTHER' },
  titleStatus: { type: String, default: 'Clean' }, 
  
  images: [{ type: String }], 
  youtubeUrl: { type: String },
  description: { type: String },
  highlights: [{ type: String }], 
  
  specs: {
    engine: String,
    transmission: String, 
    drivetrain: String,
    vin: String,
    fuelType: String,
    exteriorColor: String,
    interiorColor: String
  },

  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },

  // Refactored to point directly to the User collection for perfect aggregation and populate execution
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: { 
    type: String, 
    enum: ['pending', 'active', 'sold', 'archived'], 
    default: 'pending' 
  }
}, { 
  timestamps: true // Automatically handles clean createdAt and updatedAt variations for tables
});

// ─── AUTOMATED AGGREGATIONS ───
// Fixed hook logic ensuring calculations complete gracefully before writes
listingSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((acc, item) => item.rating + acc, 0);
    this.averageRating = parseFloat((total / this.reviews.length).toFixed(1));
  } else {
    this.averageRating = 0;
  }
  next();
});

module.exports = mongoose.model('Listing', listingSchema);