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
// UPDATED: Added your specific -mai9 Vercel URL and extra headers for stability
app.use(cors({
  origin: [
    'https://your-car-tribe-mai9.vercel.app', 
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 5. API Routes
app.use('/api/market', marketRoutes);
app.use('/api/auth', authRoutes);   
app.use('/api/admin', adminRoutes); 
app.use('/api/forum', forumRoutes);

// --- SECURE NEWS PROXY ROUTE ---
app.get('/api/news/car-news', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=car+AND+automotive&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
    );
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