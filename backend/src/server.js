const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Added axios for the news request
require('dotenv').config();
const connectDB = require('./config/db');

// 2. Import Routes
const marketRoutes = require('./routes/marketRoutes');
const authRoutes = require('./routes/authRoutes');   
const adminRoutes = require('./routes/adminRoutes'); 
const forumRoutes = require('./routes/forumRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 3. Connect to Database
connectDB();

// 4. Middleware
app.use(cors());
app.use(express.json());

// 5. API Routes
app.use('/api/market', marketRoutes);
app.use('/api/auth', authRoutes);   
app.use('/api/admin', adminRoutes); 
app.use('/api/forum', forumRoutes);

// --- NEW: SECURE NEWS PROXY ROUTE ---
app.get('/api/news/car-news', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY; // Pulled safely from .env
    
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=NYC+AND+car+AND+automotive&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
    );
    
    // Send only the articles back to the frontend
    res.json(response.data.articles || []);
  } catch (error) {
    console.error("News Proxy Error:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Health Check
app.get('/', (req, res) => res.send('🚀 Tribe Market API is running...'));

app.listen(PORT, () => {
  console.log(`🚀 Tribe Market Server running on port ${PORT}`);
});