const mongoose = require('mongoose');

const mechanicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  specialty: { 
    type: String, 
    required: true, 
    enum: ['German / Euro', 'JDM / Japanese', 'Domestic', 'Classic'] 
  },
  rating: { type: Number, default: 5.0 },
  reviews: { type: Number, default: 1 },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  about: { type: String, required: true },
  services: [{ type: String }],
  projects: [{ type: String }],
  verified: { type: Boolean, default: false },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Mechanic', mechanicSchema);