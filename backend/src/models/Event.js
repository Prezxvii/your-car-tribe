const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['Meetup', 'Track Day', 'Show', 'Cruise'], default: 'Meetup' },
  date: {
    day: { type: String, required: true }, // e.g., "22"
    month: { type: String, required: true }, // e.g., "OCT"
    fullDate: { type: Date, required: true }
  },
  location: { type: String, required: true },
  distance: { type: String }, // Calculated on frontend or stored
  image: { type: String, default: 'https://via.placeholder.com/800x600' },
  
  // RSVP System
  attendeesCount: { type: Number, default: 0 },
  attendeesList: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);