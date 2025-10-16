/**
 * 통합 광고 관리 시스템
 * react-native-google-mobile-ads 기반
 * AdMob 광고 로딩, 표시, 수익 추적 및 프리미엄 상태 연동
 */

import { Platform } from 'react-native';
import mobileAds, {
  BannerAd,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import {
  AD_UNITS,
  AD_CONFIG,
  AD_TIMEOUTS,
  AD_EVENTS,
  AD_PLACEMENTS
} from './adConfig';
import LocalStorageManager from './localStorage';

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

export class AdManager {
  private static initialized = false;
  private static isPremiumUser = false;

  // 광고 인스턴스
  private static interstitialAd: InterstitialAd | null = null;
  private static rewardedAd: RewardedAd | null = null;

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
      if (Platform.OS === 'web') {
        console.log('🌐 웹 환경: 광고 시스템 시뮬레이션 모드');
        this.initialized = true;
        return true;
      }

      console.log('📱 AdManager 초기화 시작...');

      // Google Mobile Ads SDK 초기화
      await mobileAds().initialize();
      console.log('✅ Google Mobile Ads SDK 초기화 완료');

      // 프리미엄 상태 확인
      await this.checkPremiumStatus();

      // 프리미엄 사용자는 광고 비활성화
      if (this.isPremiumUser) {
        console.log('💎 프리미엄 사용자: 광고 시스템 비활성화');
        this.initialized = true;
        return true;
      }

      // 일일 제한 데이터 로드
      await this.loadDailyLimits();

      // 전면 광고 초기화
      this.interstitialAd = InterstitialAd.createForAdRequest(
        __DEV__ ? TestIds.INTERSTITIAL : AD_UNITS.interstitial,
        {
          requestNonPersonalizedAdsOnly: false,
        }
      );

      // 보상형 광고 초기화
      this.rewardedAd = RewardedAd.createForAdRequest(
        __DEV__ ? TestIds.REWARDED : AD_UNITS.rewarded,
        {
          requestNonPersonalizedAdsOnly: false,
        }
      );

      // 리스너 설정
      this.setupInterstitialListeners();
      this.setupRewardedListeners();

      // 광고 사전 로딩
      this.preloadInterstitial();
      this.preloadRewarded();

      this.initialized = true;
      console.log('✅ AdManager 초기화 완료');
      return true;

    } catch (error) {
      console.error('❌ AdManager 초기화 오류:', error);
      return false;
    }
  }

  /**
   * 전면 광고 리스너 설정
   */
  private static setupInterstitialListeners(): void {
    if (!this.interstitialAd) return;

    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      this.adStates.interstitial.isLoaded = true;
      this.adStates.interstitial.isLoading = false;
      this.emitAdEvent(AD_EVENTS.INTERSTITIAL_LOADED);
      console.log('✅ 전면 광고 로드 완료');
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      this.adStates.interstitial.isLoaded = false;
      this.adStates.interstitial.isLoading = false;
      this.adStates.interstitial.errorCount++;
      this.emitAdEvent(AD_EVENTS.INTERSTITIAL_FAILED);
      console.error('❌ 전면 광고 로드 실패:', error);
    });

    this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
      this.adStates.interstitial.lastShown = Date.now();
      this.dailyLimits.interstitial_count++;
      this.emitAdEvent(AD_EVENTS.INTERSTITIAL_SHOWN);
      console.log('📱 전면 광고 표시됨');
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      this.adStates.interstitial.isLoaded = false;
      this.emitAdEvent(AD_EVENTS.INTERSTITIAL_DISMISSED);
      this.preloadInterstitial(); // 자동 재로딩
      console.log('✅ 전면 광고 닫힘');
    });
  }

  /**
   * 보상형 광고 리스너 설정
   */
  private static setupRewardedListeners(): void {
    if (!this.rewardedAd) return;

    this.rewardedAd.addAdEventListener(AdEventType.LOADED, () => {
      this.adStates.rewarded.isLoaded = true;
      this.adStates.rewarded.isLoading = false;
      this.emitAdEvent(AD_EVENTS.REWARDED_LOADED);
      console.log('✅ 보상형 광고 로드 완료');
    });

    this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      this.adStates.rewarded.isLoaded = false;
      this.adStates.rewarded.isLoading = false;
      this.adStates.rewarded.errorCount++;
      this.emitAdEvent(AD_EVENTS.REWARDED_FAILED);
      console.error('❌ 보상형 광고 로드 실패:', error);
    });

    this.rewardedAd.addAdEventListener(AdEventType.OPENED, () => {
      this.adStates.rewarded.lastShown = Date.now();
      this.dailyLimits.rewarded_count++;
      this.emitAdEvent(AD_EVENTS.REWARDED_SHOWN);
      console.log('📱 보상형 광고 표시됨');
    });

    this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      this.adStates.rewarded.isLoaded = false;
      this.emitAdEvent(AD_EVENTS.REWARDED_DISMISSED);
      this.preloadRewarded(); // 자동 재로딩
      console.log('✅ 보상형 광고 닫힘');
    });

    // 보상 획득 이벤트
    this.rewardedAd.addAdEventsListener(AdEventType.EARNED_REWARD, (reward) => {
      console.log('🎁 보상 획득:', reward);
      this.emitAdEvent(AD_EVENTS.REWARDED_EARNED, reward);
    });
  }

  /**
   * 프리미엄 상태 확인
   */
  private static async checkPremiumStatus(): Promise<void> {
    try {
      const premiumStatus = await LocalStorageManager.getPremiumStatus();
      this.isPremiumUser = premiumStatus.is_premium && premiumStatus.ad_free;
      console.log('🔍 프리미엄 상태:', this.isPremiumUser ? '활성' : '비활성');
    } catch (error) {
      console.error('❌ 프리미엄 상태 확인 오류:', error);
      this.isPremiumUser = false;
    }
  }

  /**
   * 일일 제한 데이터 로드
   */
  private static async loadDailyLimits(): Promise<void> {
    try {
      const today = new Date().toDateString();
      const saved = await LocalStorageManager.getItem<DailyAdLimits>('daily_ad_limits');

      if (saved && saved.date === today) {
        this.dailyLimits = saved;
      } else {
        // 새로운 날이면 초기화
        this.dailyLimits = {
          date: today,
          interstitial_count: 0,
          rewarded_count: 0,
          banner_impressions: 0
        };
      }
    } catch (error) {
      console.error('❌ 일일 제한 로드 오류:', error);
    }
  }

  /**
   * 일일 제한 데이터 저장
   */
  private static async saveDailyLimits(): Promise<void> {
    try {
      await LocalStorageManager.setItem('daily_ad_limits', this.dailyLimits);
    } catch (error) {
      console.error('❌ 일일 제한 저장 오류:', error);
    }
  }

  /**
   * 전면 광고 사전 로딩
   */
  static async preloadInterstitial(): Promise<void> {
    if (!this.initialized || this.isPremiumUser || Platform.OS === 'web') return;

    try {
      if (this.interstitialAd && !this.adStates.interstitial.isLoaded && !this.adStates.interstitial.isLoading) {
        this.adStates.interstitial.isLoading = true;
        await this.interstitialAd.load();
        console.log('📱 전면 광고 로딩 시작');
      }
    } catch (error) {
      console.error('❌ 전면 광고 로딩 오류:', error);
      this.adStates.interstitial.isLoading = false;
      this.adStates.interstitial.errorCount++;
    }
  }

  /**
   * 보상형 광고 사전 로딩
   */
  static async preloadRewarded(): Promise<void> {
    if (!this.initialized || this.isPremiumUser || Platform.OS === 'web') return;

    try {
      if (this.rewardedAd && !this.adStates.rewarded.isLoaded && !this.adStates.rewarded.isLoading) {
        this.adStates.rewarded.isLoading = true;
        await this.rewardedAd.load();
        console.log('🎁 보상형 광고 로딩 시작');
      }
    } catch (error) {
      console.error('❌ 보상형 광고 로딩 오류:', error);
      this.adStates.rewarded.isLoading = false;
      this.adStates.rewarded.errorCount++;
    }
  }

  /**
   * 전면 광고 표시
   */
  static async showInterstitial(placement: keyof typeof AD_PLACEMENTS): Promise<AdShowResult> {
    try {
      // 프리미엄 사용자는 광고 표시 안 함
      if (this.isPremiumUser) {
        return { success: false, error: 'Premium user - ads disabled' };
      }

      // 웹 환경에서는 시뮬레이션
      if (Platform.OS === 'web') {
        console.log('🌐 웹 환경: 전면 광고 시뮬레이션');
        return { success: true, revenue: 0.05 };
      }

      // 일일 제한 확인
      if (this.dailyLimits.interstitial_count >= AD_CONFIG.conditions.max_daily_ads.interstitial) {
        return { success: false, error: 'Daily limit reached' };
      }

      // 쿨다운 확인
      const timeSinceLastAd = Date.now() - this.adStates.interstitial.lastShown;
      if (timeSinceLastAd < AD_CONFIG.intervals.interstitial_cooldown) {
        return { success: false, error: 'Cooldown active' };
      }

      // 광고 로드 상태 확인
      if (!this.adStates.interstitial.isLoaded) {
        await this.preloadInterstitial();
        return { success: false, error: 'Ad not ready' };
      }

      // 배치별 광고 표시 권한 확인
      const placementConfig = AD_PLACEMENTS[placement];
      if (!placementConfig || !placementConfig.interstitial) {
        return { success: false, error: 'Placement not allowed' };
      }

      // 광고 표시
      if (this.interstitialAd) {
        await this.interstitialAd.show();

        // 수익 추정 (실제로는 AdMob에서 제공)
        const estimatedRevenue = 0.05; // $0.05 예상
        this.adStates.interstitial.revenue += estimatedRevenue;

        await this.saveDailyLimits();

        return {
          success: true,
          revenue: estimatedRevenue
        };
      }

      return { success: false, error: 'AdMob not available' };

    } catch (error) {
      console.error('❌ 전면 광고 표시 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '광고 표시 실패'
      };
    }
  }

  /**
   * 보상형 광고 표시
   */
  static async showRewarded(): Promise<AdShowResult> {
    try {
      // 프리미엄 사용자도 보상형 광고는 이용 가능 (선택적)
      if (this.isPremiumUser) {
        console.log('💎 프리미엄 사용자: 보상형 광고 선택적 이용');
      }

      // 웹 환경에서는 시뮬레이션
      if (Platform.OS === 'web') {
        console.log('🌐 웹 환경: 보상형 광고 시뮬레이션');
        return { success: true, revenue: 0.15, rewardEarned: true };
      }

      // 일일 제한 확인
      if (this.dailyLimits.rewarded_count >= AD_CONFIG.conditions.max_daily_ads.rewarded) {
        return { success: false, error: 'Daily limit reached' };
      }

      // 쿨다운 확인
      const timeSinceLastAd = Date.now() - this.adStates.rewarded.lastShown;
      if (timeSinceLastAd < AD_CONFIG.intervals.rewarded_cooldown) {
        return { success: false, error: 'Cooldown active' };
      }

      // 광고 로드 상태 확인
      if (!this.adStates.rewarded.isLoaded) {
        await this.preloadRewarded();
        return { success: false, error: 'Ad not ready' };
      }

      // 광고 표시
      if (this.rewardedAd) {
        await this.rewardedAd.show();

        // 수익 추정 (실제로는 AdMob에서 제공)
        const estimatedRevenue = 0.15; // $0.15 예상
        this.adStates.rewarded.revenue += estimatedRevenue;

        await this.saveDailyLimits();

        return {
          success: true,
          revenue: estimatedRevenue,
          rewardEarned: true
        };
      }

      return { success: false, error: 'AdMob not available' };

    } catch (error) {
      console.error('❌ 보상형 광고 표시 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '광고 표시 실패'
      };
    }
  }

  /**
   * 배너 광고 표시 가능 여부 확인
   */
  static shouldShowBanner(placement: keyof typeof AD_PLACEMENTS): boolean {
    // 프리미엄 사용자는 배너 광고 표시 안 함
    if (this.isPremiumUser) return false;

    // 배치별 설정 확인
    const placementConfig = AD_PLACEMENTS[placement];
    return placementConfig ? placementConfig.banner : false;
  }

  /**
   * 광고 상태 조회
   */
  static getAdStates() {
    return {
      ...this.adStates,
      isPremium: this.isPremiumUser,
      dailyLimits: this.dailyLimits,
      initialized: this.initialized
    };
  }

  /**
   * 프리미엄 상태 업데이트
   */
  static async updatePremiumStatus(): Promise<void> {
    await this.checkPremiumStatus();
    console.log('🔄 프리미엄 상태 업데이트:', this.isPremiumUser ? '활성' : '비활성');
  }

  /**
   * 광고 이벤트 발생
   */
  private static emitAdEvent(eventName: string, data?: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
  }

  /**
   * 배너 광고 단위 ID 조회
   */
  static getBannerAdUnitId(): string {
    return __DEV__ ? TestIds.BANNER : AD_UNITS.banner;
  }

  /**
   * 배너 광고 이벤트 추적
   */
  static trackAdEvent(eventName: string, placement: string, data?: any): void {
    console.log(`📊 광고 이벤트: ${eventName} - ${placement}`, data);

    // 이벤트 발생
    this.emitAdEvent(eventName, { placement, ...data });

    // 배너 노출 횟수 추적
    if (eventName === AD_EVENTS.BANNER_LOADED) {
      this.dailyLimits.banner_impressions++;
      this.saveDailyLimits();
    }
  }

  /**
   * 광고 수익 추적
   */
  static trackRevenue(adType: 'banner' | 'interstitial' | 'rewarded', placement: string, amount: number = 0.01): void {
    this.adStates[adType].revenue += amount;

    console.log(`💰 수익 추적: ${adType} - ${placement} - $${amount}`);

    // 수익 이벤트 발생
    this.emitAdEvent('ad_revenue_earned', {
      adType,
      placement,
      amount,
      totalRevenue: this.adStates[adType].revenue
    });
  }

  /**
   * 광고 수익 통계 조회
   */
  static getRevenueStats() {
    const totalRevenue =
      this.adStates.banner.revenue +
      this.adStates.interstitial.revenue +
      this.adStates.rewarded.revenue;

    return {
      total: totalRevenue,
      banner: this.adStates.banner.revenue,
      interstitial: this.adStates.interstitial.revenue,
      rewarded: this.adStates.rewarded.revenue,
      dailyImpressions: {
        interstitial: this.dailyLimits.interstitial_count,
        rewarded: this.dailyLimits.rewarded_count,
        banner: this.dailyLimits.banner_impressions
      }
    };
  }

  /**
   * 배너 광고 설정 조회
   */
  static getBannerConfig() {
    return {
      adUnitID: this.getBannerAdUnitId(),
      testDeviceID: __DEV__ ? 'EMULATOR' : null,
      refreshInterval: AD_CONFIG.intervals.banner_refresh
    };
  }

  /**
   * 액션 카운터 증가 및 전면광고 표시 조건 확인
   */
  static async incrementActionCounter(): Promise<void> {
    try {
      this.actionCounter++;
      console.log(`📊 액션 카운터: ${this.actionCounter}/${this.ACTION_THRESHOLD}`);

      // 임계값에 도달했을 때 전면광고 표시 시도
      if (this.actionCounter >= this.ACTION_THRESHOLD) {
        this.actionCounter = 0; // 카운터 초기화

        // 전면광고 표시 시도
        const result = await this.showInterstitial('card_action');
        if (result.success) {
          console.log('✅ 전면광고 표시 성공');
        } else {
          console.log('⚠️ 전면광고 표시 실패:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ 액션 카운터 처리 오류:', error);
      // 오류가 발생해도 액션 자체는 실패시키지 않음
    }
  }

  /**
   * 액션 카운터 상태 조회
   */
  static getActionCounter(): { current: number; threshold: number; remaining: number } {
    return {
      current: this.actionCounter,
      threshold: this.ACTION_THRESHOLD,
      remaining: this.ACTION_THRESHOLD - this.actionCounter
    };
  }

  /**
   * AdManager 정리
   */
  static dispose(): void {
    this.interstitialAd = null;
    this.rewardedAd = null;
    this.initialized = false;
    console.log('🧹 AdManager 정리 완료');
  }
}

export default AdManager;
