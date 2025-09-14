const { Router } = require('express');
const {
  getSyncStatus,
  exportUserData,
  importUserData,
  clearUserData
} = require('../controllers/syncController.js');
const { authenticateToken } = require('../middleware/auth');

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get sync status and metadata
router.get('/status', getSyncStatus);

// Export all user data for full sync
router.get('/export', exportUserData);

// Import user data for full sync
router.post('/import', importUserData);

// Clear all user data (dangerous operation)
router.delete('/clear', clearUserData);

// Health check for sync service
router.get('/health', (req, res) => {
  res.json({
    service: 'Data Synchronization',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      syncStatus: true,
      dataExport: true,
      dataImport: true,
      dataClear: true,
      bulkOperations: true,
      offlineSync: true
    },
    supportedOperations: [
      'GET /api/sync/status - Get sync status and metadata',
      'GET /api/sync/export - Export all user data',
      'POST /api/sync/import - Import user data',
      'DELETE /api/sync/clear - Clear all user data'
    ]
  });
});

module.exports = router;