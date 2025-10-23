/**
 * 전면 광고 컴포넌트
 * 타로 세션 완료, 앱 시작 등에서 표시되는 AdMob 전면 광고
 */

import React, { useEffect, useCallback, useState } from 'react';
import { Platform, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePremium } from '../../contexts/PremiumContext';
import { useSafeState } from '../../hooks/useSafeState';
import AdManager from '../../utils/adManager';
import { AD_PLACEMENTS } from '../../utils/adConfig';

interface InterstitialAdProps {
  placement: keyof typeof AD_PLACEMENTS;
  trigger?: 'session_complete' | 'app_launch' | 'manual';
  onAdShown?: () => void;
  onAdDismissed?: () => void;
  onAdFailed?: (error: string) => void;
  onRevenueEarned?: (amount: number) => void;
}

// 로컬 스토리지 키
const AD_DAILY_COUNT_KEY = 'ad_daily_count';
const AD_DAILY_DATE_KEY = 'ad_daily_date';
const USER_INSTALL_DATE_KEY = 'user_install_date';

const InterstitialAd: React.FC<InterstitialAdProps> = ({
  placement,
  trigger = 'manual',
  onAdShown,
  onAdDismissed,
  onAdFailed,
  onRevenueEarned
}) => {
  const { isPremium, premiumStatus, isLoading: premiumLoading } = usePremium();
  const lastShownTimeRef = React.useRef<number>(0);

  // ✅ FIX: useState 대신 useRef 사용 (의존성 제거 + 크래시 방지)
  const dailyAdCountRef = React.useRef<number>(0);
  const isLoyalUserRef = React.useRef<boolean>(false);
  const isMountedRef = React.useRef<boolean>(true);

  // 사용자 유형에 따른 설정
  const MAX_DAILY_ADS = 10; // 일반 사용자: 하루 10회
  const MAX_DAILY_ADS_LOYAL = 5; // 충성 고객: 하루 5회
  const LOYAL_USER_DAYS = 30; // 30일 이상 사용 시 충성 고객
  const MIN_INTERVAL_MS = 15 * 60 * 1000; // 15분 간격

  // 프리미엄 사용자는 광고 표시하지 않음
  // ✅ 버그 수정: 로딩 중일 때는 광고 표시하지 않음 (무료 체험 확인 대기)
  const shouldShowAd = !premiumLoading && !isPremium && !premiumStatus.ad_free;

  /**
   * ✅ FIX: 충성 고객 여부 및 일일 카운터 초기화 (마운트 안전성 추가)
   */
  useEffect(() => {
    isMountedRef.current = true;

    const initializeAdTracking = async () => {
      try {
        // 1. 충성 고객 감지
        const installDateStr = await AsyncStorage.getItem(USER_INSTALL_DATE_KEY);
        let installDate: Date;

        if (!installDateStr) {
          // 처음 설치한 경우
          installDate = new Date();
          await AsyncStorage.setItem(USER_INSTALL_DATE_KEY, installDate.toISOString());
        } else {
          installDate = new Date(installDateStr);
        }

        const daysSinceInstall = Math.floor((Date.now() - installDate.getTime()) / (1000 * 60 * 60 * 24));
        const isLoyal = daysSinceInstall >= LOYAL_USER_DAYS;

        // ✅ FIX: 마운트 확인 후 ref 업데이트 (setState 제거)
        if (isMountedRef.current) {
          isLoyalUserRef.current = isLoyal;

          if (isLoyal) {
            console.log(`💎 충성 고객 인식: ${daysSinceInstall}일 사용 - 광고 빈도 50% 감소`);
          }
        }

        // 2. 일일 광고 카운터 복원 또는 초기화
        const savedDate = await AsyncStorage.getItem(AD_DAILY_DATE_KEY);
        const today = new Date().toDateString();

        if (savedDate !== today) {
          // 날짜가 바뀌면 카운터 리셋
          await AsyncStorage.setItem(AD_DAILY_DATE_KEY, today);
          await AsyncStorage.setItem(AD_DAILY_COUNT_KEY, '0');

          // ✅ FIX: 마운트 확인 후 ref 업데이트
          if (isMountedRef.current) {
            dailyAdCountRef.current = 0;
            console.log('🔄 일일 광고 카운터 리셋 (새로운 날)');
          }
        } else {
          // 오늘 날짜면 저장된 카운터 복원
          const savedCount = await AsyncStorage.getItem(AD_DAILY_COUNT_KEY);
          const count = savedCount ? parseInt(savedCount, 10) : 0;

          // ✅ FIX: 마운트 확인 후 ref 업데이트
          if (isMountedRef.current) {
            dailyAdCountRef.current = count;
            console.log(`📊 오늘 광고 표시 횟수: ${count}회`);
          }
        }
      } catch (error) {
        console.error('광고 추적 초기화 실패:', error);
      }
    };

    initializeAdTracking();

    // ✅ FIX: cleanup 함수 추가
    return () => {
      isMountedRef.current = false;
    };
  }, []); // ✅ FIX: 빈 의존성 배열 (한 번만 실행)

  /**
   * ✅ FIX: 전면 광고 표시 (의존성 최소화 + ref 사용)
   */
  const showInterstitialAd = useCallback(async () => {
    // ✅ FIX: 마운트 확인
    if (!isMountedRef.current) {
      console.log('⚠️ 컴포넌트 언마운트됨 - 광고 표시 중단');
      return;
    }

    if (!shouldShowAd) {
      console.log('💎 프리미엄 사용자: 전면 광고 건너뛰기');
      return;
    }

    // ✅ FIX: ref 사용으로 변경
    const maxAds = isLoyalUserRef.current ? MAX_DAILY_ADS_LOYAL : MAX_DAILY_ADS;
    if (dailyAdCountRef.current >= maxAds) {
      console.log(`🚫 일일 광고 한도 도달: ${dailyAdCountRef.current}/${maxAds} (${isLoyalUserRef.current ? '충성 고객' : '일반 사용자'})`);
      return;
    }

    // 광고 표시 간격 체크
    const now = Date.now();
    const timeSinceLastShown = now - lastShownTimeRef.current;

    if (timeSinceLastShown < MIN_INTERVAL_MS && lastShownTimeRef.current > 0) {
      const minutesRemaining = Math.ceil((MIN_INTERVAL_MS - timeSinceLastShown) / (60 * 1000));
      console.log(`⏰ 전면광고 대기 중: ${minutesRemaining}분 후 표시 가능`);
      return;
    }

    // 배치별 광고 표시 권한 확인
    const placementConfig = AD_PLACEMENTS[placement];
    if (!placementConfig || !placementConfig.interstitial) {
      console.log(`⚠️ 배치 "${placement}"에서 전면 광고 비활성화`);
      return;
    }

    try {
      console.log(`📱 전면 광고 표시 시도: ${placement}`);

      const result = await AdManager.showInterstitial(placement);

      // ✅ FIX: 마운트 확인 후에만 처리
      if (!isMountedRef.current) {
        console.log('⚠️ 광고 표시 중 컴포넌트 언마운트됨');
        return;
      }

      if (result.success) {
        console.log('✅ 전면 광고 표시 성공');
        lastShownTimeRef.current = Date.now(); // 마지막 표시 시간 기록

        // ✅ FIX: ref 사용으로 변경 (setState 제거)
        const newCount = dailyAdCountRef.current + 1;
        dailyAdCountRef.current = newCount;
        await AsyncStorage.setItem(AD_DAILY_COUNT_KEY, newCount.toString());
        console.log(`📊 오늘 광고 표시: ${newCount}/${isLoyalUserRef.current ? MAX_DAILY_ADS_LOYAL : MAX_DAILY_ADS}회`);

        onAdShown?.();

        if (result.revenue) {
          onRevenueEarned?.(result.revenue);
        }
      } else {
        console.log('❌ 전면 광고 표시 실패:', result.error);
        onAdFailed?.(result.error || '광고 표시 실패');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '전면 광고 오류';
      console.error('❌ 전면 광고 오류:', errorMessage);
      onAdFailed?.(errorMessage);
    }
  }, [shouldShowAd, placement]); // ✅ FIX: 의존성 11개 → 2개로 감소

  /**
   * ✅ FIX: 광고 이벤트 리스너 설정 (한 번만 등록)
   */
  useEffect(() => {
    // ✅ FIX: 콜백 ref 사용 (의존성 제거)
    const callbacksRef = {
      onDismissed: onAdDismissed,
      onFailed: onAdFailed,
      onRevenueEarned: onRevenueEarned,
    };

    // 전면 광고 이벤트 리스너 설정
    const handleInterstitialDismissed = () => {
      console.log('🔄 전면 광고 닫힘');
      callbacksRef.onDismissed?.();
    };

    const handleInterstitialFailed = (data: any) => {
      console.log('❌전면 광고 실패:', data);
      callbacksRef.onFailed?.(data?.error || '광고 로드 실패');
    };

    const handleRevenueEarned = (data: any) => {
      const { amount } = data;
      console.log('💰 전면 광고 수익:', amount);
      callbacksRef.onRevenueEarned?.(amount);
    };

    let dismissedListener: any = null;
    let failedListener: any = null;
    let revenueListener: any = null;

    // ✅ FIX: 플랫폼별 이벤트 리스너 등록 (한 번만)
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.addEventListener('ad_interstitial_dismissed', handleInterstitialDismissed);
        window.addEventListener('ad_interstitial_failed', handleInterstitialFailed);
        window.addEventListener('ad_revenue_earned', handleRevenueEarned);
      }
    } else {
      // React Native 환경에서는 DeviceEventEmitter 사용
      dismissedListener = DeviceEventEmitter.addListener('ad_interstitial_dismissed', handleInterstitialDismissed);
      failedListener = DeviceEventEmitter.addListener('ad_interstitial_failed', handleInterstitialFailed);
      revenueListener = DeviceEventEmitter.addListener('ad_revenue_earned', handleRevenueEarned);
    }

    // 클린업
    return () => {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.removeEventListener('ad_interstitial_dismissed', handleInterstitialDismissed);
          window.removeEventListener('ad_interstitial_failed', handleInterstitialFailed);
          window.removeEventListener('ad_revenue_earned', handleRevenueEarned);
        }
      } else {
        // React Native 이벤트 리스너 제거
        dismissedListener?.remove();
        failedListener?.remove();
        revenueListener?.remove();
      }
    };
  }, []); // ✅ FIX: 빈 의존성 배열 (한 번만 등록)

  /**
   * ✅ FIX: 트리거별 자동 실행 로직 (의존성 제거)
   */
  useEffect(() => {
    if (!shouldShowAd) return;
    if (!isMountedRef.current) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const executeBasedOnTrigger = () => {
      switch (trigger) {
        case 'session_complete':
          // 타로 세션 완료 시 3초 후 광고 표시
          timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
              showInterstitialAd();
            }
          }, 3000);
          break;

        case 'app_launch':
          // 앱 시작 시 5초 후 광고 표시 (사용자 경험 고려)
          timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
              showInterstitialAd();
            }
          }, 5000);
          break;

        case 'manual':
          // 수동 트리거는 외부에서 showInterstitialAd 호출 필요
          break;

        default:
          break;
      }
    };

    executeBasedOnTrigger();

    // ✅ FIX: cleanup에서 timeout clear
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [trigger, shouldShowAd, showInterstitialAd]); // ✅ FIX: showInterstitialAd는 의존성에 유지 (stable)

  // 이 컴포넌트는 UI를 렌더링하지 않음 (광고 관리용 로직 컴포넌트)
  return null;
};

/**
 * 전면 광고 표시를 위한 Hook
 */
export const useInterstitialAd = () => {
  const showAd = useCallback(async (
    placement: keyof typeof AD_PLACEMENTS,
    callbacks?: {
      onShown?: () => void;
      onDismissed?: () => void;
      onFailed?: (error: string) => void;
      onRevenueEarned?: (amount: number) => void;
    }
  ) => {
    try {
      const result = await AdManager.showInterstitial(placement);

      if (result.success) {
        console.log('✅ Hook: 전면 광고 표시 성공');
        callbacks?.onShown?.();

        if (result.revenue) {
          callbacks?.onRevenueEarned?.(result.revenue);
        }
      } else {
        console.log('❌ Hook: 전면 광고 표시 실패:', result.error);
        callbacks?.onFailed?.(result.error || '광고 표시 실패');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '전면 광고 오류';
      console.error('❌ Hook: 전면 광고 오류:', errorMessage);
      callbacks?.onFailed?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  return { showInterstitialAd: showAd };
};

export default InterstitialAd;