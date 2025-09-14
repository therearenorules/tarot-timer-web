// PerformanceMonitorService.ts - Comprehensive performance monitoring system
// Tracks API response times, database queries, system resources, and user metrics

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Performance metrics interfaces
interface APIMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

interface DatabaseMetrics {
  query: string;
  executionTime: number;
  rowsAffected?: number;
  timestamp: number;
  userId?: string;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  timestamp: number;
  activeConnections: number;
  cacheHitRate: number;
}

interface UserSessionMetrics {
  userId: string;
  sessionDuration: number;
  pagesVisited: number;
  actionsPerformed: number;
  timestamp: number;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  location?: string;
}

interface ErrorMetrics {
  error: string;
  stack?: string;
  endpoint?: string;
  userId?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Aggregated performance data
interface PerformanceSnapshot {
  timestamp: number;
  api: {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    slowestEndpoints: { endpoint: string; avgTime: number }[];
  };
  database: {
    averageQueryTime: number;
    totalQueries: number;
    slowestQueries: { query: string; avgTime: number }[];
  };
  system: {
    avgCpuUsage: number;
    avgMemoryUsage: number;
    peakMemoryUsage: number;
    cacheEfficiency: number;
  };
  users: {
    activeUsers: number;
    averageSessionTime: number;
    bounceRate: number;
    topActions: { action: string; count: number }[];
  };
  errors: {
    totalErrors: number;
    criticalErrors: number;
    errorsByType: { type: string; count: number }[];
  };
}

export class PerformanceMonitorService extends EventEmitter {
  private apiMetrics: APIMetrics[] = [];
  private dbMetrics: DatabaseMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private userMetrics: UserSessionMetrics[] = [];
  private errorMetrics: ErrorMetrics[] = [];

  private readonly MAX_STORED_METRICS = 10000;
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private readonly ALERT_THRESHOLDS = {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.8 // 80%
  };

  private cleanupTimer?: NodeJS.Timeout;
  private systemMonitorTimer?: NodeJS.Timeout;

  constructor() {
    super();
    this.startSystemMonitoring();
    this.startPeriodicCleanup();
    console.log('[PerformanceMonitor] Performance monitoring system initialized');
  }

  // Start continuous system monitoring
  private startSystemMonitoring(): void {
    this.systemMonitorTimer = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  // Collect current system metrics
  private collectSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics: SystemMetrics = {
      cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
      memoryUsage: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: memUsage.heapUsed / memUsage.heapTotal
      },
      timestamp: Date.now(),
      activeConnections: 0, // Will be updated by connection tracking
      cacheHitRate: 0 // Will be updated by cache service
    };

    this.addSystemMetric(metrics);

    // Check for alerts
    this.checkSystemAlerts(metrics);
  }

  // Record API performance metrics
  public recordAPIMetric(data: APIMetrics): void {
    this.apiMetrics.push(data);
    this.trimArray(this.apiMetrics);

    // Check for performance alerts
    if (data.responseTime > this.ALERT_THRESHOLDS.responseTime) {
      this.emit('slowResponse', data);
      console.warn(`[PerformanceMonitor] Slow API response detected: ${data.endpoint} (${data.responseTime}ms)`);
    }

    // Calculate error rate and check threshold
    const recentErrors = this.getRecentAPIErrors();
    const errorRate = recentErrors.length / Math.min(this.apiMetrics.length, 100);
    if (errorRate > this.ALERT_THRESHOLDS.errorRate) {
      this.emit('highErrorRate', { errorRate, recentErrors });
    }

    console.log(`[PerformanceMonitor] API: ${data.method} ${data.endpoint} - ${data.responseTime}ms (${data.statusCode})`);
  }

  // Record database performance metrics
  public recordDatabaseMetric(data: DatabaseMetrics): void {
    this.dbMetrics.push(data);
    this.trimArray(this.dbMetrics);

    if (data.executionTime > 1000) { // Alert for queries over 1 second
      this.emit('slowQuery', data);
      console.warn(`[PerformanceMonitor] Slow database query: ${data.executionTime}ms`);
    }

    console.log(`[PerformanceMonitor] DB Query: ${data.executionTime}ms`);
  }

  // Record user session metrics
  public recordUserMetric(data: UserSessionMetrics): void {
    this.userMetrics.push(data);
    this.trimArray(this.userMetrics);
    console.log(`[PerformanceMonitor] User session: ${data.userId} (${data.sessionDuration}ms)`);
  }

  // Record error metrics
  public recordError(data: ErrorMetrics): void {
    this.errorMetrics.push(data);
    this.trimArray(this.errorMetrics);

    if (data.severity === 'critical') {
      this.emit('criticalError', data);
      console.error(`[PerformanceMonitor] Critical error: ${data.error}`);
    }

    console.log(`[PerformanceMonitor] Error recorded: ${data.severity} - ${data.error}`);
  }

  // Add system metrics
  public addSystemMetric(data: SystemMetrics): void {
    this.systemMetrics.push(data);
    this.trimArray(this.systemMetrics);
  }

