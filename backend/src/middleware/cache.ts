// cache.ts - Caching middleware for automatic request/response caching
// Provides intelligent caching based on request patterns and user behavior

import { Request, Response, NextFunction } from 'express';
import CacheService from '../services/CacheService';

// Cache configuration for different routes
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string; // Custom key generation
  skipCache?: (req: Request) => boolean; // Skip cache condition
  tags?: string[]; // Cache tags for invalidation
  varyBy?: string[]; // Vary cache by headers/params
}

// Default cache configurations for different route patterns
const DEFAULT_CACHE_CONFIGS: Record<string, CacheOptions> = {
  // User sessions - short TTL, user-specific
  '/api/daily-sessions': {
    ttl: 300, // 5 minutes
    tags: ['user-data', 'daily-sessions'],
    varyBy: ['userId']
  },

  // Spread readings - medium TTL
  '/api/spreads': {
    ttl: 900, // 15 minutes
    tags: ['user-data', 'spreads'],
    varyBy: ['userId']
  },

  // User profile - longer TTL
  '/api/auth/profile': {
    ttl: 1800, // 30 minutes
    tags: ['user-profile'],
    varyBy: ['userId']
  },

  // Statistics - very long TTL
  '/api/daily-sessions/stats': {
    ttl: 3600, // 1 hour
    tags: ['statistics'],
    varyBy: ['userId']
  },

  // Sync data - short TTL due to real-time nature
  '/api/sync/status': {
    ttl: 60, // 1 minute
    tags: ['sync-data'],
    varyBy: ['userId']
  }
};

export class CacheMiddleware {
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  // Generate cache key for request
  private generateCacheKey(req: Request, options: CacheOptions): string {
    let baseKey = `api:${req.method}:${req.route?.path || req.path}`;

    // Add user ID if available
    if ((req as any).userId) {
      baseKey += `:user:${(req as any).userId}`;
    }

    // Add query parameters
    if (Object.keys(req.query).length > 0) {
      const queryString = new URLSearchParams(req.query as any).toString();
      baseKey += `:query:${Buffer.from(queryString).toString('base64')}`;
    }

    // Add body hash for POST/PUT requests
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyString = JSON.stringify(req.body);
      const bodyHash = require('crypto')
        .createHash('md5')
        .update(bodyString)
        .digest('hex');
      baseKey += `:body:${bodyHash}`;
    }

    // Add vary-by parameters
    if (options.varyBy) {
      options.varyBy.forEach(param => {
        if (req.headers[param]) {
          baseKey += `:${param}:${req.headers[param]}`;
        }
        if ((req as any)[param]) {
          baseKey += `:${param}:${(req as any)[param]}`;
        }
      });
    }

    // Custom key generator
    if (options.keyGenerator) {
      baseKey = options.keyGenerator(req);
    }

