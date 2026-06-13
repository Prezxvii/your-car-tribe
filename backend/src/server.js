const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const marketRoutes = require('./routes/marketRoutes');
const authRoutes = require('./routes/authRoutes');   
const adminRoutes = require('./routes/adminRoutes'); 
const forumRoutes = require('./routes/forumRoutes');
const eventRoutes = require('./routes/events');
const newsRoutes = require('./routes/newsRoutes');

const app = express();
const PORT = process.env.PORT || 10000; 

connectDB();

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  const origin = req.get('origin') || 'No Origin';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/market', marketRoutes);
app.use('/api/auth', authRoutes);   
app.use('/api/admin', adminRoutes); 
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/news', newsRoutes);

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

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Tribe Market Server running on port ${PORT}`);
  console.log(`📡 CORS allowed for: ${allowedOrigins.join(', ')}`);
});
