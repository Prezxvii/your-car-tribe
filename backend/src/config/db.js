const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect using the URI from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Database');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;