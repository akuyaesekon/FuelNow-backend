const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { port, baseUrl } = require('./config/environment');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpecs = require('./config/swagger');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://fuelnow-api.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://fuelnow-frontend.vercel.app', // Your future frontend
      'https://fuelnow-admin.vercel.app'     // Your future admin panel
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }
}));

// CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Apply rate limiting to all requests
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FuelNow API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true
  }
}));

// Routes
app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    baseUrl: baseUrl
  });
});

// Root endpoint - redirect to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'FuelNow API Server',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    baseUrl: baseUrl,
    endpoints: {
      auth: '/api/v1/auth',
      customers: '/api/v1/customers',
      transactions: '/api/v1/transactions',
      payments: '/api/v1/payments',
      admin: '/api/v1/admin'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: {
      documentation: '/api-docs',
      health: '/health',
      apiInfo: '/api'
    }
  });
});

// Enhanced error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`
    🚀 FuelNow API Server Started!
    🌐 Environment: ${process.env.NODE_ENV || 'development'}
    🔗 Server URL: http://localhost:${port}
    🌍 Production URL: ${baseUrl}
    📚 API Documentation: ${baseUrl}/api-docs
    ❤️ Health Check: ${baseUrl}/health
    🔑 API Base: ${baseUrl}/api/v1
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;