  // Update cache hit rate
  public updateCacheHitRate(hitRate: number): void {
    const latest = this.systemMetrics[this.systemMetrics.length - 1];
    if (latest) {
      latest.cacheHitRate = hitRate;
    }
  }

  // Update active connections count
  public updateActiveConnections(count: number): void {
    const latest = this.systemMetrics[this.systemMetrics.length - 1];
    if (latest) {
      latest.activeConnections = count;
    }
  }

  // Generate performance snapshot
  public getPerformanceSnapshot(timeRange: number = 3600000): PerformanceSnapshot {
    const now = Date.now();
    const cutoff = now - timeRange;

    const recentAPI = this.apiMetrics.filter(m => m.timestamp >= cutoff);
    const recentDB = this.dbMetrics.filter(m => m.timestamp >= cutoff);
    const recentSystem = this.systemMetrics.filter(m => m.timestamp >= cutoff);
    const recentUsers = this.userMetrics.filter(m => m.timestamp >= cutoff);
    const recentErrors = this.errorMetrics.filter(m => m.timestamp >= cutoff);

    return {
      timestamp: now,
      api: this.calculateAPIStats(recentAPI),
      database: this.calculateDBStats(recentDB),
      system: this.calculateSystemStats(recentSystem),
      users: this.calculateUserStats(recentUsers),
      errors: this.calculateErrorStats(recentErrors)
    };
  }

