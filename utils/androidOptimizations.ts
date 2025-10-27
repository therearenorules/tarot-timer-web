/**
 * Android 플랫폼 최적화 유틸리티
 * 안드로이드 기기에서 최적의 성능과 사용자 경험 제공
 */

import { Platform, BackHandler, ToastAndroid, Vibration } from 'react-native';
import * as Device from 'expo-device';

/**
 * Android 플랫폼 체크
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Android 버전 정보
 */
export const getAndroidVersion = (): number | null => {
  if (!isAndroid) return null;
  return Platform.Version as number;
};

/**
 * Android 12 이상 체크 (Material You 지원)
 */
export const isAndroid12Plus = (): boolean => {
  const version = getAndroidVersion();
  return version !== null && version >= 31; // Android 12 = API 31
};

/**
 * Android 토스트 메시지 (네이티브 안드로이드 스타일)
 */
export const showAndroidToast = (message: string, duration: 'SHORT' | 'LONG' = 'SHORT'): void => {
  if (!isAndroid) return;

  const toastDuration = duration === 'SHORT'
    ? ToastAndroid.SHORT
    : ToastAndroid.LONG;

  ToastAndroid.show(message, toastDuration);
};

/**
 * Android 뒤로가기 버튼 핸들러
 */
export class AndroidBackHandler {
  private static handlers: Set<() => boolean> = new Set();
  private static subscription: any = null;

  /**
   * 뒤로가기 핸들러 등록
   * @returns cleanup 함수
   */
  static addHandler(handler: () => boolean): () => void {
    this.handlers.add(handler);

    // 첫 핸들러 등록 시 subscription 생성
    if (this.handlers.size === 1 && !this.subscription) {
      this.subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        // 가장 최근 등록된 핸들러부터 실행
        const handlersArray = Array.from(this.handlers).reverse();

        for (const h of handlersArray) {
          if (h()) return true; // 핸들러가 true 반환하면 기본 동작 방지
        }

        return false; // 모든 핸들러가 false면 기본 동작 수행
      });
    }

    // cleanup 함수 반환
    return () => {
      this.handlers.delete(handler);

      // 모든 핸들러 제거 시 subscription 해제
      if (this.handlers.size === 0 && this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }
    };
  }

  /**
   * 앱 종료 (더블 탭 패턴)
   */
  static exitApp(): void {
    if (!isAndroid) return;
    BackHandler.exitApp();
  }
}

/**
 * Android 햅틱 피드백 (진동)
 */
export const androidVibrate = (pattern?: number | number[]): void => {
  if (!isAndroid) return;

  if (Array.isArray(pattern)) {
    Vibration.vibrate(pattern);
  } else {
    Vibration.vibrate(pattern || 50); // 기본 50ms
  }
};

/**
 * Android 진동 패턴
 */
export const AndroidVibrationPatterns = {
  // 짧은 탭
  tap: [0, 50],
  // 성공
  success: [0, 100, 50, 100],
  // 오류
  error: [0, 200, 100, 200],
  // 경고
  warning: [0, 100, 50, 100, 50, 100],
  // 긴 프레스
  longPress: [0, 500]
};

/**
 * Android 메모리 최적화
 */
export class AndroidMemoryOptimizer {
  private static lowMemoryListeners: Set<() => void> = new Set();

  /**
   * 메모리 부족 리스너 등록
   */
  static addLowMemoryListener(listener: () => void): () => void {
    this.lowMemoryListeners.add(listener);

    // cleanup 함수
    return () => {
      this.lowMemoryListeners.delete(listener);
    };
  }

  /**
   * 메모리 정리 권장
   */
  static requestMemoryCleanup(): void {
    this.lowMemoryListeners.forEach(listener => listener());
  }

  /**
   * 이미지 캐시 크기 제한 (Android용)
   */
  static getImageCacheLimit(): number {
    const version = getAndroidVersion();

    // Android 12+ : 더 큰 캐시 허용
    if (version && version >= 31) {
      return 150; // 150MB
    }

    // Android 8-11
    if (version && version >= 26) {
      return 100; // 100MB
    }

    // Android 7 이하
    return 50; // 50MB
  }
}

/**
 * Android 배터리 최적화
 */
export class AndroidBatteryOptimizer {
  /**
   * 배터리 최적화 모드 체크
   */
  static isInBatterySaverMode(): boolean {
    // expo-battery 사용하여 구현 가능
    // 현재는 기본값 반환
    return false;
  }

  /**
   * 배터리 최적화 설정 권장
   */
  static getOptimizationRecommendations(): {
    reduceAnimations: boolean;
    reduceSyncFrequency: boolean;
    disableBackgroundTasks: boolean;
  } {
    const isBatterySaver = this.isInBatterySaverMode();

    return {
      reduceAnimations: isBatterySaver,
      reduceSyncFrequency: isBatterySaver,
      disableBackgroundTasks: isBatterySaver
    };
  }
}

/**
 * Android 키보드 최적화
 */
export const AndroidKeyboardConfig = {
  /**
   * 키보드 모드 (app.json에 이미 설정됨)
   */
  softwareKeyboardLayoutMode: 'pan' as const,

  /**
   * 키보드 타입별 최적 설정
   */
  getKeyboardType(inputType: 'text' | 'email' | 'number' | 'phone'): string {
    const types = {
      text: 'default',
      email: 'email-address',
      number: 'numeric',
      phone: 'phone-pad'
    };

    return types[inputType] || 'default';
  },

  /**
   * 자동 완성 설정
   */
  autoCompleteType: {
    email: 'email',
    password: 'password',
    name: 'name',
    phone: 'tel',
    address: 'postal-address'
  } as const
};

