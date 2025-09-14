import { Router } from 'express';
import { 
  getDailySessions, 
  getDailySession, 
  createOrUpdateDailySession, 
  updateDailySessionMemos, 
  deleteDailySession,
  getStorageStats
} from '../controllers/dailySessionController';
import { authenticateToken } from '../utils/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Daily session routes
router.get('/', getDailySessions);                    // GET /api/daily-sessions
router.get('/stats', getStorageStats);                // GET /api/daily-sessions/stats
router.get('/:date', getDailySession);                // GET /api/daily-sessions/2024-01-15
router.post('/', createOrUpdateDailySession);         // POST /api/daily-sessions
router.put('/:date/memos', updateDailySessionMemos);  // PUT /api/daily-sessions/2024-01-15/memos
router.delete('/:date', deleteDailySession);          // DELETE /api/daily-sessions/2024-01-15

// Health check for daily sessions service
router.get('/service/health', (req, res) => {
  res.json({
    service: 'Daily Tarot Sessions',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      createSessions: true,
      updateMemos: true,
      retrieveSessions: true,
      deleteSessions: true,
      dataValidation: true,
      frontendCompatible: true
    },
    supportedOperations: [
      'GET /api/daily-sessions - Get all user sessions',
      'GET /api/daily-sessions/:date - Get specific session',
      'POST /api/daily-sessions - Create/update session',
      'PUT /api/daily-sessions/:date/memos - Update memos',
      'DELETE /api/daily-sessions/:date - Delete session'
    ]
  });
});

export default router;