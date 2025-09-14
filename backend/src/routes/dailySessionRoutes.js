const { Router } = require('express');
const {
  getDailySession,
  saveDailySession,
  getDailySessions,
  deleteDailySession
} = require('../controllers/dailySessionController.js');
const { authenticateToken } = require('../middleware/auth');

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get daily session for specific date
router.get('/:date', getDailySession);

// Save/Update daily session
router.post('/', saveDailySession);
router.put('/', saveDailySession); // PUT also allowed for updates

// Delete daily session (must be before GET / route)
router.delete('/:date', deleteDailySession);

// Get multiple daily sessions (with optional date range)
router.get('/', getDailySessions);

// Health check for daily session service
router.get('/health/check', (req, res) => {
  res.json({
    service: 'Daily Tarot Sessions',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      createSession: true,
      updateSession: true,
      retrieveSession: true,
      deleteSession: true,
      dateRangeQuery: true,
      cardsValidation: true
    }
  });
});

module.exports = router;