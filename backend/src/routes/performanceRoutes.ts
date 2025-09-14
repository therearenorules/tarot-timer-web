// performanceRoutes.ts - Performance monitoring API endpoints
// Provides real-time performance metrics and health status

import { Router } from 'express';
import { PerformanceMonitorService } from '../services/PerformanceMonitorService';
import { authenticateToken } from '../utils/auth';

const router = Router();

// Initialize performance monitor service (will be injected from main app)
let performanceMonitor: PerformanceMonitorService;

export const setPerformanceMonitor = (monitor: PerformanceMonitorService) => {
  performanceMonitor = monitor;
};

// Get current performance snapshot
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 3600000; // Default 1 hour
    const snapshot = performanceMonitor.getPerformanceSnapshot(timeRange);

    res.json({
      success: true,
      data: snapshot,
      metadata: {
        timeRange,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[PerformanceRoutes] Error getting metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics'
    });
  }
});

// Get system health status
router.get('/health', async (req, res) => {
  try {
    const health = performanceMonitor.getHealthStatus();

    const statusCode = health.status === 'healthy' ? 200 :
                      health.status === 'degraded' ? 206 : 503;

    res.status(statusCode).json({
      success: true,
      status: health.status,
      details: health.details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[PerformanceRoutes] Error getting health status:', error);
    res.status(503).json({
      success: false,
      status: 'critical',
      error: 'Failed to retrieve health status'
    });
  }
});

// Get API performance statistics
router.get('/api-stats', authenticateToken, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 3600000;
    const snapshot = performanceMonitor.getPerformanceSnapshot(timeRange);

    res.json({
      success: true,
      data: {
        api: snapshot.api,
        timestamp: snapshot.timestamp
      }
    });
  } catch (error) {
    console.error('[PerformanceRoutes] Error getting API stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve API statistics'
    });
  }
});

// Get database performance statistics
router.get('/database-stats', authenticateToken, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 3600000;
    const snapshot = performanceMonitor.getPerformanceSnapshot(timeRange);

    res.json({
      success: true,
      data: {
        database: snapshot.database,
        timestamp: snapshot.timestamp
      }
    });
  } catch (error) {
    console.error('[PerformanceRoutes] Error getting database stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database statistics'
    });
  }
});

// Get system resource statistics
router.get('/system-stats', authenticateToken, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 3600000;
    const snapshot = performanceMonitor.getPerformanceSnapshot(timeRange);

    res.json({
      success: true,
      data: {
        system: snapshot.system,
        timestamp: snapshot.timestamp
      }
    });
  } catch (error) {
    console.error('[PerformanceRoutes] Error getting system stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system statistics'
    });
  }
});

// Get user activity statistics
router.get('/user-stats', authenticateToken, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 3600000;
    const snapshot = performanceMonitor.getPerformanceSnapshot(timeRange);

    res.json({
      success: true,
      data: {
        users: snapshot.users,
        timestamp: snapshot.timestamp
      }
    });
  } catch (error) {
    console.error('[PerformanceRoutes] Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user statistics'
    });
  }
});

// Get error statistics and logs
router.get('/error-stats', authenticateToken, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 3600000;
    const snapshot = performanceMonitor.getPerformanceSnapshot(timeRange);

    res.json({
      success: true,
      data: {
        errors: snapshot.errors,
        timestamp: snapshot.timestamp
      }
    });
  } catch (error) {
    console.error('[PerformanceRoutes] Error getting error stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve error statistics'
    });
  }
});

// Record custom performance event (for frontend tracking)
router.post('/record-event', authenticateToken, async (req, res) => {
  try {
    const { type, data } = req.body;
    const userId = (req as any).user?.id;

    switch (type) {
      case 'user-session':
        performanceMonitor.recordUserMetric({
          userId,
          sessionDuration: data.sessionDuration,
          pagesVisited: data.pagesVisited || 1,
          actionsPerformed: data.actionsPerformed || 0,
          timestamp: Date.now(),
          deviceType: data.deviceType || 'desktop',
          location: data.location
        });
        break;

      case 'error':
        performanceMonitor.recordError({
          error: data.error,
          stack: data.stack,
          endpoint: data.endpoint,
          userId,
          timestamp: Date.now(),
          severity: data.severity || 'medium'
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Unknown event type'
        });
    }

    res.json({
      success: true,
      message: 'Event recorded successfully'
    });
  } catch (error) {
    console.error('[PerformanceRoutes] Error recording event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record performance event'
    });
  }
});

// Performance dashboard endpoint (aggregated data)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 3600000;
    const snapshot = performanceMonitor.getPerformanceSnapshot(timeRange);
    const health = performanceMonitor.getHealthStatus();

    // Calculate additional dashboard metrics
    const dashboardData = {
      overview: {
        status: health.status,
        uptime: process.uptime(),
        timestamp: snapshot.timestamp
      },
      performance: {
        avgResponseTime: snapshot.api.averageResponseTime,
        requestsPerMinute: (snapshot.api.totalRequests / (timeRange / 60000)),
        errorRate: snapshot.api.errorRate,
        dbQueryTime: snapshot.database.averageQueryTime
      },
      resources: {
        cpuUsage: snapshot.system.avgCpuUsage,
        memoryUsage: snapshot.system.avgMemoryUsage,
        cacheHitRate: snapshot.system.cacheEfficiency,
        activeConnections: 0 // Will be populated by connection tracking
      },
      users: {
        activeUsers: snapshot.users.activeUsers,
        avgSessionTime: snapshot.users.averageSessionTime,
        bounceRate: snapshot.users.bounceRate
      },
      alerts: health.details.issues || []
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('[PerformanceRoutes] Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
});

// Export metrics in various formats
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const format = req.query.format as string || 'json';
    const timeRange = parseInt(req.query.timeRange as string) || 3600000;
    const snapshot = performanceMonitor.getPerformanceSnapshot(timeRange);

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="performance-metrics-${Date.now()}.json"`);
        res.json(snapshot);
        break;

      case 'csv':
        // Simple CSV export for API metrics
        const csvData = [
          'Metric,Value,Timestamp',
          `Average Response Time,${snapshot.api.averageResponseTime},${new Date(snapshot.timestamp).toISOString()}`,
          `Total Requests,${snapshot.api.totalRequests},${new Date(snapshot.timestamp).toISOString()}`,
          `Error Rate,${snapshot.api.errorRate},${new Date(snapshot.timestamp).toISOString()}`,
          `Average Query Time,${snapshot.database.averageQueryTime},${new Date(snapshot.timestamp).toISOString()}`,
          `CPU Usage,${snapshot.system.avgCpuUsage},${new Date(snapshot.timestamp).toISOString()}`,
          `Memory Usage,${snapshot.system.avgMemoryUsage},${new Date(snapshot.timestamp).toISOString()}`
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="performance-metrics-${Date.now()}.csv"`);
        res.send(csvData);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported export format. Use json or csv.'
        });
    }
  } catch (error) {
    console.error('[PerformanceRoutes] Error exporting metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export performance metrics'
    });
  }
});

// Service health check specifically for performance monitoring
router.get('/service/health', (req, res) => {
  res.json({
    service: 'Performance Monitor',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      metricsCollection: true,
      performanceTracking: true,
      healthMonitoring: true,
      alerting: true,
      dataExport: true
    },
    supportedOperations: [
      'GET /api/performance/metrics - Get performance snapshot',
      'GET /api/performance/health - Get health status',
      'GET /api/performance/dashboard - Get dashboard data',
      'POST /api/performance/record-event - Record custom events',
      'GET /api/performance/export - Export metrics data'
    ]
  });
});

export default router;