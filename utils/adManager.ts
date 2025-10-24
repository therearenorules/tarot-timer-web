/**
 * 통합 광고 관리 시스템
 * react-native-google-mobile-ads 기반
 * AdMob 광고 로딩, 표시, 수익 추적 및 프리미엄 상태 연동
 *
 * ✅ Expo Go 호환: 동적 import로 네이티브 모듈 충돌 방지
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  AD_UNITS,
  AD_CONFIG,
  AD_TIMEOUTS,
  AD_EVENTS,
  AD_PLACEMENTS
} from './adConfig';
import LocalStorageManager from './localStorage';
import { adMockEmitter } from './adMockEvents';

// 광고 상태 인터페이스
interface AdState {
  isLoaded: boolean;
  isLoading: boolean;
  lastShown: number;
  errorCount: number;
  revenue: number;
}

// 광고 표시 결과
interface AdShowResult {
  success: boolean;
  revenue?: number;
  error?: string;
  rewardEarned?: boolean;
}

// 일일 광고 제한 추적
interface DailyAdLimits {
  date: string;
  interstitial_count: number;
  rewarded_count: number;
  banner_impressions: number;
}

// 🔑 핵심: 동적으로 로드될 네이티브 모듈
let mobileAds: any = null;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let InterstitialAdEventType: any = null;
let TestIds: any = null;

// Expo Go 환경 감지
const isExpoGo = Constants.appOwnership === 'expo';
const isNativeSupported = Platform.OS !== 'web' && !isExpoGo;

// ✅ Android 최적화: 안전한 개발 환경 감지
const isDevelopment = (() => {
  // __DEV__가 정의되어 있으면 사용
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__;
  }
  // 환경 변수 체크 (Expo 빌드)
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  // Expo Constants 체크 (SDK 46+ 호환)
  if (Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_ENV === 'production') {
    return false;
  }
  // 기본값: 프로덕션으로 간주
  return false;
})();

// 네이티브 모듈 로드 함수
async function loadNativeModules(): Promise<boolean> {
  if (!isNativeSupported) {
    console.log(`📱 ${isExpoGo ? 'Expo Go' : '웹'} 환경: 광고 시스템 시뮬레이션 모드`);
    return false;
  }

  try {
    const adModule = require('react-native-google-mobile-ads');
    mobileAds = adModule.default;
    InterstitialAd = adModule.InterstitialAd;
    RewardedAd = adModule.RewardedAd;
    AdEventType = adModule.AdEventType;
    RewardedAdEventType = adModule.RewardedAdEventType || adModule.AdEventType;
    InterstitialAdEventType = adModule.InterstitialAdEventType || adModule.AdEventType;
    TestIds = adModule.TestIds;

    console.log('✅ react-native-google-mobile-ads 네이티브 모듈 로드 성공');
    return true;
  } catch (error) {
    console.warn('⚠️ react-native-google-mobile-ads 로드 실패 (시뮬레이션 모드):', error);
    return false;
  }
}

export class AdManager {
  private static initialized = false;
  private static isPremiumUser = false;
  private static nativeModulesLoaded = false;

  // 광고 인스턴스
  private static interstitialAd: any = null;
  private static rewardedAd: any = null;

  // 광고 상태 관리
  private static adStates: {
    banner: AdState;
    interstitial: AdState;
    rewarded: AdState;
  } = {
    banner: { isLoaded: false, isLoading: false, lastShown: 0, errorCount: 0, revenue: 0 },
    interstitial: { isLoaded: false, isLoading: false, lastShown: 0, errorCount: 0, revenue: 0 },
    rewarded: { isLoaded: false, isLoading: false, lastShown: 0, errorCount: 0, revenue: 0 }
  };

  // 일일 광고 제한 추적
  private static dailyLimits: DailyAdLimits = {
    date: new Date().toDateString(),
    interstitial_count: 0,
    rewarded_count: 0,
    banner_impressions: 0
  };

  // 액션 카운터 (전면광고 표시 조건)
  private static actionCounter = 0;
  private static readonly ACTION_THRESHOLD = 3; // 3번의 액션마다 전면광고

  /**
   * AdManager 초기화
   */
  static async initialize(): Promise<boolean> {
    try {
      // 웹 또는 Expo Go 환경
      if (!isNativeSupported) {
        console.log(`🌐 ${Platform.OS === 'web' ? '웹' : 'Expo Go'} 환경: 광고 시스템 시뮬레이션 모드`);
        this.initialized = true;
        return true;
      }

      console.log('📱 AdManager 초기화 시작...');

      // 네이티브 모듈 동적 로드
      this.nativeModulesLoaded = await loadNativeModules();

      if (!this.nativeModulesLoaded) {
        console.log('⚠️ 네이티브 모듈 없음, 시뮬레이션 모드로 계속');
        this.initialized = true;
        return true;
      }

      // ✅ CRITICAL FIX: 광고 SDK 안전 체크
      if (typeof mobileAds !== 'function') {
        console.log('⚠️ mobileAds 함수 사용 불가, 시뮬레이션 모드로 전환');
        this.initialized = true;
        return true;
      }

      // Google Mobile Ads SDK 초기화
      await mobileAds().initialize();
      console.log('✅ Google Mobile Ads SDK 초기화 완료');

      // ✅ CRITICAL FIX: 각 단계를 try-catch로 감싸서 한 단계 실패해도 계속 진행
      try {
        // 전면광고 프리로드
        await this.preloadInterstitial();
      } catch (error) {
        console.warn('⚠️ 전면광고 프리로드 실패, 계속 진행:', error);
      }

      try {
        // 리워드광고 프리로드
        await this.preloadRewarded();
      } catch (error) {
        console.warn('⚠️ 리워드광고 프리로드 실패, 계속 진행:', error);
      }

      try {
        // 일일 제한 복원
        await this.restoreDailyLimits();
      } catch (error) {
        console.warn('⚠️ 일일 제한 복원 실패, 계속 진행:', error);
      }

      this.initialized = true;
      console.log('✅ AdManager 초기화 완료');
      return true;
    } catch (error) {
      console.error('❌ AdManager 초기화 실패:', error);
      this.initialized = true; // 실패해도 앱은 계속 실행
      return false;
    }
  }

  /**
   * AdManager 초기화 여부 확인
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 프리미엄 사용자 상태 설정
   */
  static setPremiumStatus(isPremium: boolean): void {
    this.isPremiumUser = isPremium;
    console.log(`💎 프리미엄 상태 변경: ${isPremium ? '활성화' : '비활성화'}`);
  }

  /**
   * 프리미엄 사용자 상태 확인
   */
  static getPremiumStatus(): boolean {
    return this.isPremiumUser;
  }

  /**
   * ✅ Android 최적화: 배너광고 표시 여부 확인
   * 프리미엄 사용자는 배너광고 표시하지 않음
   */
  static shouldShowBanner(): boolean {
    if (this.isPremiumUser) {
      return false;
    }
    return true;
  }

  /**
   * ✅ Android 최적화: 배너광고 Unit ID 반환
   */
  static getBannerAdUnitId(): string {
    // 웹 또는 Expo Go 환경에서는 시뮬레이션
    if (!isNativeSupported) {
      console.log('🌐 시뮬레이션 모드: 배너광고 ID 사용 불가');
      return '';
    }

    // ✅ CRITICAL FIX: Production에서는 AD_UNITS 직접 사용
    if (isDevelopment && TestIds) {
      return TestIds.BANNER;
    }

    // Production: adConfig.ts에서 정의된 실제 광고 ID 사용
    console.log(`🎯 배너광고 ID: PRODUCTION (${AD_UNITS.BANNER})`);
    return AD_UNITS.BANNER;
  }

  /**
   * 전면광고 프리로드
   */
  static async preloadInterstitial(): Promise<boolean> {
    // 네이티브 모듈 없으면 시뮬레이션
    if (!this.nativeModulesLoaded || !InterstitialAd) {
      console.log('🔄 [시뮬레이션] 전면광고 프리로드');
      return true;
    }

    try {
      // ✅ CRITICAL FIX: Production에서는 AD_UNITS 직접 사용
      const adUnitId = (isDevelopment && TestIds) ? TestIds.INTERSTITIAL : AD_UNITS.INTERSTITIAL;
      console.log(`🎯 전면광고 ID: ${isDevelopment ? 'TEST' : 'PRODUCTION'} (${adUnitId})`);

      this.adStates.interstitial.isLoading = true;

      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('⚠️ 전면광고 로딩 타임아웃');
          this.adStates.interstitial.isLoading = false;
          resolve(false);
        }, AD_TIMEOUTS.INTERSTITIAL);

        const EventType = InterstitialAdEventType || AdEventType;

        this.interstitialAd.addAdEventListener(EventType.LOADED, () => {
          clearTimeout(timeout);
          this.adStates.interstitial.isLoaded = true;
          this.adStates.interstitial.isLoading = false;
          console.log('✅ 전면광고 로드 완료');
          resolve(true);
        });

        this.interstitialAd.addAdEventListener(EventType.ERROR, (error: any) => {
          clearTimeout(timeout);
          this.adStates.interstitial.isLoading = false;
          this.adStates.interstitial.errorCount++;
          console.error('❌ 전면광고 로드 실패:', error);
          resolve(false);
        });

        this.interstitialAd.load();
      });
    } catch (error) {
      console.error('❌ 전면광고 프리로드 오류:', error);
      this.adStates.interstitial.isLoading = false;
      return false;
    }
  }

  /**
   * 리워드광고 프리로드
   */
  static async preloadRewarded(): Promise<boolean> {
    // 네이티브 모듈 없으면 시뮬레이션
    if (!this.nativeModulesLoaded || !RewardedAd) {
      console.log('🔄 [시뮬레이션] 리워드광고 프리로드');
      return true;
    }

    try {
      // ✅ CRITICAL FIX: Production에서는 AD_UNITS 직접 사용
      const adUnitId = (isDevelopment && TestIds) ? TestIds.REWARDED : AD_UNITS.REWARDED;
      console.log(`🎯 리워드광고 ID: ${isDevelopment ? 'TEST' : 'PRODUCTION'} (${adUnitId})`);

      this.adStates.rewarded.isLoading = true;

      this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('⚠️ 리워드광고 로딩 타임아웃');
          this.adStates.rewarded.isLoading = false;
          resolve(false);
        }, AD_TIMEOUTS.REWARDED);

        const EventType = RewardedAdEventType || AdEventType;

        this.rewardedAd.addAdEventListener(EventType.LOADED, () => {
          clearTimeout(timeout);
          this.adStates.rewarded.isLoaded = true;
          this.adStates.rewarded.isLoading = false;
          console.log('✅ 리워드광고 로드 완료');
          resolve(true);
        });

        this.rewardedAd.addAdEventListener(EventType.ERROR, (error: any) => {
          clearTimeout(timeout);
          this.adStates.rewarded.isLoading = false;
          this.adStates.rewarded.errorCount++;
          console.error('❌ 리워드광고 로드 실패:', error);
          resolve(false);
        });

        this.rewardedAd.load();
      });
    } catch (error) {
      console.error('❌ 리워드광고 프리로드 오류:', error);
      this.adStates.rewarded.isLoading = false;
      return false;
    }
  }

  /**
   * 전면광고 표시
   */
  static async showInterstitial(placement: string): Promise<AdShowResult> {
    // 프리미엄 사용자는 광고 건너뛰기
    if (this.isPremiumUser) {
      console.log('💎 프리미엄 사용자: 전면광고 건너뛰기');
      return { success: true, revenue: 0 };
    }

    // 네이티브 모듈 없으면 Mock UI 시뮬레이션
    if (!this.nativeModulesLoaded) {
      console.log(`📺 [시뮬레이션] 전면광고 표시: ${placement}`);
      try {
        const result = await adMockEmitter.showMockAd({
          type: 'interstitial',
          placement,
        });
        console.log(`✅ [시뮬레이션] 전면광고 완료:`, result);
        return { success: true, revenue: 0 };
      } catch (error) {
        console.error('❌ [시뮬레이션] 전면광고 실패:', error);
        return { success: false, error: String(error) };
      }
    }

    // 일일 제한 체크
    if (this.dailyLimits.interstitial_count >= AD_CONFIG.MAX_DAILY.INTERSTITIAL) {
      console.log('⚠️ 일일 전면광고 제한 도달');
      return { success: false, error: 'daily_limit_reached' };
    }

    try {
      if (!this.adStates.interstitial.isLoaded) {
        console.log('⚠️ 전면광고가 로드되지 않음, 프리로드 시도...');
        const loaded = await this.preloadInterstitial();
        if (!loaded) {
          return { success: false, error: 'ad_not_loaded' };
        }
      }

      await this.interstitialAd.show();

      // 광고 표시 성공
      this.adStates.interstitial.isLoaded = false;
      this.adStates.interstitial.lastShown = Date.now();
      this.dailyLimits.interstitial_count++;

      await this.saveDailyLimits();

      // 다음 광고 프리로드
      this.preloadInterstitial();

      const estimatedRevenue = AD_CONFIG.CPM.INTERSTITIAL / 1000;
      this.adStates.interstitial.revenue += estimatedRevenue;

      console.log(`✅ 전면광고 표시 완료 (${placement}), 예상 수익: $${estimatedRevenue.toFixed(4)}`);

      return { success: true, revenue: estimatedRevenue };
    } catch (error) {
      console.error('❌ 전면광고 표시 실패:', error);
      this.adStates.interstitial.isLoaded = false;
      this.preloadInterstitial();
      return { success: false, error: String(error) };
    }
  }

  /**
   * 리워드광고 표시
   */
  static async showRewarded(placement: string): Promise<AdShowResult> {
    // 네이티브 모듈 없으면 Mock UI 시뮬레이션
    if (!this.nativeModulesLoaded) {
      console.log(`🎁 [시뮬레이션] 리워드광고 표시: ${placement}`);
      try {
        const result = await adMockEmitter.showMockAd({
          type: 'rewarded',
          placement,
        });
        console.log(`✅ [시뮬레이션] 리워드광고 완료:`, result);
        return {
          success: true,
          revenue: 0,
          rewardEarned: result.completed,
        };
      } catch (error) {
        console.error('❌ [시뮬레이션] 리워드광고 실패:', error);
        return { success: false, error: String(error) };
      }
    }

    // 일일 제한 체크
    if (this.dailyLimits.rewarded_count >= AD_CONFIG.MAX_DAILY.REWARDED) {
      console.log('⚠️ 일일 리워드광고 제한 도달');
      return { success: false, error: 'daily_limit_reached' };
    }

    try {
      if (!this.adStates.rewarded.isLoaded) {
        console.log('⚠️ 리워드광고가 로드되지 않음, 프리로드 시도...');
        const loaded = await this.preloadRewarded();
        if (!loaded) {
          return { success: false, error: 'ad_not_loaded' };
        }
      }

      let rewardEarned = false;
      const EventType = RewardedAdEventType || AdEventType;

      return new Promise((resolve) => {
        this.rewardedAd.addAdEventListener(EventType.EARNED_REWARD, (reward: any) => {
          rewardEarned = true;
          console.log(`🎁 리워드 획득: ${reward.amount} ${reward.type}`);
        });

        this.rewardedAd.addAdEventListener(EventType.CLOSED, async () => {
          this.adStates.rewarded.isLoaded = false;

          if (rewardEarned) {
            this.adStates.rewarded.lastShown = Date.now();
            this.dailyLimits.rewarded_count++;
            await this.saveDailyLimits();

            const estimatedRevenue = AD_CONFIG.CPM.REWARDED / 1000;
            this.adStates.rewarded.revenue += estimatedRevenue;

            console.log(`✅ 리워드광고 완료 (${placement}), 예상 수익: $${estimatedRevenue.toFixed(4)}`);
            resolve({ success: true, revenue: estimatedRevenue, rewardEarned: true });
          } else {
            console.log('⚠️ 사용자가 리워드광고를 완료하지 않음');
            resolve({ success: false, error: 'reward_not_earned' });
          }

          this.preloadRewarded();
        });

        this.rewardedAd.show();
      });
    } catch (error) {
      console.error('❌ 리워드광고 표시 실패:', error);
      this.adStates.rewarded.isLoaded = false;
      this.preloadRewarded();
      return { success: false, error: String(error) };
    }
  }

  /**
   * ✅ FIX: 일일 제한 저장 (setItem으로 수정)
   */
  private static async saveDailyLimits(): Promise<void> {
    try {
      await LocalStorageManager.setItem('daily_ad_limits', this.dailyLimits);
    } catch (error) {
      console.error('❌ 일일 제한 저장 실패:', error);
    }
  }

  /**
   * ✅ FIX: 일일 제한 복원 (getItem으로 수정)
   */
  private static async restoreDailyLimits(): Promise<void> {
    try {
      const stored = await LocalStorageManager.getItem<DailyAdLimits>('daily_ad_limits');

      if (stored) {
        const today = new Date().toDateString();

        if (stored.date === today) {
          this.dailyLimits = stored;
          console.log('📊 일일 광고 제한 복원:', this.dailyLimits);
        } else {
          console.log('🗓️ 새로운 날, 일일 제한 초기화');
          await this.saveDailyLimits();
        }
      }
    } catch (error) {
      console.error('❌ 일일 제한 복원 실패:', error);
    }
  }

  /**
   * 오늘 수익 조회
   */
  static getTodayRevenue(): number {
    return this.adStates.banner.revenue +
           this.adStates.interstitial.revenue +
           this.adStates.rewarded.revenue;
  }

  /**
   * 오늘 노출 수 조회
   */
  static getTodayImpressions(): number {
    return this.dailyLimits.banner_impressions +
           this.dailyLimits.interstitial_count +
           this.dailyLimits.rewarded_count;
  }

  /**
   * 전면광고 카운터 조회
   */
  static getInterstitialCount(): number {
    return this.dailyLimits.interstitial_count;
  }

  /**
   * 리워드광고 카운터 조회
   */
  static getRewardedCount(): number {
    return this.dailyLimits.rewarded_count;
  }

  /**
   * 액션 카운터 증가 및 전면광고 표시
   */
  static async incrementActionCounter(): Promise<void> {
    this.actionCounter++;
    console.log(`🎯 액션 카운터: ${this.actionCounter}/${this.ACTION_THRESHOLD}`);

    if (this.actionCounter >= this.ACTION_THRESHOLD) {
      console.log('📺 전면광고 표시 조건 충족');
      this.actionCounter = 0; // 카운터 리셋

      try {
        await this.showInterstitial('action_triggered');
      } catch (error) {
        console.warn('⚠️ 전면광고 표시 실패 (무시):', error);
      }
    }
  }

  /**
   * ✅ Android 최적화: 광고 이벤트 추적
   */
  static trackAdEvent(event: string, adType: string, details?: any): void {
    console.log(`📊 광고 이벤트: [${adType}] ${event}`, details || '');
    // 향후 Analytics 연동 가능
  }

  /**
   * ✅ Android 최적화: 광고 수익 추적
   */
  static trackRevenue(adType: string, revenue: number): void {
    console.log(`💰 광고 수익: [${adType}] $${revenue.toFixed(4)}`);
    // 향후 Analytics 연동 가능
  }

  /**
   * AdManager 정리
   */
  static dispose(): void {
    try {
      this.interstitialAd = null;
      this.rewardedAd = null;
      this.initialized = false;
      console.log('🧹 AdManager 정리 완료');
    } catch (error) {
      console.error('❌ AdManager 정리 오류:', error);
    }
  }
}

export default AdManager;
