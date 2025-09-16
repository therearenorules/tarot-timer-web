/**
 * 전면 광고 컴포넌트
 * 타로 세션 완료, 앱 시작 등에서 표시되는 AdMob 전면 광고
 */

import React, { useEffect, useCallback } from 'react';
import { Platform, DeviceEventEmitter } from 'react-native';
import { usePremium } from '../../contexts/PremiumContext';
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

const InterstitialAd: React.FC<InterstitialAdProps> = ({
  placement,
  trigger = 'manual',
  onAdShown,
  onAdDismissed,
  onAdFailed,
  onRevenueEarned
}) => {
  const { isPremium, canAccessFeature } = usePremium();

  // 프리미엄 사용자는 광고 표시하지 않음
  const shouldShowAd = !isPremium && !canAccessFeature('ad_free');

  /**
   * 전면 광고 표시
   */
  const showInterstitialAd = useCallback(async () => {
    if (!shouldShowAd) {
      console.log('💎 프리미엄 사용자: 전면 광고 건너뛰기');
      return;
    }

    // 배치별 광고 표시 권한 확인
    const placementConfig = AD_PLACEMENTS[placement];
    if (!placementConfig || !placementConfig.interstitial) {
      console.log(`⚠️ 배치 "${placement}"에서 전면 광고 비활성화`);
      return;
    }

    try {
      console.log(`📱 전면 광고 표시 시도: ${placement} - ${trigger}`);

      const result = await AdManager.showInterstitial(placement);

      if (result.success) {
        console.log('✅ 전면 광고 표시 성공');
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
  }, [shouldShowAd, placement, trigger, onAdShown, onAdFailed, onRevenueEarned]);

  /**
   * 광고 이벤트 리스너 설정
   */
  useEffect(() => {
    if (!shouldShowAd) return;

    // 전면 광고 이벤트 리스너 설정
    const handleInterstitialDismissed = () => {
      console.log('🔄 전면 광고 닫힘');
      onAdDismissed?.();
    };

    const handleInterstitialFailed = (data: any) => {
      console.log('❌전면 광고 실패:', data);
      onAdFailed?.(data?.error || '광고 로드 실패');
    };

    const handleRevenueEarned = (data: any) => {
      const { amount } = data;
      console.log('💰 전면 광고 수익:', amount);
      onRevenueEarned?.(amount);
    };

    let dismissedListener: any = null;
    let failedListener: any = null;
    let revenueListener: any = null;

    // 플랫폼별 이벤트 리스너 등록
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
  }, [shouldShowAd, onAdDismissed, onAdFailed, onRevenueEarned]);

  /**
   * 트리거별 자동 실행 로직
   */
  useEffect(() => {
    if (!shouldShowAd) return;

    const executeBasedOnTrigger = async () => {
      switch (trigger) {
        case 'session_complete':
          // 타로 세션 완료 시 3초 후 광고 표시
          setTimeout(() => {
            showInterstitialAd();
          }, 3000);
          break;

        case 'app_launch':
          // 앱 시작 시 5초 후 광고 표시 (사용자 경험 고려)
          setTimeout(() => {
            showInterstitialAd();
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
  }, [trigger, shouldShowAd, showInterstitialAd]);

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