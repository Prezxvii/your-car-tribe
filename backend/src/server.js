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

// --- PRODUCTION-READY CORS CONFIG ---
const allowedOrigins = [
  'https://your-car-tribe-mai9.vercel.app', 
  'https://your-car-tribe.vercel.app',      
  'http://localhost:3000',                   
  'http://localhost:3001'                    
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

// Apply CORS to all standard routes
app.use(cors(corsOptions));

// --- FIXED FOR EXPRESS 5 ---
// Using a Regular Expression for the catch-all OPTIONS handler 
// This avoids the "Missing parameter name" PathError
app.options(/^(.*)$/, cors(corsOptions));

app.use(express.json());

// Enhanced Request Logging
app.use((req, res, next) => {
  const origin = req.get('origin') || 'No Origin';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/market', marketRoutes);
app.use('/api/auth', authRoutes);   
app.use('/api/admin', adminRoutes); 
app.use('/api/forum', forumRoutes);

// News Proxy
app.get('/api/news/car-news', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) throw new Error('News API Key missing');
    
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=car+AND+automotive&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
    );
    res.json(response.data.articles || []);
  } catch (error) {
    console.error('News API error:', error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Tribe Market API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      market: '/api/market',
      auth: '/api/auth',
      admin: '/api/admin',
      forum: '/api/forum',
      news: '/api/news/car-news'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Tribe Market Server running on port ${PORT}`);
  console.log(`📡 CORS allowed for: ${allowedOrigins.join(', ')}`);
});