    return baseKey;
  }

  // Check if request should skip cache
  private shouldSkipCache(req: Request, options: CacheOptions): boolean {
    // Skip for non-GET requests by default
    if (req.method !== 'GET') {
      return true;
    }

    // Skip if explicitly configured
    if (options.skipCache && options.skipCache(req)) {
      return true;
    }

    // Skip if cache-control header says no-cache
    if (req.headers['cache-control']?.includes('no-cache')) {
      return true;
    }

    // Skip if authorization header changes frequently (like refresh tokens)
    if (req.headers.authorization?.includes('Bearer')) {
      // Allow caching for stable JWT tokens
      return false;
    }

    return false;
  }

  // Create caching middleware for specific route
  public cache(routePattern?: string, customOptions: CacheOptions = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Get cache configuration
        const defaultOptions = routePattern ? DEFAULT_CACHE_CONFIGS[routePattern] : {};
        const options: CacheOptions = { ...defaultOptions, ...customOptions };

        // Skip caching if conditions are met
        if (this.shouldSkipCache(req, options)) {
          return next();
        }

        // Generate cache key
        const cacheKey = this.generateCacheKey(req, options);

        // Try to get cached response
        const cachedResponse = await this.cacheService.get(cacheKey);

        if (cachedResponse) {
          // Cache hit - return cached response
          console.log(`[CacheMiddleware] Cache HIT: ${cacheKey}`);

          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);

          if (cachedResponse && typeof cachedResponse === 'object' && (cachedResponse as any).headers) {
            Object.keys((cachedResponse as any).headers).forEach(key => {
              res.set(key, (cachedResponse as any).headers[key]);
            });
          }

          const statusCode = (cachedResponse && typeof cachedResponse === 'object' && (cachedResponse as any).statusCode) ? (cachedResponse as any).statusCode : 200;
          const data = (cachedResponse && typeof cachedResponse === 'object' && (cachedResponse as any).data) ? (cachedResponse as any).data : cachedResponse;

          return res.status(statusCode).json(data);
        }

        // Cache miss - continue to route handler
        console.log(`[CacheMiddleware] Cache MISS: ${cacheKey}`);

        // Store original res.json to intercept response
        const originalJson = res.json.bind(res);
        const originalStatus = res.status.bind(res);
        let statusCode = 200;

        // Intercept res.status calls
        res.status = function(code: number) {
          statusCode = code;
          return originalStatus(code);
        };

        // Intercept res.json to cache the response
        const self = this;
        res.json = function(data: any) {
          // Only cache successful responses
          if (statusCode >= 200 && statusCode < 300) {
            const responseToCache = {
              data,
              statusCode,
              headers: {
                'Content-Type': res.get('Content-Type'),
                'Last-Modified': new Date().toISOString()
              },
              timestamp: Date.now()
            };

            // Cache the response asynchronously
            setImmediate(async () => {
              const ttl = options.ttl || 300; // Default 5 minutes
              await self.cacheService.set(cacheKey, responseToCache, ttl);
              console.log(`[CacheMiddleware] Cached response: ${cacheKey} (TTL: ${ttl}s)`);
            });
          }

          // Set cache headers
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-Key', cacheKey);

          return originalJson(data);
        };

        next();

      } catch (error) {
        console.error('[CacheMiddleware] Cache middleware error:', error);
        // Continue without caching on error
        next();
      }
    };
  }

  // Invalidate cache by pattern or tags
  public async invalidate(pattern: string): Promise<number> {
    return this.cacheService.clearPattern(pattern);
  }

  // Invalidate user-specific caches
  public async invalidateUser(userId: string): Promise<void> {
    await this.cacheService.invalidateUserCache(userId);
  }

  // Cache warming middleware
  public warmUp() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Warm up cache for authenticated user
      if ((req as any).userId) {
        setImmediate(async () => {
          await this.cacheService.warmUp((req as any).userId);
        });
      }
      next();
    };
  }

  // Pre-cache frequently accessed data
  public async preCacheUserData(userId: string): Promise<void> {
    try {
      console.log(`[CacheMiddleware] Pre-caching data for user: ${userId}`);

      // This would typically fetch and cache user's most accessed data
      // For now, we'll just warm up the cache
      await this.cacheService.warmUp(userId);

    } catch (error) {
      console.error('[CacheMiddleware] Pre-cache error:', error);
    }
  }

  // Analytics endpoint cache
  public analytics() {
    return (req: Request, res: Response) => {
      const analytics = this.cacheService.getAnalytics();
      res.json({
        cache: analytics,
        middleware: {
          routesCached: Object.keys(DEFAULT_CACHE_CONFIGS).length,
          timestamp: new Date().toISOString()
        }
      });
    };
  }

  // Health check for cache system
  public healthCheck() {
    return async (req: Request, res: Response) => {
      const health = await this.cacheService.healthCheck();
      res.json(health);
    };
  }
}

// Convenience function to create cache middleware
export function createCacheMiddleware(cacheService: CacheService): CacheMiddleware {
  return new CacheMiddleware(cacheService);
}

// Cache invalidation helpers
export async function invalidateUserCache(cacheService: CacheService, userId: string): Promise<void> {
  await cacheService.invalidateUserCache(userId);
  console.log(`[CacheMiddleware] Invalidated cache for user: ${userId}`);
}

export async function invalidateRouteCache(
  cacheService: CacheService,
  route: string,
  userId?: string
): Promise<number> {
  let pattern = `api:*:${route}*`;
  if (userId) {
    pattern = `api:*:${route}*:user:${userId}*`;
  }

  const deletedCount = await cacheService.clearPattern(pattern);
  console.log(`[CacheMiddleware] Invalidated ${deletedCount} cache entries for route: ${route}`);

  return deletedCount;
}

export default CacheMiddleware;