/**
 * 배너 광고 컴포넌트
 * 화면 하단에 표시되는 AdMob 배너 광고
 * react-native-google-mobile-ads 기반
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePremium } from '../../contexts/PremiumContext';
import AdManager from '../../utils/adManager';
import { AD_CONFIG } from '../../utils/adConfig';
import Constants from 'expo-constants';

// ✅ 조건부 import - Expo Go 호환
let RNBannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const adModule = require('react-native-google-mobile-ads');
  RNBannerAd = adModule.BannerAd;
  BannerAdSize = adModule.BannerAdSize;
  TestIds = adModule.TestIds;
} catch (error) {
  console.warn('⚠️ react-native-google-mobile-ads not available (Expo Go)');
}

// ✅ Android 최적화: 안전한 개발 환경 감지
const isDevelopment = (() => {
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__;
  }
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  if (Constants.manifest?.extra?.EXPO_PUBLIC_APP_ENV === 'production') {
    return false;
  }
  return false;
})();

interface BannerAdProps {
  placement?: 'main_screen' | 'session_complete' | 'journal_entry';
  testMode?: boolean;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: string) => void;
  onAdClicked?: () => void;
}

const BannerAd: React.FC<BannerAdProps> = ({
  placement = 'main_screen',
  testMode = false,
  onAdLoaded,
  onAdFailedToLoad,
  onAdClicked
}) => {
  const { isPremium, premiumStatus, isLoading: premiumLoading } = usePremium();
  const insets = useSafeAreaInsets(); // ✅ Android SafeArea 지원
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 네이티브 모듈이 없으면 (Expo Go) 조기 반환
  if (!RNBannerAd || !BannerAdSize || !TestIds) {
    return null;
  }

  // 프리미엄 사용자는 광고 표시하지 않음
  // ✅ 버그 수정: 로딩 중일 때는 광고 표시하지 않음 (무료 체험 확인 대기)
  const shouldShowAd = !premiumLoading && !isPremium && !premiumStatus.ad_free;

  useEffect(() => {
    const initializeBannerAd = async () => {
      if (!shouldShowAd) {
        console.log('💎 프리미엄 사용자: 배너 광고 비활성화');
        return;
      }

      // 배치별 광고 표시 설정 확인
      const shouldShowBanner = AdManager.shouldShowBanner(placement);
      if (!shouldShowBanner) {
        console.log(`⚠️ 배치 "${placement}"에서 배너 광고 비활성화`);
        return;
      }

      try {
        // AdManager 초기화 확인
        await AdManager.initialize();

        // 웹 환경에서는 시뮬레이션 모드
        if (Platform.OS === 'web') {
          setIsVisible(true);
          setIsLoaded(true);
          onAdLoaded?.();
          return;
        }

        // 배너 광고 표시 설정
        setIsVisible(true);
        console.log('📱 배너 광고 초기화 완료');

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '배너 광고 로드 실패';
        console.error('❌ 배너 광고 초기화 오류:', errorMessage);
        setError(errorMessage);
        onAdFailedToLoad?.(errorMessage);
      }
    };

    initializeBannerAd();
  }, [shouldShowAd, placement, onAdLoaded, onAdFailedToLoad]);

  // 광고를 표시하지 않는 경우 null 반환
  if (!shouldShowAd || !isVisible) {
    return null;
  }

  // 웹 환경용 시뮬레이션 배너
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webAdSimulation}>
          <Text style={styles.webAdText}>[ Web 광고 시뮬레이션 ]</Text>
          <Text style={styles.webAdSubtext}>실제 앱에서는 AdMob 배너 광고가 표시됩니다</Text>
        </View>
      </View>
    );
  }

  // ✅ iOS/Android 모두 배너 광고 활성화
  console.log(`📱 ${Platform.OS} 배너 광고 준비: ${placement}`);

  // 오류 발생 시 표시하지 않음
  if (error) {
    return null;
  }

  // ✅ Android 최적화: 실제 AdMob 배너 광고 ID 선택
  const adUnitId = testMode || isDevelopment
    ? TestIds.BANNER
    : AdManager.getBannerAdUnitId();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <RNBannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('✅ 배너 광고 로드 완료');
          setIsLoaded(true);
          AdManager.trackAdEvent('banner_loaded', placement);
          onAdLoaded?.();
        }}
        onAdFailedToLoad={(loadError) => {
          const errorMsg = loadError?.message || '알 수 없는 오류';
          console.error('❌ 배너 광고 로드 실패:', errorMsg);
          setError(errorMsg);
          AdManager.trackAdEvent('banner_failed', placement, { error: errorMsg });
          onAdFailedToLoad?.(errorMsg);
        }}
        onAdOpened={() => {
          console.log('📱 배너 광고 클릭됨');
          AdManager.trackAdEvent('banner_clicked', placement);
          AdManager.trackRevenue('banner', placement, 0.01);
          onAdClicked?.();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#1a1625',
  },
  webAdSimulation: {
    padding: 12,
    backgroundColor: 'rgba(123, 44, 191, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
    alignItems: 'center',
    width: 320,
    height: 50,
    justifyContent: 'center',
  },
  webAdText: {
    color: '#7b2cbf',
    fontSize: 12,
    fontWeight: '600',
  },
  webAdSubtext: {
    color: '#d4b8ff',
    fontSize: 10,
    marginTop: 4,
  },
});

export default BannerAd;
