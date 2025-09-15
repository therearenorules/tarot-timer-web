const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8083,http://localhost:8084,http://localhost:8085,http://localhost:8086';

console.log('🚀 Starting Tarot Timer Backend (Simple Mode)');
console.log('📡 CORS Origins:', CORS_ORIGIN);
console.log('🔑 JWT Secret configured:', !!process.env.JWT_SECRET);

// CORS configuration for multiple origins
const corsOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'simple-development',
    services: {
      auth: 'mock'
    }
  });
});

// Mock API endpoints for development
app.get('/api/auth/health', (req, res) => {
  res.json({
    service: 'Authentication',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      registration: true,
      login: true,
      jwtTokens: true,
      trialSystem: true
    }
  });
});

// Mock subscription status endpoint
app.get('/api/subscription/status', (req, res) => {
  res.json({
    tier: 'free',
    isActive: true,
    usage: {
      totalSaves: 0,
      saveLimit: 7,
      remainingSaves: 7,
      dailySaves: 0,
      spreadSaves: 0
    },
    features: {
      allowedSpreads: ['one_card', 'three_card', 'four_card', 'five_card_v'],
      hasUnlimitedSaves: false,
      hasNotifications: true,
      hasPremiumSpreads: false
    },
    periods: {
      trialDaysLeft: 0,
      premiumDaysLeft: 0,
      isTrialActive: false,
      isPremiumActive: false
    }
  });
});

// Mock notification endpoints
app.post('/api/notifications/register-token', (req, res) => {
  console.log('📱 Mock: Notification token registered');
  res.json({ message: 'Token registered successfully' });
});

app.post('/api/notifications/schedule-hourly', (req, res) => {
  console.log('⏰ Mock: Hourly notifications scheduled');
  res.json({ message: 'Hourly notifications scheduled' });
});

app.delete('/api/notifications/cancel-hourly', (req, res) => {
  console.log('❌ Mock: Hourly notifications cancelled');
  res.json({ message: 'Hourly notifications cancelled' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Available endpoints: /health, /api/auth/health, /api/subscription/status'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth health: http://localhost:${PORT}/api/auth/health`);
  console.log(`💎 Subscription status: http://localhost:${PORT}/api/subscription/status`);
  console.log('🎯 Ready for frontend connections!');
  console.log('📝 Note: This is a mock server for development purposes');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});