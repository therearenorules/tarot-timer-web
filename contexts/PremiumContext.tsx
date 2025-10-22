/**
 * 프리미엄 구독 상태 관리 Context
 * 앱스토어 결제 기반 전역 구독 상태 관리 및 실시간 업데이트
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import IAPManager from '../utils/iapManager';
import LocalStorageManager, { PremiumStatus } from '../utils/localStorage';
import ReceiptValidator from '../utils/receiptValidator';
import { useSafeState } from '../hooks/useSafeState';

// Context 인터페이스 정의
interface PremiumContextType {
  // 현재 상태
  premiumStatus: PremiumStatus;
  isLoading: boolean;
  lastError: string | null;

  // 상태 관리 함수
  refreshStatus: () => Promise<void>;
  purchaseSubscription: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  validateSubscription: () => Promise<boolean>;

  // 편의 함수
  isPremium: boolean;
  isSubscriptionActive: boolean;
  daysUntilExpiry: number | null;
  canAccessFeature: (feature: PremiumFeature) => boolean;
}

// 프리미엄 기능 타입
export type PremiumFeature =
  | 'unlimited_storage'
  | 'ad_free'
  | 'premium_spreads';

// 기본값 정의
const defaultPremiumStatus: PremiumStatus = {
  is_premium: false,
  unlimited_storage: false,
  ad_free: false,
  premium_spreads: false
};

// Context 생성
const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// Provider 컴포넌트
interface PremiumProviderProps {
  children: ReactNode;
}

export function PremiumProvider({ children }: PremiumProviderProps) {
  const [premiumStatus, setPremiumStatus] = useSafeState<PremiumStatus>(defaultPremiumStatus);
  const [isLoading, setIsLoading] = useSafeState(true);
  const [lastError, setLastError] = useSafeState<string | null>(null);

  // 초기 로딩
  useEffect(() => {
    initializePremiumContext();
    setupEventListeners();

    return () => {
      removeEventListeners();
    };
  }, []);

  // 주기적 검증 (앱이 포그라운드로 돌아올 때)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && premiumStatus.is_premium) {
        // ✅ 비동기 함수 호출에 오류 처리 추가
        validateSubscription().catch((error) => {
          console.warn('⚠️ 포어그라운드 복귀 시 구독 검증 실패:', error);
        });
      }
    };

    // React Native 환경에서만 AppState 사용
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        const { AppState } = require('react-native');
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
      } catch (error) {
        console.log('AppState not available:', error);
      }
    }
  }, [premiumStatus.is_premium]);

  /**
   * 컨텍스트 초기화
   */
  const initializePremiumContext = async () => {
    try {
      setIsLoading(true);
      setLastError(null);

      // 7일 무료 체험 상태 확인
      const trialStatus = await LocalStorageManager.checkTrialStatus();

      // IAP 시스템 초기화
      await IAPManager.initialize();

      // 현재 구독 상태 로드 (IAP에서)
      const iapStatus = await IAPManager.getCurrentSubscriptionStatus();

      // IAP 구독이 있으면 IAP 상태 우선, 없으면 무료 체험 상태 사용
      if (iapStatus.is_premium && iapStatus.subscription_type !== 'trial') {
        // 유료 구독자
        setPremiumStatus(iapStatus);
        console.log('✅ 유료 구독 활성화');
      } else {
        // 무료 체험 또는 무료 사용자
        setPremiumStatus(trialStatus);
        console.log(trialStatus.is_premium ? '🎁 무료 체험 활성화' : '📱 무료 버전');
      }

      console.log('✅ PremiumContext 초기화 완료');

    } catch (error) {
      console.error('❌ PremiumContext 초기화 오류:', error);
      setLastError(error instanceof Error ? error.message : '초기화 오류');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 이벤트 리스너 설정
   */
  const setupEventListeners = () => {
    // 웹 환경: window 이벤트 리스너
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('premiumStatusChanged', handlePremiumStatusChange);
      window.addEventListener('purchaseError', handlePurchaseError);
    }

    // 모바일 환경: DeviceEventEmitter
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        const { DeviceEventEmitter } = require('react-native');
        const subscription = DeviceEventEmitter.addListener('premiumStatusChanged', handlePremiumStatusChangeMobile);
        // cleanup 함수를 위해 저장
        (globalThis as any).__premiumEventSubscription = subscription;
      } catch (error) {
        console.warn('⚠️ DeviceEventEmitter 설정 실패:', error);
      }
    }
  };

  /**
   * 이벤트 리스너 제거
   */
  const removeEventListeners = () => {
    // 웹 환경: window 이벤트 리스너 제거
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.removeEventListener('premiumStatusChanged', handlePremiumStatusChange);
      window.removeEventListener('purchaseError', handlePurchaseError);
    }

    // 모바일 환경: DeviceEventEmitter 제거
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const subscription = (globalThis as any).__premiumEventSubscription;
      if (subscription) {
        subscription.remove();
        delete (globalThis as any).__premiumEventSubscription;
      }
    }
  };

  /**
   * 프리미엄 상태 변경 이벤트 핸들러 (웹)
   * useSafeState를 사용하여 컴포넌트 언마운트 시 자동 보호
   */
  const handlePremiumStatusChange = async (event: CustomEvent) => {
    try {
      console.log('🔄 [웹] 프리미엄 상태 변경 감지');
      await refreshStatus();
    } catch (error) {
      console.error('❌ 상태 변경 처리 오류:', error);
      setLastError(error instanceof Error ? error.message : '상태 변경 처리 오류');
    }
  };

  /**
   * 프리미엄 상태 변경 이벤트 핸들러 (모바일)
   * useSafeState를 사용하여 컴포넌트 언마운트 시 자동 보호
   */
  const handlePremiumStatusChangeMobile = async (data: any) => {
    try {
      console.log('🔄 [모바일] 프리미엄 상태 변경 감지:', data);
      await refreshStatus();
    } catch (error) {
      console.error('❌ 상태 변경 처리 오류:', error);
      setLastError(error instanceof Error ? error.message : '상태 변경 처리 오류');
    }
  };

  /**
   * 구매 오류 이벤트 핸들러
   */
  const handlePurchaseError = (event: CustomEvent) => {
    const { error } = event.detail;
    console.error('❌ 구매 오류 이벤트:', error);
    setLastError(error.message || '구매 처리 중 오류가 발생했습니다.');
  };

  /**
   * 구독 상태 새로고침
   * useSafeState를 사용하여 컴포넌트 언마운트 시 자동 보호
   */
  const refreshStatus = async (): Promise<void> => {
    try {
      setLastError(null);
      const currentStatus = await LocalStorageManager.getPremiumStatus();
      setPremiumStatus(currentStatus);
      console.log('✅ 구독 상태 새로고침 완료');
    } catch (error) {
      console.error('❌ 상태 새로고침 오류:', error);
      setLastError(error instanceof Error ? error.message : '상태 새로고침 오류');
    }
  };

  /**
   * 구독 구매
   */
  const purchaseSubscription = async (productId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setLastError(null);

      console.log('💳 구독 구매 시작:', productId);

      const result = await IAPManager.purchaseSubscription(productId);

      if (result.success) {
        await refreshStatus();
        console.log('✅ 구독 구매 성공');
        return true;
      } else {
        setLastError(result.error || '구매에 실패했습니다.');
        console.log('❌ 구독 구매 실패:', result.error);
        return false;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '구매 처리 중 오류가 발생했습니다.';
      setLastError(errorMessage);
      console.error('❌ 구독 구매 오류:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 구매 복원
   */
  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setLastError(null);

      console.log('🔄 구매 복원 시작...');

      const success = await IAPManager.restorePurchases();

      if (success) {
        await refreshStatus();
        console.log('✅ 구매 복원 성공');
        return true;
      } else {
        setLastError('복원할 구매 내역이 없습니다.');
        console.log('⚠️ 복원할 구매 내역 없음');
        return false;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '구매 복원 중 오류가 발생했습니다.';
      setLastError(errorMessage);
      console.error('❌ 구매 복원 오류:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 구독 상태 검증
   * useSafeState를 사용하여 컴포넌트 언마운트 시 자동 보호
   */
  const validateSubscription = async (): Promise<boolean> => {
    try {
      setLastError(null);
      console.log('🔍 구독 상태 검증 시작...');

      const isValid = await IAPManager.forceValidateSubscription();
      await refreshStatus();

      console.log('✅ 구독 상태 검증 완료:', isValid ? '유효' : '무효');
      return isValid;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '구독 검증 중 오류가 발생했습니다.';
      setLastError(errorMessage);
      console.error('❌ 구독 검증 오류:', error);
      return false;
    }
  };

  /**
   * 편의 함수들
   */
  const isPremium = premiumStatus?.is_premium || false;

  const isSubscriptionActive = (): boolean => {
    if (!premiumStatus?.is_premium) return false;
    if (!premiumStatus?.expiry_date) return false;

    try {
      const expiryDate = new Date(premiumStatus.expiry_date);
      return new Date() < expiryDate;
    } catch (error) {
      console.warn('Invalid expiry date:', premiumStatus.expiry_date);
      return false;
    }
  };

  const daysUntilExpiry = (): number | null => {
    if (!premiumStatus?.expiry_date) return null;

    try {
      const expiryDate = new Date(premiumStatus.expiry_date);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      console.warn('Invalid expiry date for days calculation:', premiumStatus.expiry_date);
      return null;
    }
  };

  // Computed values for context
  const isSubscriptionActiveValue = isSubscriptionActive();
  const daysUntilExpiryValue = daysUntilExpiry();

  const canAccessFeature = (feature: PremiumFeature): boolean => {
    if (!isPremium) return false;

    switch (feature) {
      case 'unlimited_storage':
        return premiumStatus.unlimited_storage;
      case 'ad_free':
        return premiumStatus.ad_free;
      case 'premium_spreads':
        return premiumStatus.premium_spreads;
      default:
        return false;
    }
  };

  // Context 값 구성
  const contextValue: PremiumContextType = {
    // 현재 상태
    premiumStatus,
    isLoading,
    lastError,

    // 상태 관리 함수
    refreshStatus,
    purchaseSubscription,
    restorePurchases,
    validateSubscription,

    // 편의 함수
    isPremium,
    isSubscriptionActive: isSubscriptionActiveValue,
    daysUntilExpiry: daysUntilExpiryValue,
    canAccessFeature
  };

  return (
    <PremiumContext.Provider value={contextValue}>
      {children}
    </PremiumContext.Provider>
  );
}

// Hook for using the context
export function usePremium(): PremiumContextType {
  const context = useContext(PremiumContext);

  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }

  return context;
}

// 편의 Hook들
export function usePremiumFeature(feature: PremiumFeature): boolean {
  const { canAccessFeature } = usePremium();
  return canAccessFeature(feature);
}

export function usePremiumStatus(): {
  isPremium: boolean;
  isActive: boolean;
  daysLeft: number | null;
  subscriptionType: string | undefined;
} {
  const { isPremium, isSubscriptionActive, daysUntilExpiry, premiumStatus } = usePremium();

  return {
    isPremium,
    isActive: isSubscriptionActive,
    daysLeft: daysUntilExpiry,
    subscriptionType: premiumStatus.subscription_type
  };
}

// 간편한 권한 체크 훅 (기존 코드와의 호환성 유지)
export const usePremiumAccess = (feature: string): boolean => {
  const { canAccessFeature } = usePremium();

  switch (feature) {
    case 'unlimited_saves':
      return canAccessFeature('unlimited_storage');
    case 'premium_spreads':
      return canAccessFeature('premium_spreads');
    case 'notifications':
      return true; // 모든 사용자가 이용 가능
    default:
      return false;
  }
};

export default PremiumProvider;