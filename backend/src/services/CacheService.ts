// CacheService.ts - Advanced caching system with Redis and memory fallback
// Provides intelligent cache management with TTL, compression, and analytics

import Redis from 'ioredis';
import NodeCache from 'node-cache';
import { createHash } from 'crypto';

// Cache configuration interface
interface CacheConfig {
  defaultTTL: number;
  maxMemorySize: number;
  compressionThreshold: number;
  enableAnalytics: boolean;
  redisUrl?: string;
  fallbackToMemory: boolean;
}

// Cache entry metadata
interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
  compressed: boolean;
  accessCount: number;
  lastAccessed: number;
}

// Cache analytics data
interface CacheAnalytics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalRequests: number;
  hitRate: number;
  avgResponseTime: number;
  memoryUsage: number;
  redisConnected: boolean;
}

// Cache key patterns
enum CacheKeys {
  USER_SESSION = 'user:session:',
  DAILY_SESSIONS = 'daily:sessions:',
  SPREAD_READINGS = 'spread:readings:',
  USER_PROFILE = 'user:profile:',
  API_RESPONSE = 'api:response:',
  COMPUTED_STATS = 'stats:computed:',
  TAROT_DECK = 'tarot:deck:',
  REALTIME_STATE = 'realtime:state:'
}

export class CacheService {
  private redis: Redis | null = null;
  private memoryCache: NodeCache;
  private config: CacheConfig;
  private analytics: CacheAnalytics;
  private isRedisConnected: boolean = false;

  constructor(config: Partial<CacheConfig> = {}) {
    // Default configuration
    this.config = {
      defaultTTL: 300, // 5 minutes
      maxMemorySize: 100 * 1024 * 1024, // 100MB
      compressionThreshold: 1024, // 1KB
      enableAnalytics: true,
      fallbackToMemory: true,
      ...config
    };

    // Initialize memory cache as fallback
    this.memoryCache = new NodeCache({
      stdTTL: this.config.defaultTTL,
      maxKeys: 10000,
      useClones: false,
      deleteOnExpire: true
    });

    // Initialize analytics
    this.analytics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalRequests: 0,
      hitRate: 0,
      avgResponseTime: 0,
      memoryUsage: 0,
      redisConnected: false
    };

    // Initialize Redis connection
    this.initializeRedis();
    this.setupEventListeners();

