import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import authRoutes from './routes/authRoutes';
import dailySessionRoutes from './routes/dailySessionRoutes.js';
import spreadRoutes from './routes/spreadRoutes';
import syncRoutes from './routes/syncRoutes.js';
import performanceRoutes, { setPerformanceMonitor } from './routes/performanceRoutes';
import tarotRoutes from './routes/tarotRoutes';
import WebSocketService from './services/WebSocketService';
import CacheService from './services/CacheService';
import { PerformanceMonitorService } from './services/PerformanceMonitorService';
import { createCacheMiddleware } from './middleware/cache';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8082';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
  });
}

// Initialize cache service and middleware
const cacheService = new CacheService({
  defaultTTL: 300,
  enableAnalytics: true,
  fallbackToMemory: true,
  redisUrl: process.env.REDIS_URL // Optional Redis connection
});

// Initialize performance monitoring service
const performanceMonitor = new PerformanceMonitorService();
setPerformanceMonitor(performanceMonitor);

const cacheMiddleware = createCacheMiddleware(cacheService);

// Add performance monitoring middleware
app.use(performanceMonitor.createAPIMiddleware());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: { status: 'connected' }
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: { status: 'disconnected', error: 'Database connection failed' }
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/daily-sessions', dailySessionRoutes);
app.use('/api/spreads', spreadRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/tarot', tarotRoutes);

// WebSocket status endpoint
app.get('/api/websocket/status', (req, res) => {
  const health = webSocketService.healthCheck();
  res.json(health);
});

// Cache analytics and management endpoints
app.get('/api/cache/status', cacheMiddleware.healthCheck());
app.get('/api/cache/analytics', cacheMiddleware.analytics());

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: '🔮 Tarot Timer API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      dailySessions: '/api/daily-sessions/*',
      spreads: '/api/spreads/*',
      sync: '/api/sync/*',
      websocket: '/api/websocket/status',
      cache: '/api/cache/*',
      performance: '/api/performance/*',
      tarot: '/api/tarot/*'
    },
    realtime: {
      enabled: true,
      endpoint: 'ws://localhost:3000/socket.io/',
      transport: ['websocket', 'polling']
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const httpServer = createServer(app);

// Cache service and middleware initialized above

// Initialize WebSocket service after cache service
const webSocketService = new WebSocketService(httpServer);

// Start server
const server = httpServer.listen(PORT, () => {
  console.log('🔮 Tarot Timer Backend Server');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for: ${CORS_ORIGIN}`);
  console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📋 Available endpoints:');
  console.log(`  - Health Check: http://localhost:${PORT}/health`);
  console.log(`  - API Root: http://localhost:${PORT}/api`);
  console.log(`  - WebSocket: ws://localhost:${PORT}/socket.io/`);
  console.log('✨ WebSocket real-time features enabled');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await performanceMonitor.shutdown();
  await webSocketService.shutdown();
  await cacheService.shutdown();
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await performanceMonitor.shutdown();
  await webSocketService.shutdown();
  await cacheService.shutdown();
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});

export { app as default, prisma, webSocketService };