/**
 * Android 네트워크 최적화
 */
export class AndroidNetworkOptimizer {
  /**
   * 네트워크 타입별 데이터 사용 제한
   */
  static getDataUsageLimit(networkType?: string): {
    maxImageQuality: number;
    enableLargeAssets: boolean;
    prefetchEnabled: boolean;
  } {
    // WiFi 연결 시
    if (networkType === 'wifi') {
      return {
        maxImageQuality: 1.0,
        enableLargeAssets: true,
        prefetchEnabled: true
      };
    }

    // 모바일 데이터 시 (기본값)
    return {
      maxImageQuality: 0.8,
      enableLargeAssets: false,
      prefetchEnabled: false
    };
  }

  /**
   * 이미지 압축 품질 (Android 최적화)
   */
  static getImageCompressionQuality(): number {
    const version = getAndroidVersion();

    // Android 12+ : WebP 지원으로 더 나은 압축
    if (version && version >= 31) {
      return 0.85;
    }

    // 이전 버전
    return 0.75;
  }
}

/**
 * Android 권한 관리
 */
export const AndroidPermissions = {
  /**
   * 필수 권한 목록 (app.json과 동기화)
   */
  required: [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.WAKE_LOCK',
    'android.permission.VIBRATE',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.SCHEDULE_EXACT_ALARM',
    'android.permission.USE_EXACT_ALARM',
    'com.android.vending.BILLING',
    'com.google.android.gms.permission.AD_ID'
  ] as const,

  /**
   * 권한 설명
   */
  descriptions: {
    'POST_NOTIFICATIONS': '24시간 타로 학습 알림',
    'SCHEDULE_EXACT_ALARM': '정확한 시간에 알림 전송',
    'VIBRATE': '햅틱 피드백',
    'BILLING': '프리미엄 구독',
    'AD_ID': '광고 개인화'
  }
};

/**
 * Android 성능 모니터링
 */
export class AndroidPerformanceMonitor {
  private static metrics: Map<string, number> = new Map();

  /**
   * 작업 시작 시간 기록
   */
  static startMeasure(label: string): void {
    this.metrics.set(label, Date.now());
  }

  /**
   * 작업 종료 및 시간 측정
   */
  static endMeasure(label: string): number | null {
    const startTime = this.metrics.get(label);
    if (!startTime) return null;

    const duration = Date.now() - startTime;
    this.metrics.delete(label);

    // Android에서 느린 작업 경고 (200ms 이상)
    if (duration > 200) {
      console.warn(`[Android Performance] ${label} took ${duration}ms`);
    }

    return duration;
  }

  /**
   * 프레임 드롭 모니터링 (60fps 기준)
   */
  static checkFrameDrop(actualFps: number): boolean {
    const targetFps = 60;
    const dropThreshold = 10; // 10fps 이하 드롭은 경고

    return (targetFps - actualFps) > dropThreshold;
  }
}

/**
 * Android UI 최적화 상수
 */
export const AndroidUIConfig = {
  /**
   * 터치 피드백 딜레이 (Android 권장)
   */
  touchFeedbackDelay: 100, // ms

  /**
   * 리스트 아이템 높이 (성능 최적화)
   */
  listItemHeight: 72, // Material Design 권장

  /**
   * 스크롤 성능 설정
   */
  scrollConfig: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 10,
    windowSize: 21
  },

  /**
   * 애니메이션 지속 시간 (Android 권장)
   */
  animationDuration: {
    fast: 150,
    normal: 250,
    slow: 350
  }
};

/**
 * Android 디바이스 정보
 */
export const getAndroidDeviceInfo = async () => {
  if (!isAndroid) return null;

  return {
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
    osVersion: Platform.Version,
    isDevice: Device.isDevice,
    deviceType: Device.deviceType,
    // Samsung, Xiaomi 등 제조사별 최적화 가능
    isSamsung: Device.manufacturer?.toLowerCase().includes('samsung'),
    isXiaomi: Device.manufacturer?.toLowerCase().includes('xiaomi'),
    isHuawei: Device.manufacturer?.toLowerCase().includes('huawei')
  };
};

/**
 * Android 디바이스별 최적화 설정
 */
export const getDeviceOptimizations = async () => {
  const deviceInfo = await getAndroidDeviceInfo();
  if (!deviceInfo) return null;

  // Samsung 기기 최적화
  if (deviceInfo.isSamsung) {
    return {
      useNativeDriver: true,
      enableHermes: true,
      animationScale: 1.0
    };
  }

  // Xiaomi 기기 최적화
  if (deviceInfo.isXiaomi) {
    return {
      useNativeDriver: true,
      enableHermes: true,
      animationScale: 0.9 // 약간 빠른 애니메이션
    };
  }

  // 기본 설정
  return {
    useNativeDriver: true,
    enableHermes: true,
    animationScale: 1.0
  };
};

export default {
  isAndroid,
  getAndroidVersion,
  isAndroid12Plus,
  showAndroidToast,
  AndroidBackHandler,
  androidVibrate,
  AndroidVibrationPatterns,
  AndroidMemoryOptimizer,
  AndroidBatteryOptimizer,
  AndroidKeyboardConfig,
  AndroidNetworkOptimizer,
  AndroidPermissions,
  AndroidPerformanceMonitor,
  AndroidUIConfig,
  getAndroidDeviceInfo,
  getDeviceOptimizations
};
