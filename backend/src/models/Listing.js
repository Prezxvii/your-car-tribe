const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  username: { type: String, required: true },
  userAvatar: { type: String },
  tribe: { type: String }, // e.g., 'JDM', 'Euro'
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const listingSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  miles: { type: String, required: true },
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

  seller: {
    name: String,
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    avatar: String,
    verified: { type: Boolean, default: false }
  },

  status: { 
    type: String, 
    enum: ['pending', 'active', 'sold', 'archived'], 
    default: 'pending' 
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate average rating
listingSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((acc, item) => item.rating + acc, 0);
    this.averageRating = (total / this.reviews.length).toFixed(1);
  }
  next();
});

module.exports = mongoose.model('Listing', listingSchema);