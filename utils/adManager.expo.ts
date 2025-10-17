/**
 * Expo Go 전용 AdManager Stub
 * 네이티브 모듈 없이도 앱이 실행될 수 있도록 시뮬레이션
 */

import { Platform } from 'react-native';

interface AdShowResult {
  success: boolean;
  revenue?: number;
  error?: string;
  rewardEarned?: boolean;
}

export class AdManager {
  private static initialized = false;
  private static isPremium = false;

  static async initialize(): Promise<boolean> {
    console.log('📱 [Expo Go] AdManager 시뮬레이션 모드');
    this.initialized = true;
    return true;
  }

  static isInitialized(): boolean {
    return this.initialized;
  }

  static setPremiumStatus(isPremium: boolean): void {
    this.isPremium = isPremium;
    console.log(`💎 [Expo Go] 프리미엄 상태 변경: ${isPremium}`);
  }

  static getPremiumStatus(): boolean {
    return this.isPremium;
  }

  static async showInterstitial(placement: string): Promise<AdShowResult> {
    console.log(`📺 [Expo Go] 전면 광고 시뮬레이션: ${placement}`);
    return { success: true, revenue: 0 };
  }

  static async showRewarded(placement: string): Promise<AdShowResult> {
    console.log(`🎁 [Expo Go] 리워드 광고 시뮬레이션: ${placement}`);
    return { success: true, revenue: 0, rewardEarned: true };
  }

  static async preloadInterstitial(): Promise<boolean> {
    console.log('🔄 [Expo Go] 전면 광고 프리로드 시뮬레이션');
    return true;
  }

  static async preloadRewarded(): Promise<boolean> {
    console.log('🔄 [Expo Go] 리워드 광고 프리로드 시뮬레이션');
    return true;
  }

  static dispose(): void {
    console.log('🧹 [Expo Go] AdManager 정리 시뮬레이션');
    this.initialized = false;
  }

  static getTodayRevenue(): number {
    return 0;
  }

  static getTodayImpressions(): number {
    return 0;
  }

  static getInterstitialCount(): number {
    return 0;
  }

  static getRewardedCount(): number {
    return 0;
  }
}

export default AdManager;
