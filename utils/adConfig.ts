/**
 * 광고 설정 및 AdMob 단위 ID 관리
 * 테스트 및 프로덕션 환경 광고 ID 설정
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 개발 환경 여부 확인
const isDevelopment = __DEV__;

// AdMob 테스트 광고 단위 ID (Google 제공)
export const TEST_AD_UNITS = {
  // iOS 테스트 광고 ID
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313'
  },
  // Android 테스트 광고 ID
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
  }
};

// 프로덕션 광고 단위 ID (실제 배포 시 교체 필요)
export const PRODUCTION_AD_UNITS = {
  // iOS 프로덕션 광고 ID (실제 AdMob에서 생성된 ID로 교체 필요)
  ios: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'
  },
  // Android 프로덕션 광고 ID (실제 AdMob에서 생성된 ID로 교체 필요)
  android: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'
  }
};

// 현재 사용할 광고 단위 ID 결정
const getCurrentAdUnits = () => {
  const platform = Platform.OS as 'ios' | 'android';

  // 개발 환경이거나 웹 환경에서는 테스트 광고 사용
  if (isDevelopment || Platform.OS === 'web') {
    return TEST_AD_UNITS[platform] || TEST_AD_UNITS.ios;
  }

  // 프로덕션 환경에서는 실제 광고 사용
  return PRODUCTION_AD_UNITS[platform] || PRODUCTION_AD_UNITS.ios;
};

// 광고 단위 ID 내보내기
export const AD_UNITS = getCurrentAdUnits();

// 광고 설정
export const AD_CONFIG = {
  // 광고 표시 간격 설정
  intervals: {
    banner_refresh: 60000, // 60초마다 배너 새로고침
    interstitial_cooldown: 180000, // 3분 간격으로 전면 광고
    rewarded_cooldown: 300000 // 5분 간격으로 보상형 광고
  },

  // 광고 표시 조건
  conditions: {
    min_session_time: 30000, // 최소 30초 사용 후 광고 표시
    max_daily_ads: {
      interstitial: 10, // 일일 전면 광고 최대 10회
      rewarded: 5 // 일일 보상형 광고 최대 5회
    }
  },

  // 광고 타이밍 설정
  timing: {
    session_complete: true, // 타로 세션 완료 후 전면 광고
    app_launch: false, // 앱 실행 시 전면 광고 (사용자 경험을 위해 비활성화)
    tab_switch: false, // 탭 전환 시 광고 (사용자 경험을 위해 비활성화)
    reward_trigger: true // 보상 요청 시 보상형 광고
  },

  // 광고 크기 설정 (배너)
  banner: {
    size: 'banner', // 320x50
    position: 'bottom', // 화면 하단
    background_color: '#1a1625', // 앱 배경색과 매칭
    text_color: '#d4b8ff'
  },

  // 프리미엄 사용자 광고 제거
  premium: {
    remove_all_ads: true,
    show_premium_upgrade: true // 무료 사용자에게 프리미엄 업그레이드 유도
  }
};

// 광고 로드 타임아웃 설정
export const AD_TIMEOUTS = {
  banner_load: 10000, // 10초
  interstitial_load: 15000, // 15초
  rewarded_load: 20000 // 20초
};

// 광고 이벤트 추적용 키
export const AD_EVENTS = {
  BANNER_LOADED: 'ad_banner_loaded',
  BANNER_FAILED: 'ad_banner_failed',
  BANNER_CLICKED: 'ad_banner_clicked',

  INTERSTITIAL_LOADED: 'ad_interstitial_loaded',
  INTERSTITIAL_FAILED: 'ad_interstitial_failed',
  INTERSTITIAL_SHOWN: 'ad_interstitial_shown',
  INTERSTITIAL_DISMISSED: 'ad_interstitial_dismissed',

  REWARDED_LOADED: 'ad_rewarded_loaded',
  REWARDED_FAILED: 'ad_rewarded_failed',
  REWARDED_SHOWN: 'ad_rewarded_shown',
  REWARDED_EARNED: 'ad_rewarded_earned',
  REWARDED_DISMISSED: 'ad_rewarded_dismissed'
};

// 광고 위치별 설정
export const AD_PLACEMENTS = {
  main_screen: {
    banner: true,
    interstitial: false
  },
  session_complete: {
    banner: true,
    interstitial: true
  },
  journal_entry: {
    banner: true,
    interstitial: false
  },
  settings: {
    banner: false,
    interstitial: false
  },
  premium_upsell: {
    banner: false,
    interstitial: false,
    show_upgrade_cta: true
  }
};

// 개발자 정보 (실제 배포 시 수정 필요)
export const ADMOB_CONFIG = {
  app_id: {
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX', // iOS 앱 ID
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX' // Android 앱 ID
  },

  // 테스트 디바이스 ID (개발 시 실제 광고 테스트용)
  test_device_ids: [
    // 실제 디바이스 ID 추가 (AdMob 콘솔에서 확인 가능)
    // 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
  ]
};

// 광고 수익 추적
export const REVENUE_TRACKING = {
  enabled: true,
  currency: 'USD',
  precision: 6 // 소수점 자리수
};

// 광고 A/B 테스트 설정
export const AB_TEST_CONFIG = {
  enabled: false, // 초기에는 비활성화
  variants: {
    banner_position: ['top', 'bottom'],
    interstitial_timing: ['immediate', 'delayed'],
    reward_amount: ['1_session', '2_sessions']
  }
};

export default {
  AD_UNITS,
  AD_CONFIG,
  AD_TIMEOUTS,
  AD_EVENTS,
  AD_PLACEMENTS,
  ADMOB_CONFIG,
  REVENUE_TRACKING,
  AB_TEST_CONFIG
};