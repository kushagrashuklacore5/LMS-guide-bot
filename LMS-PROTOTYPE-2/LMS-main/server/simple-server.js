// Simple server startup script
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/sqlite-db');
const { Server } = require('socket.io');
const fs = require('fs');

console.log('🚀 Starting server...');

const app = express();

// Middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_key';
        const decoded = require('jsonwebtoken').verify(token, jwtSecret);
        
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
          name: decoded.name || '',
          universityId: decoded.universityId || decoded.university_id || 1
        };
        
        console.log('✅ Auth - Token verified, userId:', req.user.userId, 'role:', req.user.role);
        return next();
      }
    } catch (error) {
      console.log('❌ Auth - Invalid token:', error.message);
    req.user = {
        userId: null,
        role: 'guest',
        name: 'Guest'
      };
      next();
    }
  } catch (error) {
    console.log('❌ Auth middleware error:', error.message);
    req.user = {
      userId: null,
      role: 'guest',
      name: 'Guest'
    };
    next();
  }
};

// Routes
const storekeeperRoutes = require('./routes/storekeeperRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/storekeeper', storekeeperRoutes);

// Start server
const PORT = process.env.PORT || 5003;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:5177',
      'http://127.0.0.1:5178'
    ]
  }
});

io.on('connection', (socket) => {
  console.log('🔗 Client connected');
});

server.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log('📅 Available on:');
  console.log(`   - http://localhost:${PORT}`);
});
