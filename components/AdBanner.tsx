/**
 * 배너 광고 컴포넌트
 * 프리미엄이 아닌 사용자에게만 표시
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
// 웹 환경에서는 expo-ads-admob을 조건부로 import
let AdMobBanner: any = null;
if (Platform.OS !== 'web') {
  try {
    const admob = require('expo-ads-admob');
    AdMobBanner = admob.AdMobBanner;
  } catch (error) {
    console.warn('expo-ads-admob not available:', error);
  }
}
import AdManager from '../utils/adManager';

interface AdBannerProps {
  size?: 'banner' | 'largeBanner' | 'mediumRectangle' | 'fullBanner' | 'leaderboard' | 'smartBannerPortrait' | 'smartBannerLandscape';
  style?: any;
}

export default function AdBanner({
  size = 'banner',
  style
}: AdBannerProps) {
  const [shouldShow, setShouldShow] = useSafeState(false);
  const [adUnitID, setAdUnitID] = useSafeState('');

  useEffect(() => {
    checkAdDisplay();
  }, []);

  const checkAdDisplay = async () => {
    try {
      const shouldShowAds = AdManager.shouldShowBanner();
      setShouldShow(shouldShowAds);

      if (shouldShowAds) {
        // AdManager에서 배너 광고 Unit ID 가져오기
        const unitId = AdManager.getBannerAdUnitId();
        setAdUnitID(unitId);
      }
    } catch (error) {
      console.error('광고 표시 확인 오류:', error);
      setShouldShow(false);
    }
  };

  const handleAdLoaded = () => {
    console.log('📺 배너 광고 로드 완료');
  };

  const handleAdFailedToLoad = (error: any) => {
    console.error('❌ 배너 광고 로드 실패:', error);
  };

  const handleAdOpened = () => {
    console.log('📺 배너 광고 클릭됨');
  };

  // 웹 환경이거나 광고를 표시하지 않아야 하는 경우
  if (Platform.OS === 'web' || !shouldShow) {
    return null;
  }

  // AdMobBanner가 없거나 광고를 표시하지 않아야 하는 경우
  if (!AdMobBanner || !adUnitID) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <AdMobBanner
        adUnitID={adUnitID}
        size={size}
        onDidReceiveAd={handleAdLoaded}
        onDidFailToReceiveAdWithError={handleAdFailedToLoad}
        onWillPresentScreen={handleAdOpened}
        style={styles.banner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  banner: {
    // AdMob 배너 스타일은 자동으로 적용됨
  },
});