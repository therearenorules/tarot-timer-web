import { Router } from 'express';
import { register, login, refreshToken, getCurrentUser, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

// Health check for auth service
router.get('/health', (req, res) => {
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

export default router;