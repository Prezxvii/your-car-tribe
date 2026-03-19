const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Import Routes
const marketRoutes = require('./routes/marketRoutes');
const authRoutes = require('./routes/authRoutes');   
const adminRoutes = require('./routes/adminRoutes'); 
const forumRoutes = require('./routes/forumRoutes');
const eventRoutes = require('./routes/events');
const newsRoutes = require('./routes/newsRoutes'); // ✅ NEW

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

app.use(cors(corsOptions));

// FIXED FOR EXPRESS 5: Catch-all OPTIONS handler
app.options(/^(.*)$/, cors(corsOptions));

// --- UPDATED FOR IMAGE UPLOADS ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// --- API ROUTES ---
app.use('/api/market', marketRoutes);
app.use('/api/auth', authRoutes);   
app.use('/api/admin', adminRoutes); 
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/news', newsRoutes); // ✅ NEW - Replaces the old inline endpoint

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
      events: '/api/events',
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
