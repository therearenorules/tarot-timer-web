/**
 * 배너 광고 컴포넌트
 * 화면 하단에 표시되는 AdMob 배너 광고
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { usePremium } from '../../contexts/PremiumContext';
import AdManager from '../../utils/adManager';
import { AD_CONFIG } from '../../utils/adConfig';

// 웹 환경에서는 expo-ads-admob을 조건부로 import
let AdMobBanner: any = null;
if (Platform.OS !== 'web') {
  try {
    const AdMob = require('expo-ads-admob');
    AdMobBanner = AdMob.AdMobBanner;
  } catch (error) {
    console.warn('expo-ads-admob not available:', error);
  }
}

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
  const { isPremium, canAccessFeature } = usePremium();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 프리미엄 사용자는 광고 표시하지 않음
  const shouldShowAd = !isPremium && !canAccessFeature('ad_free');

  useEffect(() => {
    const initializeBannerAd = async () => {
      if (!shouldShowAd) {
        console.log('💎 프리미엄 사용자: 배너 광고 비활성화');
        return;
      }

      // 배치별 광고 표시 설정 확인
      const placementConfig = AD_CONFIG.banner;
      if (!placementConfig) {
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

        // 배너 광고 로드 시도
        if (AdMobBanner) {
          setIsVisible(true);
          console.log('📱 배너 광고 로드 중...');
        } else {
          console.warn('⚠️ AdMobBanner not available, showing placeholder');
          setIsVisible(true);
          setIsLoaded(true);
          onAdLoaded?.();
        }

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
      <View style={[styles.container, styles.webSimulation]}>
        <View style={styles.webBanner}>
          <Text style={styles.webBannerText}>🌐 웹 환경 광고 시뮬레이션</Text>
          <Text style={styles.webBannerSubtext}>배너 광고 자리 (320x50)</Text>
        </View>
      </View>
    );
  }

  // 오류 발생 시 숨김
  if (error) {
    return null;
  }

  // React Native 환경용 실제 배너 광고
  if (AdMobBanner) {
    return (
      <View style={styles.container}>
        <AdMobBanner
          bannerSize="banner"
          adUnitID={AdManager.getBannerAdUnitId()}
          servePersonalizedAds={false}
          onDidReceiveAd={() => {
            console.log('✅ 배너 광고 로드 성공');
            setIsLoaded(true);
            onAdLoaded?.();
            AdManager.trackAdEvent('BANNER_LOADED', placement);
          }}
          onDidFailToReceiveAdWithError={(error: string) => {
            console.error('❌ 배너 광고 로드 실패:', error);
            setError(error);
            onAdFailedToLoad?.(error);
            AdManager.trackAdEvent('BANNER_FAILED', placement, { error });
          }}
          onDidPresentScreen={() => {
            console.log('🔍 배너 광고 클릭됨');
            onAdClicked?.();
            AdManager.trackAdEvent('BANNER_CLICKED', placement);
            AdManager.trackRevenue('banner', placement);
          }}
          style={styles.banner}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AD_CONFIG.banner.background_color,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 184, 255, 0.2)',
  },
  banner: {
    width: 320,
    height: 50,
  },
  webSimulation: {
    backgroundColor: '#2d1b47',
    borderWidth: 1,
    borderColor: '#7b2cbf',
    borderStyle: 'dashed',
  },
  webBanner: {
    width: 320,
    height: 50,
    backgroundColor: 'rgba(123, 44, 191, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7b2cbf',
  },
  webBannerText: {
    color: '#d4b8ff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webBannerSubtext: {
    color: '#f4d03f',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default BannerAd;