  // Calculate API statistics
  private calculateAPIStats(metrics: APIMetrics[]) {
    if (metrics.length === 0) {
      return {
        averageResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        slowestEndpoints: []
      };
    }

    const totalRequests = metrics.length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const errors = metrics.filter(m => m.statusCode >= 400);
    const errorRate = errors.length / totalRequests;

    // Group by endpoint and calculate average response times
    const endpointStats = new Map<string, { total: number; count: number }>();
    metrics.forEach(m => {
      const key = `${m.method} ${m.endpoint}`;
      const existing = endpointStats.get(key) || { total: 0, count: 0 };
      endpointStats.set(key, {
        total: existing.total + m.responseTime,
        count: existing.count + 1
      });
    });

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgTime: stats.total / stats.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      averageResponseTime,
      totalRequests,
      errorRate,
      slowestEndpoints
    };
  }

  // Calculate database statistics
  private calculateDBStats(metrics: DatabaseMetrics[]) {
    if (metrics.length === 0) {
      return {
        averageQueryTime: 0,
        totalQueries: 0,
        slowestQueries: []
      };
    }

    const totalQueries = metrics.length;
    const averageQueryTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries;

    // Group queries and find slowest
    const queryStats = new Map<string, { total: number; count: number }>();
    metrics.forEach(m => {
      const query = m.query.substring(0, 50) + '...'; // Truncate for readability
      const existing = queryStats.get(query) || { total: 0, count: 0 };
      queryStats.set(query, {
        total: existing.total + m.executionTime,
        count: existing.count + 1
      });
    });

    const slowestQueries = Array.from(queryStats.entries())
      .map(([query, stats]) => ({
        query,
        avgTime: stats.total / stats.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      averageQueryTime,
      totalQueries,
      slowestQueries
    };
  }

  // Calculate system statistics
  private calculateSystemStats(metrics: SystemMetrics[]) {
    if (metrics.length === 0) {
      return {
        avgCpuUsage: 0,
        avgMemoryUsage: 0,
        peakMemoryUsage: 0,
        cacheEfficiency: 0
      };
    }

    const avgCpuUsage = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage.percentage, 0) / metrics.length;
    const peakMemoryUsage = Math.max(...metrics.map(m => m.memoryUsage.percentage));
    const cacheEfficiency = metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / metrics.length;

    return {
      avgCpuUsage,
      avgMemoryUsage,
      peakMemoryUsage,
      cacheEfficiency
    };
  }

  // Calculate user statistics
  private calculateUserStats(metrics: UserSessionMetrics[]) {
    if (metrics.length === 0) {
      return {
        activeUsers: 0,
        averageSessionTime: 0,
        bounceRate: 0,
        topActions: []
      };
    }

    const uniqueUsers = new Set(metrics.map(m => m.userId)).size;
    const averageSessionTime = metrics.reduce((sum, m) => sum + m.sessionDuration, 0) / metrics.length;
    const shortSessions = metrics.filter(m => m.sessionDuration < 30000).length; // Less than 30 seconds
    const bounceRate = shortSessions / metrics.length;

    // This is a placeholder for action tracking - would need additional data
    const topActions = [
      { action: 'timer_start', count: Math.floor(metrics.length * 0.6) },
      { action: 'card_draw', count: Math.floor(metrics.length * 0.4) },
      { action: 'journal_write', count: Math.floor(metrics.length * 0.3) }
    ];

    return {
      activeUsers: uniqueUsers,
      averageSessionTime,
      bounceRate,
      topActions
    };
  }

  // Calculate error statistics
  private calculateErrorStats(metrics: ErrorMetrics[]) {
    const totalErrors = metrics.length;
    const criticalErrors = metrics.filter(m => m.severity === 'critical').length;

    // Group errors by type
    const errorTypes = new Map<string, number>();
    metrics.forEach(m => {
      const type = m.error.split(':')[0] || 'Unknown';
      errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
    });

    const errorsByType = Array.from(errorTypes.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors,
      criticalErrors,
      errorsByType
    };
  }

  // Check for system alerts
  private checkSystemAlerts(metrics: SystemMetrics): void {
    if (metrics.memoryUsage.percentage > this.ALERT_THRESHOLDS.memoryUsage) {
      this.emit('highMemoryUsage', metrics);
      console.warn(`[PerformanceMonitor] High memory usage: ${(metrics.memoryUsage.percentage * 100).toFixed(1)}%`);
    }

    if (metrics.cpuUsage > this.ALERT_THRESHOLDS.cpuUsage) {
      this.emit('highCpuUsage', metrics);
      console.warn(`[PerformanceMonitor] High CPU usage: ${(metrics.cpuUsage * 100).toFixed(1)}%`);
    }
  }

  // Get recent API errors
  private getRecentAPIErrors(): APIMetrics[] {
    const cutoff = Date.now() - (5 * 60 * 1000); // Last 5 minutes
    return this.apiMetrics.filter(m => m.timestamp >= cutoff && m.statusCode >= 400);
  }

  // Trim array to maximum size
  private trimArray<T>(array: T[]): void {
    if (array.length > this.MAX_STORED_METRICS) {
      array.splice(0, array.length - this.MAX_STORED_METRICS);
    }
  }

  // Start periodic cleanup of old metrics
  private startPeriodicCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldMetrics();
    }, this.CLEANUP_INTERVAL);
  }

  // Clean up metrics older than 24 hours
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    const originalCounts = {
      api: this.apiMetrics.length,
      db: this.dbMetrics.length,
      system: this.systemMetrics.length,
      user: this.userMetrics.length,
      error: this.errorMetrics.length
    };

    this.apiMetrics = this.apiMetrics.filter(m => m.timestamp >= cutoff);
    this.dbMetrics = this.dbMetrics.filter(m => m.timestamp >= cutoff);
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp >= cutoff);
    this.userMetrics = this.userMetrics.filter(m => m.timestamp >= cutoff);
    this.errorMetrics = this.errorMetrics.filter(m => m.timestamp >= cutoff);

    const cleanedCounts = {
      api: originalCounts.api - this.apiMetrics.length,
      db: originalCounts.db - this.dbMetrics.length,
      system: originalCounts.system - this.systemMetrics.length,
      user: originalCounts.user - this.userMetrics.length,
      error: originalCounts.error - this.errorMetrics.length
    };

    const totalCleaned = Object.values(cleanedCounts).reduce((sum, count) => sum + count, 0);
    if (totalCleaned > 0) {
      console.log(`[PerformanceMonitor] Cleaned up ${totalCleaned} old metrics`);
    }
  }

  // Get health status
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'critical';
    details: any;
  } {
    const snapshot = this.getPerformanceSnapshot(300000); // Last 5 minutes

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    const issues: string[] = [];

    // Check various health indicators
    if (snapshot.api.errorRate > this.ALERT_THRESHOLDS.errorRate) {
      status = 'degraded';
      issues.push(`High API error rate: ${(snapshot.api.errorRate * 100).toFixed(1)}%`);
    }

    if (snapshot.api.averageResponseTime > this.ALERT_THRESHOLDS.responseTime) {
      status = 'degraded';
      issues.push(`Slow API response time: ${snapshot.api.averageResponseTime.toFixed(0)}ms`);
    }

    if (snapshot.system.avgMemoryUsage > this.ALERT_THRESHOLDS.memoryUsage) {
      status = status === 'healthy' ? 'degraded' : 'critical';
      issues.push(`High memory usage: ${(snapshot.system.avgMemoryUsage * 100).toFixed(1)}%`);
    }

    if (snapshot.errors.criticalErrors > 0) {
      status = 'critical';
      issues.push(`${snapshot.errors.criticalErrors} critical errors detected`);
    }

    return {
      status,
      details: {
        issues,
        snapshot,
        uptime: process.uptime()
      }
    };
  }

  // Express middleware to track API performance
  public createAPIMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = performance.now();

      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = (...args: any[]) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        this.recordAPIMetric({
          endpoint: req.path || req.url,
          method: req.method,
          responseTime,
          statusCode: res.statusCode,
          timestamp: Date.now(),
          userId: req.user?.id,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });

        return originalEnd.apply(res, args);
      };

      next();
    };
  }

  // Shutdown cleanup
  public shutdown(): void {
    console.log('[PerformanceMonitor] Shutting down performance monitoring...');

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    if (this.systemMonitorTimer) {
      clearInterval(this.systemMonitorTimer);
    }

    // Final cleanup
    this.cleanupOldMetrics();

    console.log('[PerformanceMonitor] Performance monitoring shut down successfully');
  }
}

export default PerformanceMonitorService;