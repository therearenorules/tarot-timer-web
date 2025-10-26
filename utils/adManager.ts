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
import { TarotUtils } from './tarotData';

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

// 🔑 핵심: 동적으로 로드될 네이티브 모듈 (전면광고만 사용)
let mobileAds: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;
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
    AdEventType = adModule.AdEventType;
    InterstitialAdEventType = adModule.InterstitialAdEventType || adModule.AdEventType;
    TestIds = adModule.TestIds;

    console.log('✅ react-native-google-mobile-ads 네이티브 모듈 로드 성공 (전면광고만 사용)');
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

  // 광고 인스턴스 (전면광고만)
  private static interstitialAd: any = null;

  // 광고 상태 관리 (전면광고만)
  private static adStates: {
    interstitial: AdState;
  } = {
    interstitial: { isLoaded: false, isLoading: false, lastShown: 0, errorCount: 0, revenue: 0 }
  };

  // 일일 광고 제한 추적 (전면광고만)
  private static dailyLimits: DailyAdLimits = {
    date: new Date().toDateString(),
    interstitial_count: 0,
    rewarded_count: 0, // 호환성 유지
    banner_impressions: 0 // 호환성 유지
  };

  // 액션 카운터 (전면광고 표시 조건)
  private static actionCounter = 0;
  private static readonly ACTION_THRESHOLD = 3; // 3번의 액션마다 전면광고

  // 타이머 탭 시간 기반 광고 추적
  private static timerTabLastAdTime = 0;
  private static readonly TIMER_TAB_AD_INTERVAL = 10 * 60 * 1000; // 10분 (밀리초)

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
   * ✅ FIX: 동기화 검증 로직 추가
   */
  static setPremiumStatus(isPremium: boolean): void {
    const previousStatus = this.isPremiumUser;
    this.isPremiumUser = isPremium;

    // ✅ 동기화 검증
    if (this.isPremiumUser !== isPremium) {
      console.error('❌ 프리미엄 상태 동기화 실패: 설정값과 실제값 불일치');
      return;
    }

    // 상태 변경 로그
    if (previousStatus !== isPremium) {
      console.log(`💎 프리미엄 상태 변경: ${previousStatus ? '활성화' : '비활성화'} → ${isPremium ? '활성화' : '비활성화'}`);
    } else {
      console.log(`💎 프리미엄 상태 재확인: ${isPremium ? '활성화' : '비활성화'} (변경 없음)`);
    }
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
   * ⚠️ DEPRECATED: 배너광고 Unit ID 반환
   * 베너 광고 제거로 더 이상 사용하지 않음 (전면광고만 사용)
   * unitId 초기화 크래시 방지를 위해 베너 광고 제거됨
   */
  static getBannerAdUnitId(): string {
    console.warn('⚠️ getBannerAdUnitId() 호출됨 - 베너 광고는 제거되었습니다.');

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
      // ✅ CRITICAL FIX: 4단계 폴백으로 unitId 크래시 방지 (베너 광고와 동일한 문제)
      let adUnitId: string;

      // 1. 개발/테스트 환경
      if (isDevelopment && TestIds) {
        adUnitId = TestIds.INTERSTITIAL;
      }
      // 2. Production: AD_UNITS 사용
      else if (AD_UNITS?.INTERSTITIAL) {
        adUnitId = AD_UNITS.INTERSTITIAL;
      }
      // 3. 폴백: adConfig에서 직접 import
      else {
        try {
          const { PRODUCTION_AD_UNITS } = require('./adConfig');
          const platform = Platform.OS as 'ios' | 'android';
          adUnitId = PRODUCTION_AD_UNITS[platform]?.interstitial || PRODUCTION_AD_UNITS.ios.interstitial;
          console.warn('⚠️ AD_UNITS 없음, adConfig에서 직접 로드:', adUnitId);
        } catch (importError) {
          // 4. 최종 하드코딩 폴백 (iOS Production)
          adUnitId = 'ca-app-pub-4284542208210945/5479246942';
          console.error('🚨 모든 폴백 실패, 하드코딩 전면광고 ID 사용:', adUnitId);
        }
      }

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
   * ⚠️ DEPRECATED: 리워드광고 제거됨 (전면광고만 사용)
   */

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
   * ⚠️ DEPRECATED: 리워드광고 제거됨 (전면광고만 사용)
   * 호환성 유지를 위해 빈 함수로 남김
   */
  static async showRewarded(placement: string): Promise<AdShowResult> {
    console.warn('⚠️ showRewarded() 호출됨 - 리워드광고는 제거되었습니다.');
    return { success: false, error: 'rewarded_ad_removed' };
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
        // ✅ FIX: toDateString() 대신 getTodayDateString() 사용 (로케일/타임존 일관성)
        const today = TarotUtils.getTodayDateString();

        if (stored.date === today) {
          this.dailyLimits = stored;
          console.log('📊 일일 광고 제한 복원:', this.dailyLimits);
        } else {
          console.log('🗓️ 새로운 날, 일일 제한 초기화');
          // ✅ FIX: 새로운 날짜로 dailyLimits 리셋
          this.dailyLimits = {
            date: today,
            interstitial_count: 0,
            rewarded_count: 0,
            banner_impressions: 0
          };
          await this.saveDailyLimits();
        }
      }
    } catch (error) {
      console.error('❌ 일일 제한 복원 실패:', error);
    }
  }

  /**
   * 오늘 수익 조회 (전면광고만)
   */
  static getTodayRevenue(): number {
    return this.adStates.interstitial.revenue;
  }

  /**
   * 오늘 노출 수 조회 (전면광고만)
   */
  static getTodayImpressions(): number {
    return this.dailyLimits.interstitial_count;
  }

  /**
   * 전면광고 카운터 조회
   */
  static getInterstitialCount(): number {
    return this.dailyLimits.interstitial_count;
  }

  /**
   * 액션 카운터 증가 및 전면광고 표시
   */
  static async incrementActionCounter(): Promise<void> {
    this.actionCounter++;
    console.log(`🎯 액션 카운터: ${this.actionCounter}/${this.ACTION_THRESHOLD}`);

    if (this.actionCounter >= this.ACTION_THRESHOLD) {
      console.log('📺 전면광고 표시 조건 충족');

      try {
        const result = await this.showInterstitial('action_triggered');
        // ✅ 광고 표시 성공 시에만 카운터 리셋 (사용자 경험 개선)
        if (result.success) {
          this.actionCounter = 0;
          console.log('✅ 전면광고 표시 성공, 카운터 리셋');
        } else {
          console.warn('⚠️ 전면광고 표시 실패, 카운터 유지 (다음 액션에서 재시도)');
        }
      } catch (error) {
        console.warn('⚠️ 전면광고 표시 오류 (카운터 유지):', error);
      }
    }
  }

  /**
   * 타이머 탭 시간 기반 광고 체크 (10분마다)
   * @returns 광고 표시 여부
   */
  static async checkTimerTabAd(): Promise<boolean> {
    const now = Date.now();
    const timeSinceLastAd = now - this.timerTabLastAdTime;

    // 10분이 지났는지 확인
    if (timeSinceLastAd >= this.TIMER_TAB_AD_INTERVAL) {
      console.log(`⏰ 타이머 탭 광고 시간 도달 (${Math.floor(timeSinceLastAd / 60000)}분 경과)`);

      try {
        const result = await this.showInterstitial('timer_tab_interval');

        if (result.success) {
          this.timerTabLastAdTime = now;
          console.log('✅ 타이머 탭 광고 표시 성공, 타이머 리셋');
          return true;
        } else {
          console.warn('⚠️ 타이머 탭 광고 표시 실패');
          return false;
        }
      } catch (error) {
        console.warn('⚠️ 타이머 탭 광고 표시 오류:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * 24시간 타로 뽑기 시 즉시 광고 표시
   */
  static async showDailyTarotAd(): Promise<boolean> {
    console.log('🎴 24시간 타로 뽑기 - 즉시 광고 표시');

    try {
      const result = await this.showInterstitial('daily_tarot_draw');

      if (result.success) {
        // 타이머도 함께 리셋하여 광고 중복 방지
        this.timerTabLastAdTime = Date.now();
        console.log('✅ 24시간 타로 광고 표시 성공');
        return true;
      } else {
        console.warn('⚠️ 24시간 타로 광고 표시 실패');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ 24시간 타로 광고 표시 오류:', error);
      return false;
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
      // ✅ REMOVED: rewardedAd는 제거됨 (전면광고만 사용)
      this.initialized = false;
      console.log('🧹 AdManager 정리 완료');
    } catch (error) {
      console.error('❌ AdManager 정리 오류:', error);
    }
  }
}

export default AdManager;
