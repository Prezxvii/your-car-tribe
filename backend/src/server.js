const express = require('express');
const cors = require('cors');
const http = require('http'); // Required to bind express with socket.io
const { Server } = require('socket.io'); // Real-time server layer
require('dotenv').config();
const connectDB = require('./config/db');

// Route Imports
const marketRoutes = require('./routes/marketRoutes');
const authRoutes = require('./routes/authRoutes');   
const adminRoutes = require('./routes/adminRoutes'); 
const forumRoutes = require('./routes/forumRoutes');
const eventRoutes = require('./routes/events');
const newsRoutes = require('./routes/newsRoutes');
const mechanicRoutes = require('./routes/mechanicRoutes');
const chatRoutes = require('./routes/chatRoutes'); // New chat routes

const app = express();
const PORT = process.env.PORT || 10000; 

// Create HTTP Server from Express App instance
const server = http.createServer(app);

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
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Initialize Socket.io with matching CORS policy settings
const io = new Server(server, {
  cors: corsOptions
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  const origin = req.get('origin') || 'No Origin';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});

// Attach socket reference to responses if routes need to emit system messages
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Core Domain Routers
app.use('/api/market', marketRoutes);
app.use('/api/auth', authRoutes);   
app.use('/api/admin', adminRoutes); 
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/mechanics', mechanicRoutes); 
app.use('/api/chat', chatRoutes); // Registered chat session engine

app.get('/', (req, res) => {
  res.json({ 
    message: 'Tribe Market API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      market: '/api/market',
      auth: '/api/auth',
      admin: '/api/admin',
      forum: '/api/forum',
      events: '/api/events',
      news: '/api/news/car-news',
      mechanics: '/api/mechanics',
      chat: '/api/chat'
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

// Socket.io Connection Event Handlers
const ChatSession = require('./models/MessageSession');
io.on('connection', (socket) => {
  console.log(`User connected to gateway: ${socket.id}`);

  // Bind individual user to a room named after their unique username
  socket.on('identify_user', (username) => {
    if (username) {
      socket.join(username);
      console.log(`User "${username}" bound to personal notification channel.`);
    }
  });

  socket.on('join_chat', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined thread matrix room: ${sessionId}`);
  });

  socket.on('send_message', async (data) => {
    const { sessionId, sender, text } = data;
    const newMessage = { sender, text, timestamp: new Date() };

    try {
      const session = await ChatSession.findById(sessionId);
      if (session) {
        session.messages.push(newMessage);
        await session.save();
        
        // Get the fully saved message instance from the subdocument array to carry its native MongoDB _id
        const savedMessage = session.messages[session.messages.length - 1];
        
        // Emit to the active chat room view instantly
        io.to(sessionId).emit('receive_message', savedMessage);

        // Determine recipient to dispatch background notifications
        const receiver = sender === session.buyerUsername ? session.sellerUsername : session.buyerUsername;
        
        
        io.to(receiver).emit('new_chat_notification', {
          sessionId: session._id,
          listingId: session.listingId,
          message: {
            _id: savedMessage._id,
            sender: savedMessage.sender,
            text: savedMessage.text,
            timestamp: savedMessage.timestamp
          }
        });
      }
    } catch (err) {
      console.error('Real-time sync transmission leak:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Gateway connection severed: ${socket.id}`);
  });
});

// Start listening using the wrapped 'server' object instead of 'app'
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Tribe Market Server running on port ${PORT}`);
  console.log(`CORS allowed for: ${allowedOrigins.join(', ')}`);
});