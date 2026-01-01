const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const connectDB = require('./config/db');

// Import Routes
const marketRoutes = require('./routes/marketRoutes');
const authRoutes = require('./routes/authRoutes');   
const adminRoutes = require('./routes/adminRoutes'); 
const forumRoutes = require('./routes/forumRoutes');

const app = express();
const PORT = process.env.PORT || 10000; 

// Connect to Database
connectDB();

// --- SAFARI COMPLIANT CORS CONFIG ---
const allowedOrigins = [
  'https://your-car-tribe-mai9.vercel.app', // Your Vercel URL
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

// Handle Safari Preflight requests
app.options('*', cors());

app.use(express.json());

// API Routes
app.use('/api/market', marketRoutes);
app.use('/api/auth', authRoutes);   
app.use('/api/admin', adminRoutes); 
app.use('/api/forum', forumRoutes);

// News Proxy
app.get('/api/news/car-news', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=car+AND+automotive&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
    );
    res.json(response.data.articles || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.get('/', (req, res) => res.send('🚀 Tribe Market API is running...'));

app.listen(PORT, () => {
  console.log(`🚀 Tribe Market Server running on port ${PORT}`);
});