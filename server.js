const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const http = require('http');
const { Server } = require('socket.io');

const config = require('./config/config');
const { connectDB } = require('./config/database');
const swaggerSpecs = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Middleware
const helmetOptions = {
  crossOriginResourcePolicy: { policy: "cross-origin" }
};

// Disable some security headers in development for easier testing
if (process.env.NODE_ENV === 'development') {
  helmetOptions.contentSecurityPolicy = false;
  helmetOptions.crossOriginEmbedderPolicy = false;
}

app.use(helmet(helmetOptions));
app.use(cors(config.corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors(config.corsOptions));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Chat App API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Chat App API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-09-06T10:30:00.000Z
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Chat App API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO test endpoint
app.get('/socket-test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Socket.IO test endpoint',
    socketConnected: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

// Test database connection and user
app.get('/test-db', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findOne({ mobile: '9876543210' });
    
    res.status(200).json({
      status: 'success',
      message: 'Database connection test',
      data: {
        userExists: !!user,
        userDetails: user ? {
          name: user.name,
          mobile: user.mobile,
          status: user.status,
          hasPassword: !!user.password,
          passwordLength: user.password ? user.password.length : 0
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Test user registration
app.post('/test-register', async (req, res) => {
  try {
    const User = require('./models/User');
    
    // Check if user already exists
    const existingUser = await User.findOne({ mobile: '9876543210' });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists',
        data: {
          name: existingUser.name,
          mobile: existingUser.mobile,
          hasPassword: !!existingUser.password,
          passwordLength: existingUser.password ? existingUser.password.length : 0
        }
      });
    }
    
    // Create new user
    const user = new User({
      name: 'Test User',
      mobile: '9876543210',
      password: 'Password123'
    });
    
    await user.save();
    
    res.status(201).json({
      status: 'success',
      message: 'Test user created successfully',
      data: {
        name: user.name,
        mobile: user.mobile,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Test registration failed',
      error: error.message
    });
  }
});

// Fix existing user by adding password
app.post('/fix-user', async (req, res) => {
  try {
    const User = require('./models/User');
    
    // Find existing user
    const user = await User.findOne({ mobile: '9876543210' });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Update user with password
    user.password = 'Password123';
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'User password updated successfully',
      data: {
        name: user.name,
        mobile: user.mobile,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fix user',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ 
    status: 'error', 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'Route not found' 
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOptions.origin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  // Production optimizations
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);
  console.log('📡 Transport:', socket.conn.transport.name);

  // Join chat room
  socket.on('joinRoom', (chatId) => {
    console.log('👥 User joining room:', chatId, 'Socket ID:', socket.id);
    socket.join(chatId);
    // Optionally, emit a joined event
    socket.emit('joinedRoom', chatId);
    console.log('✅ User joined room:', chatId);
    
    // Log all rooms this socket is in
    const rooms = Array.from(socket.rooms);
    console.log('🏠 Socket rooms:', rooms);
  });

  // Handle sending messages (for demo, actual DB logic is in controller)
  socket.on('sendMessage', (data) => {
    console.log('📤 Sending message:', data);
    console.log('🎯 Emitting to room:', data.chatId);
    
    // Get all sockets in the room
    const roomSockets = io.sockets.adapter.rooms.get(data.chatId);
    console.log('👥 Sockets in room:', roomSockets ? roomSockets.size : 0);
    
    // You can call your controller logic here if needed
    // For now, just emit to room:
    io.to(data.chatId).emit('receiveMessage', data);
    console.log('✅ Message emitted to room:', data.chatId);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 User disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error);
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io }; 