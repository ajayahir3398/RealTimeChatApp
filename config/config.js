require('dotenv').config({ path: './config.env' });

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/chatApp',
  
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  corsOptions: {
    origin: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      (process.env.NODE_ENV === 'production' ? 
        ['https://your-frontend-domain.onrender.com'] : 
        ['http://localhost:3000', 'http://localhost:4200']),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

module.exports = config; 