    console.log('[CacheService] Advanced caching system initialized');
  }

  private async initializeRedis(): Promise<void> {
    if (!this.config.redisUrl) {
      console.log('[CacheService] Redis URL not provided, using memory cache only');
      return;
    }

    try {
      this.redis = new Redis(this.config.redisUrl, {
        maxRetriesPerRequest: 0, // Disable retries to prevent spam
        lazyConnect: true,
        connectTimeout: 5000,
        enableOfflineQueue: false,
        reconnectOnError: () => false // Disable auto-reconnect
      });

      await this.redis.connect();
      this.isRedisConnected = true;
      this.analytics.redisConnected = true;

      console.log('[CacheService] Redis connection established');

    } catch (error) {
      console.log('[CacheService] Redis not available, using memory cache only');
      this.redis = null;
      this.isRedisConnected = false;
      this.analytics.redisConnected = false;
    }
  }

  private setupEventListeners(): void {
    // Redis event listeners
    if (this.redis) {
      this.redis.on('connect', () => {
        console.log('[CacheService] Redis connected');
        this.isRedisConnected = true;
        this.analytics.redisConnected = true;
      });

      this.redis.on('error', (error) => {
        console.error('[CacheService] Redis error:', error);
        this.isRedisConnected = false;
        this.analytics.redisConnected = false;
      });

      this.redis.on('close', () => {
        console.warn('[CacheService] Redis connection closed');
        this.isRedisConnected = false;
        this.analytics.redisConnected = false;
      });
    }

    // Memory cache event listeners
    this.memoryCache.on('set', (key, value) => {
      this.analytics.sets++;
    });

    this.memoryCache.on('del', (key, value) => {
      this.analytics.deletes++;
    });

    this.memoryCache.on('expired', (key, value) => {
      this.analytics.evictions++;
    });
  }

  // Generate cache key with pattern
  private generateKey(pattern: CacheKeys, identifier: string, suffix?: string): string {
    const key = pattern + identifier + (suffix ? ':' + suffix : '');
    return key;
  }

  // Create hash of complex objects for caching
  private createHash(data: any): string {
    return createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  // Compress data if it exceeds threshold
  private compressData(data: string): { data: string; compressed: boolean } {
    if (data.length > this.config.compressionThreshold) {
      // Simple base64 encoding for demo (replace with actual compression in production)
      return {
        data: Buffer.from(data).toString('base64'),
        compressed: true
      };
    }
    return { data, compressed: false };
  }

  // Decompress data
  private decompressData(data: string, compressed: boolean): string {
    if (compressed) {
      return Buffer.from(data, 'base64').toString();
    }
    return data;
  }

  // Get value from cache
  public async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    this.analytics.totalRequests++;

    try {
      let result: T | null = null;

      // Try Redis first if available
      if (this.isRedisConnected && this.redis) {
        try {
          const redisValue = await this.redis.get(key);
          if (redisValue) {
            const entry: CacheEntry = JSON.parse(redisValue);

            // Update access statistics
            entry.accessCount++;
            entry.lastAccessed = Date.now();

            // Decompress if needed
            const decompressedValue = this.decompressData(
              typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value),
              entry.compressed
            );

            result = JSON.parse(decompressedValue);

            // Update entry in Redis
            await this.redis.set(key, JSON.stringify(entry), 'EX', entry.ttl);

            this.analytics.hits++;
            console.log(`[CacheService] Redis HIT: ${key}`);
          }
        } catch (redisError) {
          console.warn('[CacheService] Redis GET error, falling back to memory:', redisError);
        }
      }

      // Fallback to memory cache
      if (result === null && this.config.fallbackToMemory) {
        const memoryValue = this.memoryCache.get<T>(key);
        if (memoryValue !== undefined) {
          result = memoryValue;
          this.analytics.hits++;
          console.log(`[CacheService] Memory HIT: ${key}`);
        }
      }

      // Record miss if no result found
      if (result === null) {
        this.analytics.misses++;
        console.log(`[CacheService] MISS: ${key}`);
      }

      // Update analytics
      const responseTime = Date.now() - startTime;
      this.analytics.avgResponseTime =
        (this.analytics.avgResponseTime + responseTime) / 2;
      this.analytics.hitRate =
        this.analytics.hits / (this.analytics.hits + this.analytics.misses);

      return result;

    } catch (error) {
      console.error('[CacheService] GET error:', error);
      this.analytics.misses++;
      return null;
    }
  }

  // Set value in cache
  public async set<T>(
    key: string,
    value: T,
    ttl: number = this.config.defaultTTL
  ): Promise<boolean> {
    this.analytics.sets++;

    try {
      const serializedValue = JSON.stringify(value);
      const { data: compressedData, compressed } = this.compressData(serializedValue);

      const entry: CacheEntry = {
        value: compressed ? compressedData : value,
        timestamp: Date.now(),
        ttl,
        compressed,
        accessCount: 0,
        lastAccessed: Date.now()
      };

      // Set in Redis if available
      if (this.isRedisConnected && this.redis) {
        try {
          await this.redis.set(key, JSON.stringify(entry), 'EX', ttl);
          console.log(`[CacheService] Redis SET: ${key} (TTL: ${ttl}s)`);
        } catch (redisError) {
          console.warn('[CacheService] Redis SET error:', redisError);
        }
      }

      // Set in memory cache as fallback
      if (this.config.fallbackToMemory) {
        this.memoryCache.set(key, value, ttl);
        console.log(`[CacheService] Memory SET: ${key} (TTL: ${ttl}s)`);
      }

      return true;

    } catch (error) {
      console.error('[CacheService] SET error:', error);
      return false;
    }
  }

  // Delete from cache
  public async del(key: string): Promise<boolean> {
    this.analytics.deletes++;

    try {
      // Delete from Redis
      if (this.isRedisConnected && this.redis) {
        await this.redis.del(key);
      }

      // Delete from memory cache
      if (this.config.fallbackToMemory) {
        this.memoryCache.del(key);
      }

      console.log(`[CacheService] DELETED: ${key}`);
      return true;

    } catch (error) {
      console.error('[CacheService] DELETE error:', error);
      return false;
    }
  }

  // Clear cache by pattern
  public async clearPattern(pattern: string): Promise<number> {
    let deletedCount = 0;

    try {
      // Clear from Redis
      if (this.isRedisConnected && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          deletedCount += keys.length;
        }
      }

      // Clear from memory cache
      if (this.config.fallbackToMemory) {
        const memoryKeys = this.memoryCache.keys();
        const matchingKeys = memoryKeys.filter(key =>
          key.includes(pattern.replace('*', ''))
        );

        matchingKeys.forEach(key => {
          this.memoryCache.del(key);
          deletedCount++;
        });
      }

      console.log(`[CacheService] Cleared ${deletedCount} keys matching pattern: ${pattern}`);
      return deletedCount;

    } catch (error) {
      console.error('[CacheService] Clear pattern error:', error);
      return 0;
    }
  }

  // Cache-specific methods for common patterns

  // Cache user session
  public async cacheUserSession(userId: string, sessionData: any, ttl: number = 1800): Promise<boolean> {
    const key = this.generateKey(CacheKeys.USER_SESSION, userId);
    return this.set(key, sessionData, ttl);
  }

  // Get cached user session
  public async getUserSession(userId: string): Promise<any | null> {
    const key = this.generateKey(CacheKeys.USER_SESSION, userId);
    return this.get(key);
  }

  // Cache daily sessions for a user
  public async cacheDailySessions(userId: string, sessions: any[], ttl: number = 600): Promise<boolean> {
    const key = this.generateKey(CacheKeys.DAILY_SESSIONS, userId);
    return this.set(key, sessions, ttl);
  }

  // Get cached daily sessions
  public async getDailySessions(userId: string): Promise<any[] | null> {
    const key = this.generateKey(CacheKeys.DAILY_SESSIONS, userId);
    return this.get(key);
  }

  // Cache spread readings
  public async cacheSpreadReadings(userId: string, readings: any[], ttl: number = 900): Promise<boolean> {
    const key = this.generateKey(CacheKeys.SPREAD_READINGS, userId);
    return this.set(key, readings, ttl);
  }

  // Get cached spread readings
  public async getSpreadReadings(userId: string): Promise<any[] | null> {
    const key = this.generateKey(CacheKeys.SPREAD_READINGS, userId);
    return this.get(key);
  }

  // Cache API response
  public async cacheApiResponse(endpoint: string, params: any, response: any, ttl: number = 300): Promise<boolean> {
    const paramHash = this.createHash(params);
    const key = this.generateKey(CacheKeys.API_RESPONSE, endpoint, paramHash);
    return this.set(key, response, ttl);
  }

  // Get cached API response
  public async getCachedApiResponse(endpoint: string, params: any): Promise<any | null> {
    const paramHash = this.createHash(params);
    const key = this.generateKey(CacheKeys.API_RESPONSE, endpoint, paramHash);
    return this.get(key);
  }

  // Cache computed statistics
  public async cacheComputedStats(userId: string, stats: any, ttl: number = 3600): Promise<boolean> {
    const key = this.generateKey(CacheKeys.COMPUTED_STATS, userId);
    return this.set(key, stats, ttl);
  }

  // Get cached computed statistics
  public async getComputedStats(userId: string): Promise<any | null> {
    const key = this.generateKey(CacheKeys.COMPUTED_STATS, userId);
    return this.get(key);
  }

  // Invalidate user-related caches
  public async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `${CacheKeys.USER_SESSION}${userId}*`,
      `${CacheKeys.DAILY_SESSIONS}${userId}*`,
      `${CacheKeys.SPREAD_READINGS}${userId}*`,
      `${CacheKeys.USER_PROFILE}${userId}*`,
      `${CacheKeys.COMPUTED_STATS}${userId}*`,
      `${CacheKeys.REALTIME_STATE}${userId}*`
    ];

    for (const pattern of patterns) {
      await this.clearPattern(pattern);
    }

    console.log(`[CacheService] Invalidated all caches for user: ${userId}`);
  }

  // Get cache analytics
  public getAnalytics(): CacheAnalytics {
    // Update memory usage
    this.analytics.memoryUsage = process.memoryUsage().heapUsed;
    return { ...this.analytics };
  }

  // Health check
  public async healthCheck(): Promise<{
    status: string;
    redis: boolean;
    memory: boolean;
    analytics: CacheAnalytics;
  }> {
    let redisHealth = false;

    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.ping();
        redisHealth = true;
      } catch (error) {
        redisHealth = false;
      }
    }

    return {
      status: redisHealth || this.config.fallbackToMemory ? 'healthy' : 'degraded',
      redis: redisHealth,
      memory: true,
      analytics: this.getAnalytics()
    };
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    console.log('[CacheService] Shutting down cache service...');

    if (this.redis) {
      await this.redis.quit();
    }

    this.memoryCache.close();

    console.log('[CacheService] Cache service shut down successfully');
  }

  // Warm up cache with frequently accessed data
  public async warmUp(userId?: string): Promise<void> {
    console.log('[CacheService] Warming up cache...');

    // Cache tarot deck data (common across all users)
    const tarotDeckKey = this.generateKey(CacheKeys.TAROT_DECK, 'standard');
    await this.set(tarotDeckKey, this.generateTarotDeckData(), 86400); // 24 hours

    if (userId) {
      // Pre-load user-specific data
      // This would typically fetch from database and cache
      console.log(`[CacheService] Warming up cache for user: ${userId}`);
    }

    console.log('[CacheService] Cache warm-up completed');
  }

  // Generate standard tarot deck data for caching
  private generateTarotDeckData(): any {
    return {
      majorArcana: 22,
      minorArcana: 56,
      totalCards: 78,
      suits: ['cups', 'wands', 'swords', 'pentacles'],
      cached: true,
      timestamp: Date.now()
    };
  }
}

export default CacheService;