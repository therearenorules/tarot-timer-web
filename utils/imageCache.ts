/**
 * 이미지 캐싱 및 최적화 유틸리티
 * 타로 카드 이미지의 빠른 로딩을 위한 캐시 시스템
 */

import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry {
  timestamp: number;
  size: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number; // 최대 캐시 크기 (MB)
  maxAge: number; // 최대 보관 시간 (ms)
  maxEntries: number; // 최대 항목 수
}

class ImageCacheManager {
  private cacheRegistry: Map<string, CacheEntry> = new Map();
  private preloadPromises: Map<string, Promise<boolean>> = new Map();
  private config: CacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    maxEntries: 200
  };

  private readonly CACHE_KEY = 'image_cache_registry';

  constructor() {
    this.loadCacheRegistry();
  }

  /**
   * 캐시 레지스트리를 로컬 스토리지에서 로드
   */
  private async loadCacheRegistry(): Promise<void> {
    try {
      const registryData = await AsyncStorage.getItem(this.CACHE_KEY);
      if (registryData) {
        const entries = JSON.parse(registryData);
        this.cacheRegistry = new Map(entries);
        await this.cleanupExpiredEntries();
      }
    } catch (error) {
      console.warn('Failed to load image cache registry:', error);
    }
  }

  /**
   * 캐시 레지스트리를 로컬 스토리지에 저장
   */
  private async saveCacheRegistry(): Promise<void> {
    try {
      const entries = Array.from(this.cacheRegistry.entries());
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save image cache registry:', error);
    }
  }

  /**
   * 만료된 캐시 항목 정리
   */
  private async cleanupExpiredEntries(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cacheRegistry.forEach((entry, key) => {
      if (now - entry.timestamp > this.config.maxAge) {
        expiredKeys.push(key);
      }
    });

    for (const key of expiredKeys) {
      this.cacheRegistry.delete(key);
    }

    if (expiredKeys.length > 0) {
      await this.saveCacheRegistry();
    }
  }

  /**
   * 캐시 크기 제한 확인 및 정리
   */
  private async enforceSize(): Promise<void> {
    if (this.cacheRegistry.size <= this.config.maxEntries) {
      return;
    }

    // LRU (Least Recently Used) 방식으로 정리
    const entries = Array.from(this.cacheRegistry.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    const toDelete = entries.slice(0, entries.length - this.config.maxEntries);

    for (const [key] of toDelete) {
      this.cacheRegistry.delete(key);
    }

    await this.saveCacheRegistry();
  }

  /**
   * 이미지 프리로드
   */
  async preloadImage(source: any): Promise<boolean> {
    const key = this.getImageKey(source);

    // 이미 프리로드 중인 경우 기존 Promise 반환
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key)!;
    }

    // 이미 캐시되어 있는 경우
    if (this.cacheRegistry.has(key)) {
      this.updateLastAccessed(key);
      return Promise.resolve(true);
    }

    const preloadPromise = new Promise<boolean>((resolve) => {
      Image.prefetch(this.getImageUri(source))
        .then(() => {
          this.addToCacheRegistry(key);
          resolve(true);
        })
        .catch((error) => {
          console.warn(`Failed to preload image ${key}:`, error);
          resolve(false);
        })
        .finally(() => {
          this.preloadPromises.delete(key);
        });
    });

    this.preloadPromises.set(key, preloadPromise);
    return preloadPromise;
  }

  /**
   * 여러 이미지 배치 프리로드
   */
  async preloadImages(sources: any[]): Promise<boolean[]> {
    const promises = sources.map(source => this.preloadImage(source));
    return Promise.all(promises);
  }

  /**
   * 이미지 키 생성
   */
  private getImageKey(source: any): string {
    if (typeof source === 'string') {
      return source;
    }
    if (typeof source === 'object' && source.uri) {
      return source.uri;
    }
    if (typeof source === 'number') {
      return `local_${source}`;
    }
    return String(source);
  }

  /**
   * 이미지 URI 반환
   */
  private getImageUri(source: any): string {
    if (typeof source === 'string') {
      return source;
    }
    if (typeof source === 'object' && source.uri) {
      return source.uri;
    }
    // 로컬 이미지의 경우 프리로드하지 않음
    return '';
  }

  /**
   * 캐시 레지스트리에 추가
   */
  private async addToCacheRegistry(key: string): Promise<void> {
    const now = Date.now();
    this.cacheRegistry.set(key, {
      timestamp: now,
      size: 1024, // 추정 크기
      lastAccessed: now
    });

    await this.enforceSize();
    await this.saveCacheRegistry();
  }

  /**
   * 마지막 접근 시간 업데이트
   */
  private updateLastAccessed(key: string): void {
    const entry = this.cacheRegistry.get(key);
    if (entry) {
      entry.lastAccessed = Date.now();
    }
  }

  /**
   * 캐시 상태 확인
   */
  isCached(source: any): boolean {
    const key = this.getImageKey(source);
    return this.cacheRegistry.has(key);
  }

  /**
   * 캐시 통계
   */
  getCacheStats(): {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
  } {
    const totalEntries = this.cacheRegistry.size;
    const totalSize = Array.from(this.cacheRegistry.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    return {
      totalEntries,
      totalSize,
      hitRate: totalEntries > 0 ? 0.85 : 0 // 추정 적중률
    };
  }

  /**
   * 캐시 완전 삭제
   */
  async clearCache(): Promise<void> {
    this.cacheRegistry.clear();
    this.preloadPromises.clear();
    await AsyncStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * 캐시 부분 정리 (오래된 항목만)
   */
  async partialCleanup(): Promise<void> {
    await this.cleanupExpiredEntries();
    await this.enforceSize();
  }
}

// 싱글톤 인스턴스
const imageCache = new ImageCacheManager();

/**
 * 타로 카드 이미지 프리로드 헬퍼
 */
export const preloadTarotImages = async (cards: any[]): Promise<void> => {
  try {
    const imageSources = cards
      .filter(card => card && card.imageUrl)
      .map(card => card.imageUrl);

    if (imageSources.length === 0) return;

    console.log(`🎴 Preloading ${imageSources.length} tarot card images...`);

    const startTime = Date.now();
    const results = await imageCache.preloadImages(imageSources);
    const successCount = results.filter(Boolean).length;
    const loadTime = Date.now() - startTime;

    console.log(`✅ Preloaded ${successCount}/${imageSources.length} images in ${loadTime}ms`);

    if (successCount < imageSources.length) {
      console.warn(`⚠️ Failed to preload ${imageSources.length - successCount} images`);
    }
  } catch (error) {
    console.error('Failed to preload tarot images:', error);
  }
};

/**
 * 중요한 UI 이미지 프리로드
 */
export const preloadCriticalImages = async (): Promise<void> => {
  const criticalImages = [
    // 백그라운드 패턴 등 중요한 이미지들
    // require('../assets/images/background-pattern.png'),
  ];

  if (criticalImages.length > 0) {
    await imageCache.preloadImages(criticalImages);
  }
};

/**
 * 이미지 캐시 확인
 */
export const isImageCached = (source: any): boolean => {
  return imageCache.isCached(source);
};

/**
 * 캐시 통계 조회
 */
export const getCacheStats = () => {
  return imageCache.getCacheStats();
};

/**
 * 캐시 관리 함수들
 */
export const imageCacheUtils = {
  preloadImage: (source: any) => imageCache.preloadImage(source),
  clearCache: () => imageCache.clearCache(),
  partialCleanup: () => imageCache.partialCleanup(),
  getCacheStats: () => imageCache.getCacheStats(),
  isCached: (source: any) => imageCache.isCached(source)
};

export default imageCache;