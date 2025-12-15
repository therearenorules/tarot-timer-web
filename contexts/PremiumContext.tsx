/**
 * 프리미엄 구독 상태 관리 Context
 * 앱스토어 결제 기반 전역 구독 상태 관리 및 실시간 업데이트
 */

import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import IAPManager from '../utils/iapManager';
import LocalStorageManager, { PremiumStatus } from '../utils/localStorage';
import { ReceiptValidator } from '../utils/receiptValidator';
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

  // ✅ CRITICAL FIX: Stale Closure 문제 해결 - refreshStatus의 최신 참조 유지
  const refreshStatusRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // ✅ FIX: Debounce 패턴 - 중복 호출 방지
  const lastRefreshTime = useRef<number>(0);
  const pendingRefresh = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_DELAY = 1000; // 1초

  // 초기 로딩
  useEffect(() => {
    initializePremiumContext();
    setupEventListeners();

    return () => {
      removeEventListeners();

      // ✅ Cleanup: pending refresh 정리
      if (pendingRefresh.current) {
        clearTimeout(pendingRefresh.current);
        pendingRefresh.current = null;
      }
    };
  }, []);

  // 주기적 검증 (앱이 포그라운드로 돌아올 때)
  useEffect(() => {
    // React Native 환경에서만 AppState 사용
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }

    let subscription: any = null;
    let isMounted = true; // ✅ CRITICAL FIX: 마운트 상태 추적
    let timeoutId: NodeJS.Timeout | null = null; // ✅ CRITICAL FIX: timeout 추적

    try {
      const { AppState } = require('react-native');

      const handleAppStateChange = (nextAppState: string) => {
        // ✅ CRITICAL FIX: AppState 핸들러 전체를 try-catch로 감싸기
        try {
          if (nextAppState === 'active' && isMounted) {
            // ✅ CRITICAL FIX: 이전 timeout 정리
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }

            // ✅ CRITICAL FIX: 1초 디바운스 (연속 호출 방지)
            timeoutId = setTimeout(() => {
              if (!isMounted) {
                console.log('⚠️ PremiumContext 언마운트됨 - 상태 갱신 스킵');
                return;
              }

              // ✅ CRITICAL FIX: Stale Closure 해결 - ref를 통해 항상 최신 refreshStatus 사용
              if (refreshStatusRef.current) {
                refreshStatusRef.current().catch((error) => {
                  if (isMounted) {
                    console.warn('⚠️ 포어그라운드 복귀 시 구독 상태 갱신 실패 (무시):', error);
                  }
                });
              }
            }, 1000); // 1초 디바운스
          }
        } catch (error) {
          console.error('❌ PremiumContext AppState 핸들러 에러 (무시):', error);
        }
      };

      subscription = AppState.addEventListener('change', handleAppStateChange);
      console.log('✅ PremiumContext AppState 리스너 설정 완료');
    } catch (error) {
      console.warn('⚠️ PremiumContext AppState 리스너 설정 실패 (무시):', error);
    }

    return () => {
      isMounted = false; // ✅ CRITICAL FIX: 컴포넌트 언마운트 표시

      // ✅ CRITICAL FIX: timeout 정리
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (subscription?.remove) {
        subscription.remove();
        console.log('🧹 PremiumContext AppState 리스너 정리 완료');
      }
    };
  }, []); // ✅ 의존성 배열 비움 - 마운트 시 한 번만 설정, ref가 항상 최신 함수를 가리킴

  /**
   * ✅ NEW: 백그라운드에서 IAP 초기화 (UI 블로킹 없음)
   */
  const initializeIAPInBackground = () => {
    setTimeout(async () => {
      try {
        console.log('🔄 [Background] IAP 초기화 시작...');
        await IAPManager.initialize();
        console.log('✅ [Background] IAP 초기화 완료');

        // Supabase 동기화도 함께
        await ReceiptValidator.periodicValidation();
        console.log('✅ [Background] Supabase 동기화 완료');
      } catch (error) {
        console.warn('⚠️ [Background] IAP/Supabase 초기화 실패 (무시):', error);
      }
    }, 2000); // 2초 후 백그라운드 실행
  };

  /**
   * 컨텍스트 초기화
   * ✅ CRITICAL FIX V2: LocalStorage 우선 정책 - 구독 상태 안정성 강화
   * 순서: LocalStorage → IAP 초기화 → 백그라운드 동기화
   */
  const initializePremiumContext = async () => {
    console.log('🔄 PremiumContext 초기화 시작...');

    try {
      setIsLoading(true);
      setLastError(null);

      // ✅ CRITICAL FIX V2: LocalStorage 먼저 확인 (가장 신뢰할 수 있는 소스)
      let localStatus = defaultPremiumStatus;
      try {
        localStatus = await Promise.race([
          LocalStorageManager.getPremiumStatus(),
          new Promise<PremiumStatus>((resolve) =>
            setTimeout(() => {
              console.warn('⏱️ LocalStorage 조회 타임아웃 - 기본값 사용');
              resolve(defaultPremiumStatus);
            }, 3000)
          )
        ]);
        console.log('✅ LocalStorage 구독 상태 확인:', {
          is_premium: localStatus.is_premium,
          subscription_type: localStatus.subscription_type,
          expiry_date: localStatus.expiry_date,
        });
      } catch (error) {
        console.error('❌ LocalStorage 조회 오류 (무시):', error);
        localStatus = defaultPremiumStatus;
      }

      // ✅ CRITICAL FIX V2: LocalStorage에 유효한 구독이 있으면 즉시 적용
      if (localStatus.is_premium && localStatus.subscription_type !== 'trial') {
        // 만료일 체크
        let isStillValid = true;
        if (localStatus.expiry_date) {
          const expiryDate = new Date(localStatus.expiry_date);
          const now = new Date();
          isStillValid = now < expiryDate;
          console.log(`📅 만료일 체크: ${expiryDate.toISOString()}, 유효: ${isStillValid}`);
        }

        if (isStillValid) {
          // 유효한 구독 - 즉시 적용
          setPremiumStatus(localStatus);
          console.log('✅ LocalStorage 유료 구독 즉시 활성화');

          // IAP 초기화는 백그라운드에서 진행
          initializeIAPInBackground();
          setIsLoading(false);
          return; // 여기서 종료
        } else {
          console.log('⏰ LocalStorage 구독 만료됨 - IAP 확인 필요');
        }
      }

      // ✅ 무료 체험 상태 확인
      let trialStatus = defaultPremiumStatus;
      try {
        trialStatus = await Promise.race([
          LocalStorageManager.checkTrialStatus(),
          new Promise<PremiumStatus>((resolve) =>
            setTimeout(() => {
              console.warn('⏱️ 체험 상태 조회 타임아웃 - 기본값 사용');
              resolve(defaultPremiumStatus);
            }, 3000)
          )
        ]);
        console.log('✅ 무료 체험 상태 확인 완료');
      } catch (error) {
        console.error('❌ LocalStorageManager.checkTrialStatus 오류 (무시):', error);
        trialStatus = defaultPremiumStatus;
      }

      // ✅ IAP 시스템 초기화
      let iapStatus = defaultPremiumStatus;
      try {
        const iapInitResult = await Promise.race([
          IAPManager.initialize(),
          new Promise<boolean>((resolve) =>
            setTimeout(() => {
              console.warn('⏱️ IAP 초기화 타임아웃 (10초) - 건너뜀');
              resolve(false);
            }, 10000)
          )
        ]);

        if (iapInitResult === false) {
          console.error('❌ IAP 초기화 타임아웃 - LocalStorage 상태 사용');
          iapStatus = localStatus; // LocalStorage 상태 사용
        } else {
          console.log('✅ IAPManager 초기화 완료');
          iapStatus = await Promise.race([
            IAPManager.getCurrentSubscriptionStatus(),
            new Promise<PremiumStatus>((resolve) =>
              setTimeout(() => {
                console.warn('⏱️ IAP 상태 조회 타임아웃 - LocalStorage 사용');
                resolve(localStatus);
              }, 3000)
            )
          ]);
          console.log('✅ IAP 구독 상태 로드 완료');
        }
      } catch (error) {
        console.error('❌ IAPManager 초기화 오류 - LocalStorage 상태 사용:', error);
        iapStatus = localStatus; // 오류 시 LocalStorage 상태 사용
      }

      // ✅ 상태 우선순위 결정: IAP(LocalStorage 기반) > Trial > 무료
      try {
        if (iapStatus.is_premium && iapStatus.subscription_type !== 'trial') {
          setPremiumStatus(iapStatus);
          console.log('✅ 유료 구독 활성화');
        } else if (trialStatus.is_premium && trialStatus.subscription_type === 'trial') {
          setPremiumStatus(trialStatus);
          console.log('🎁 무료 체험 활성화');
        } else {
          setPremiumStatus(defaultPremiumStatus);
          console.log('📱 무료 버전');
        }
      } catch (error) {
        console.error('❌ 상태 설정 오류 (무시):', error);
        setPremiumStatus(defaultPremiumStatus);
      }

      // ✅ Supabase 동기화 (백그라운드)
      setTimeout(async () => {
        try {
          await ReceiptValidator.periodicValidation();
          console.log('✅ Supabase 백그라운드 동기화 완료');
        } catch (error) {
          console.error('❌ Supabase 동기화 오류 (무시):', error);
        }
      }, 3000);

      console.log('✅ PremiumContext 초기화 완료');

    } catch (error) {
      console.error('❌ PremiumContext 초기화 최상위 오류 (무시하고 계속):', error);
      setLastError(error instanceof Error ? error.message : '초기화 오류');
      try {
        setPremiumStatus(defaultPremiumStatus);
      } catch (setStateError) {
        console.error('❌ setPremiumStatus 실패 (치명적):', setStateError);
      }
    } finally {
      try {
        setIsLoading(false);
      } catch (error) {
        console.error('❌ setIsLoading(false) 실패 (무시):', error);
      }
    }
  };

  /**
   * 이벤트 리스너 설정
   */
  const setupEventListeners = () => {
    // 웹 환경: window 이벤트 리스너
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('premiumStatusChanged', handlePremiumStatusChange as unknown as EventListener);
      window.addEventListener('purchaseError', handlePurchaseError as unknown as EventListener);
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
      window.removeEventListener('premiumStatusChanged', handlePremiumStatusChange as unknown as EventListener);
      window.removeEventListener('purchaseError', handlePurchaseError as unknown as EventListener);
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
   * ✅ FIX: 무료 체험 만료 + IAP 구독 상태 동시 확인
   * ✅ FIX: Debounce 패턴 적용 - 1초 이내 중복 호출 방지
   * useSafeState를 사용하여 컴포넌트 언마운트 시 자동 보호
   */
  const refreshStatus = useCallback(async (): Promise<void> => {
    // ✅ Debounce 체크: 마지막 실행 후 1초 이내라면 대기열에 추가
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;

    if (timeSinceLastRefresh < DEBOUNCE_DELAY) {
      console.log(`⏳ 새로고침 디바운스: ${Math.round((DEBOUNCE_DELAY - timeSinceLastRefresh) / 1000)}초 후 재시도`);

      // 이전 대기 중인 refresh 취소
      if (pendingRefresh.current) {
        clearTimeout(pendingRefresh.current);
      }

      // 새로운 refresh 예약
      return new Promise<void>((resolve) => {
        pendingRefresh.current = setTimeout(async () => {
          pendingRefresh.current = null;
          await refreshStatusInternal();
          resolve();
        }, DEBOUNCE_DELAY - timeSinceLastRefresh);
      });
    }

    // 즉시 실행
    lastRefreshTime.current = now;
    return refreshStatusInternal();
  }, []); // ✅ CRITICAL FIX: 빈 의존성 배열로 함수 안정화 (Hermes 엔진 호환)

  /**
   * 내부 구독 상태 새로고침 로직
   * (디바운스 후 실제 실행되는 함수)
   */
  const refreshStatusInternal = async (): Promise<void> => {
    try {
      setLastError(null);
      console.log('🔄 구독 상태 새로고침 시작...');

      // ✅ FIX: 시뮬레이션 모드 체크 - 시뮬레이션 중이면 저장된 상태 사용
      // 🔒 SECURITY: 프로덕션에서는 시뮬레이션 모드 차단
      const currentStatus = await LocalStorageManager.getPremiumStatus();
      if (currentStatus.is_simulation) {
        if (__DEV__) {
          console.log('🎮 시뮬레이션 모드 - 저장된 상태 사용 (개발 환경)');
          setPremiumStatus(currentStatus);
          console.log('✅ 구독 상태 새로고침 완료 (시뮬레이션)');
          return;
        } else {
          console.warn('⚠️ 프로덕션에서 시뮬레이션 모드 차단 - 실제 상태로 전환');
          // 프로덕션에서는 시뮬레이션 플래그 무시하고 실제 상태 확인
        }
      }

      // ✅ V2: LocalStorage 우선 정책 (Supabase는 백그라운드 동기화)
      // 1. LocalStorage에서 현재 저장된 상태 확인 (가장 빠르고 신뢰성 있음)
      let localStatus = defaultPremiumStatus;
      try {
        localStatus = await LocalStorageManager.getPremiumStatus();
        console.log('✅ LocalStorage 상태 확인 완료');
        console.log('📋 [LocalStorage] is_premium:', localStatus.is_premium);
        console.log('📋 [LocalStorage] subscription_type:', localStatus.subscription_type);
        console.log('📋 [LocalStorage] expiry_date:', localStatus.expiry_date);
      } catch (error) {
        console.error('❌ LocalStorage 조회 오류 (무시):', error);
      }

      // ✅ NEW: LocalStorage에 유료 구독이 있으면 즉시 적용 (Supabase 대기 X)
      if (localStatus.is_premium && localStatus.subscription_type !== 'trial') {
        console.log('✅ LocalStorage 유료 구독 발견 - 즉시 적용');
        setPremiumStatus(localStatus);

        // ✅ 백그라운드에서 Supabase 동기화 (블로킹 X)
        console.log('🔄 백그라운드 Supabase 동기화 시작 (5초 후)...');
        setTimeout(async () => {
          try {
            await Promise.race([
              ReceiptValidator.periodicValidation(),
              new Promise<void>((resolve) =>
                setTimeout(() => {
                  console.warn('⏱️ 백그라운드 Supabase 동기화 타임아웃 - 건너뜀');
                  resolve();
                }, 5000)
              )
            ]);
            console.log('✅ 백그라운드 Supabase 동기화 완료');
          } catch (err) {
            console.warn('⚠️ 백그라운드 Supabase 동기화 실패 (무시):', err);
          }
        }, 5000); // 5초 후 백그라운드 실행

        console.log('✅ 구독 상태 새로고침 완료 (LocalStorage 우선)');
        return; // ✅ 여기서 종료 (나머지 체크 불필요)
      }

      // LocalStorage에 유료 구독이 없는 경우에만 아래 체크 진행

      // 2. 무료 체험 상태 확인 (타임아웃 3초)
      let trialStatus = defaultPremiumStatus;
      try {
        trialStatus = await Promise.race([
          LocalStorageManager.checkTrialStatus(),
          new Promise<PremiumStatus>((resolve) =>
            setTimeout(() => {
              console.warn('⏱️ 체험 상태 조회 타임아웃 - 기본값 사용');
              resolve(defaultPremiumStatus);
            }, 3000)
          )
        ]);
        console.log('✅ 무료 체험 상태 확인 완료');
      } catch (error) {
        console.error('❌ 무료 체험 상태 조회 오류 (무시):', error);
        trialStatus = defaultPremiumStatus;
      }

      // 3. IAP 구독 상태 확인 (타임아웃 3초) - LocalStorage에 없을 때만
      let iapStatus = defaultPremiumStatus;
      try {
        iapStatus = await Promise.race([
          IAPManager.getCurrentSubscriptionStatus(),
          new Promise<PremiumStatus>((resolve) =>
            setTimeout(() => {
              console.warn('⏱️ IAP 상태 조회 타임아웃 - 기본값 사용');
              resolve(defaultPremiumStatus);
            }, 3000)
          )
        ]);
        console.log('✅ IAP 구독 상태 확인 완료');
      } catch (error) {
        console.error('❌ IAP 상태 조회 오류 (무시):', error);
        iapStatus = defaultPremiumStatus;
      }

      // 4. 상태 우선순위 결정: IAP > 무료 체험 > 무료 버전
      if (iapStatus.is_premium && iapStatus.subscription_type !== 'trial') {
        // IAP에서 유료 구독 발견
        setPremiumStatus(iapStatus);
        console.log('✅ IAP 유료 구독 활성화');

        // ✅ LocalStorage에 동기화
        try {
          await LocalStorageManager.updatePremiumStatus(iapStatus);
          console.log('✅ LocalStorage에 IAP 상태 동기화 완료');
        } catch (syncErr) {
          console.warn('⚠️ LocalStorage 동기화 실패 (무시):', syncErr);
        }

      } else if (trialStatus.is_premium && trialStatus.subscription_type === 'trial') {
        // 무료 체험 중
        setPremiumStatus(trialStatus);
        console.log('✅ 무료 체험 활성화');
      } else {
        // 무료 버전
        setPremiumStatus(defaultPremiumStatus);
        console.log('✅ 무료 버전 활성화');
      }

      // ✅ Supabase 동기화 (백그라운드)
      setTimeout(async () => {
        try {
          await Promise.race([
            ReceiptValidator.periodicValidation(),
            new Promise<void>((resolve) =>
              setTimeout(() => {
                console.warn('⏱️ Supabase 동기화 타임아웃 - 건너뜀');
                resolve();
              }, 5000)
            )
          ]);
          console.log('✅ Supabase 동기화 완료');
        } catch (error) {
          console.error('❌ Supabase 동기화 오류 (무시):', error);
        }
      }, 3000); // 3초 후 백그라운드 실행

      console.log('✅ 구독 상태 새로고침 완료');
    } catch (error) {
      console.error('❌ 상태 새로고침 오류:', error);
      setLastError(error instanceof Error ? error.message : '상태 새로고침 오류');
    }
  };

  // ✅ CRITICAL FIX: refreshStatus가 생성될 때 한 번만 ref 업데이트
  useEffect(() => {
    refreshStatusRef.current = refreshStatus;
  }, [refreshStatus]);

  /**
   * 구독 구매
   * ✅ FIX: Sandbox 환경 대응 - 구매 완료 후 딜레이 추가
   */
  const purchaseSubscription = async (productId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setLastError(null);

      console.log('💳 [PremiumContext] 구독 구매 시작:', productId);

      const result = await IAPManager.purchaseSubscription(productId);

      if (result.success) {
        console.log('✅ [PremiumContext] 구독 구매 성공 - 상태 검증 시작');

        // ✅ FIX: Sandbox 환경 대응 - 1초 추가 딜레이 후 상태 갱신
        console.log('⏳ [PremiumContext] 구독 상태 전파 대기 중... (1초)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ✅ FIX: 재시도 로직 포함된 상태 갱신
        let statusRefreshed = false;
        let retries = 2;

        while (retries > 0 && !statusRefreshed) {
          try {
            await refreshStatus();
            statusRefreshed = true;
            console.log('✅ [PremiumContext] 구독 상태 갱신 완료');
          } catch (err) {
            console.warn(`⚠️ [PremiumContext] 상태 갱신 실패 (시도 ${3 - retries}/2):`, err);
            if (retries > 1) {
              await new Promise(r => setTimeout(r, 1000));
            }
            retries--;
          }
        }

        if (!statusRefreshed) {
          console.warn('⚠️ [PremiumContext] 상태 갱신 실패 - 수동 새로고침 필요');
        }

        return true;
      } else {
        const errorMsg = result.error || '구매에 실패했습니다.';
        setLastError(errorMsg);
        console.log('❌ [PremiumContext] 구독 구매 실패:', errorMsg);
        return false;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '구매 처리 중 오류가 발생했습니다.';
      setLastError(errorMessage);
      console.error('❌ [PremiumContext] 구독 구매 오류:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 구매 복원
   * ✅ FIX: 재시도 로직이 포함된 상태 갱신
   */
  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setLastError(null);

      console.log('🔄 [PremiumContext] 구매 복원 시작...');

      const success = await IAPManager.restorePurchases();

      if (success) {
        console.log('✅ [PremiumContext] 구매 복원 성공 - 상태 검증 시작');

        // ✅ FIX: 재시도 로직 포함된 상태 갱신
        let statusRefreshed = false;
        let retries = 2;

        while (retries > 0 && !statusRefreshed) {
          try {
            await refreshStatus();
            statusRefreshed = true;
            console.log('✅ [PremiumContext] 복원 후 상태 갱신 완료');
          } catch (err) {
            console.warn(`⚠️ [PremiumContext] 복원 후 상태 갱신 실패 (시도 ${3 - retries}/2):`, err);
            if (retries > 1) {
              await new Promise(r => setTimeout(r, 1000));
            }
            retries--;
          }
        }

        return true;
      } else {
        setLastError('복원할 구매 내역이 없습니다.');
        console.log('⚠️ [PremiumContext] 복원할 구매 내역 없음');
        return false;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '구매 복원 중 오류가 발생했습니다.';
      setLastError(errorMessage);
      console.error('❌ [PremiumContext] 구매 복원 오류:', error);
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
    // ✅ CRITICAL FIX: throw 대신 기본값 반환 (앱 크래시 방지)
    console.warn('⚠️ usePremium called outside PremiumProvider, returning default values');
    return {
      premiumStatus: defaultPremiumStatus,
      isLoading: false,
      lastError: 'PremiumProvider not initialized',
      refreshStatus: async () => {},
      purchaseSubscription: async () => false,
      restorePurchases: async () => false,
      validateSubscription: async () => false,
      isPremium: false,
      isSubscriptionActive: false,
      daysUntilExpiry: null,
      canAccessFeature: () => false,
    };
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