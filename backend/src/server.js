const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const connectDB = require('./config/db');

// 2. Import Routes
const marketRoutes = require('./routes/marketRoutes');
const authRoutes = require('./routes/authRoutes');   
const adminRoutes = require('./routes/adminRoutes'); 
const forumRoutes = require('./routes/forumRoutes');

const app = express();

// Render uses the PORT environment variable automatically
const PORT = process.env.PORT || 10000; 

// 3. Connect to Database
connectDB();

// 4. Middleware
// Updated CORS to allow your specific Vercel domain and local development
app.use(cors({
  origin: [
    'https://your-car-tribe.vercel.app', // Update this with your actual Vercel URL
    'http://localhost:3000'              // Standard React local port
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// 5. API Routes
app.use('/api/market', marketRoutes);
app.use('/api/auth', authRoutes);   
app.use('/api/admin', adminRoutes); 
app.use('/api/forum', forumRoutes);

// --- SECURE NEWS PROXY ROUTE ---
// This protects your API key by keeping it on the server
app.get('/api/news/car-news', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    // We fetch from NewsAPI here so the frontend doesn't have to
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=car+AND+automotive&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
    );
    
    res.json(response.data.articles || []);
  } catch (error) {
    console.error("News Proxy Error:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Health Check (Used by Render to monitor if the app is alive)
app.get('/', (req, res) => res.send('🚀 Tribe Market API is running...'));

app.listen(PORT, () => {
  console.log(`🚀 Tribe Market Server running on port ${PORT}`);
});