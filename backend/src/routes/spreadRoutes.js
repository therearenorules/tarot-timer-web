const { Router } = require('express');
const {
  getSpreads,
  getSpread,
  saveSpread,
  updateSpread,
  deleteSpread
} = require('../controllers/spreadController.js');
const { authenticateToken } = require('../middleware/auth');

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all spread readings for user
router.get('/', getSpreads);

// Save new spread reading
router.post('/', saveSpread);

// Get specific spread reading by ID
router.get('/:spreadId', getSpread);

// Update existing spread reading
router.put('/:spreadId', updateSpread);

// Delete spread reading
router.delete('/:spreadId', deleteSpread);

// Health check for spread readings service
router.get('/service/health', (req, res) => {
  res.json({
    service: 'Spread Readings',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      createSpread: true,
      updateSpread: true,
      retrieveSpread: true,
      deleteSpread: true,
      tagsSupport: true,
      insightsSupport: true,
      pagination: true,
      spreadTypeFilter: true
    },
    supportedOperations: [
      'GET /api/spreads - Get all user spread readings',
      'GET /api/spreads/:id - Get specific spread reading',
      'POST /api/spreads - Create new spread reading',
      'PUT /api/spreads/:id - Update spread reading',
      'DELETE /api/spreads/:id - Delete spread reading'
    ]
  });
});

module.exports = router;