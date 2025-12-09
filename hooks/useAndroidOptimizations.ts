/**
 * Android 플랫폼 최적화 Hook
 * 안드로이드 기기에서 자동으로 최적화 적용
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import {
  AndroidBackHandler,
  AndroidMemoryOptimizer,
  AndroidPerformanceMonitor,
  androidVibrate,
  AndroidVibrationPatterns,
  showAndroidToast,
  getAndroidDeviceInfo,
  getDeviceOptimizations
} from '../utils/androidOptimizations';

/**
 * Android 뒤로가기 버튼 최적화
 */
export const useAndroidBackButton = (
  onBackPress?: () => boolean,
  deps: any[] = []
): void => {
  useEffect(() => {
    if (Platform.OS !== 'android' || !onBackPress) return;

    const cleanup = AndroidBackHandler.addHandler(onBackPress);
    return cleanup;
  }, [...deps, onBackPress]);
};

/**
 * Android 뒤로가기 더블 탭으로 앱 종료
 */
export const useAndroidDoubleBackExit = (
  message: string = '한 번 더 누르면 앱이 종료됩니다'
): void => {
  const lastBackPressRef = useRef<number>(0);

  const handleBackPress = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastBackPressRef.current;

    if (timeDiff < 2000) {
      // 2초 이내 다시 누르면 종료
      AndroidBackHandler.exitApp();
      return true;
    }

    // 첫 번째 탭
    lastBackPressRef.current = now;
    showAndroidToast(message, 'SHORT');
    return true;
  }, [message]);

  useAndroidBackButton(handleBackPress, [handleBackPress]);
};

/**
 * Android 햅틱 피드백
 */
export const useAndroidHaptics = () => {
  const vibrate = useCallback((pattern?: 'tap' | 'success' | 'error' | 'warning' | 'longPress') => {
    if (Platform.OS !== 'android') return;

    if (pattern && AndroidVibrationPatterns[pattern]) {
      androidVibrate(AndroidVibrationPatterns[pattern]);
    } else {
      androidVibrate(50); // 기본 50ms
    }
  }, []);

  return { vibrate };
};

/**
 * Android 토스트 메시지
 */
export const useAndroidToast = () => {
  const showToast = useCallback((message: string, duration?: 'SHORT' | 'LONG') => {
    if (Platform.OS !== 'android') return;
    showAndroidToast(message, duration);
  }, []);

  return { showToast };
};

/**
 * Android 메모리 최적화
 */
export const useAndroidMemoryOptimization = (
  onLowMemory?: () => void
): void => {
  useEffect(() => {
    if (Platform.OS !== 'android' || !onLowMemory) return;

    const cleanup = AndroidMemoryOptimizer.addLowMemoryListener(onLowMemory);
    return cleanup;
  }, [onLowMemory]);
};

/**
 * Android 성능 모니터링
 */
export const useAndroidPerformanceMonitoring = (
  componentName: string
) => {
  const startMeasure = useCallback((label: string) => {
    if (Platform.OS !== 'android') return;
    AndroidPerformanceMonitor.startMeasure(`${componentName}:${label}`);
  }, [componentName]);

  const endMeasure = useCallback((label: string) => {
    if (Platform.OS !== 'android') return null;
    return AndroidPerformanceMonitor.endMeasure(`${componentName}:${label}`);
  }, [componentName]);

  return { startMeasure, endMeasure };
};

/**
 * Android 앱 상태 최적화
 */
export const useAndroidAppStateOptimization = (
  onBackground?: () => void,
  onForeground?: () => void
): void => {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Background로 전환
      if (
        appStateRef.current.match(/active|foreground/) &&
        nextAppState === 'background'
      ) {
        onBackground?.();

        // 메모리 정리 권장
        AndroidMemoryOptimizer.requestMemoryCleanup();
      }

      // Foreground로 전환
      if (
        appStateRef.current === 'background' &&
        nextAppState.match(/active|foreground/)
      ) {
        onForeground?.();
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [onBackground, onForeground]);
};

/**
 * Android 디바이스 정보
 */
export const useAndroidDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [optimizations, setOptimizations] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const loadInfo = async () => {
      const info = await getAndroidDeviceInfo();
      const opts = await getDeviceOptimizations();

      setDeviceInfo(info);
      setOptimizations(opts);

      console.log('📱 Android Device Info:', info);
      console.log('⚡ Android Optimizations:', opts);
    };

    loadInfo();
  }, []);

  return { deviceInfo, optimizations };
};

/**
 * Android 리스트 성능 최적화 Props
 */
export const useAndroidListOptimization = () => {
  if (Platform.OS !== 'android') {
    return {};
  }

  return {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 10,
    windowSize: 21,
    // Android용 추가 최적화
    getItemLayout: undefined, // 동적 높이 사용 시 제거
    scrollEventThrottle: 16, // 60fps
  };
};

/**
 * Android 이미지 최적화
 */
export const useAndroidImageOptimization = () => {
  const getOptimizedSource = useCallback((uri: string, quality?: number) => {
    if (Platform.OS !== 'android') {
      return { uri };
    }

    // Android용 이미지 최적화
    return {
      uri,
      cache: 'force-cache' as const,
      priority: 'normal' as const,
    };
  }, []);

  return { getOptimizedSource };
};

/**
 * Android 키보드 최적화
 */
export const useAndroidKeyboard = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const showSubscription = Platform.OS === 'android'
      ? require('react-native').Keyboard.addListener('keyboardDidShow', () => {
          setKeyboardVisible(true);
        })
      : null;

    const hideSubscription = Platform.OS === 'android'
      ? require('react-native').Keyboard.addListener('keyboardDidHide', () => {
          setKeyboardVisible(false);
        })
      : null;

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  return { keyboardVisible };
};

/**
 * Android 애니메이션 최적화
 */
export const useAndroidAnimationConfig = () => {
  if (Platform.OS !== 'android') {
    return {
      useNativeDriver: true,
      duration: 250
    };
  }

  return {
    useNativeDriver: true,
    duration: 250,
    // Android Hermes 엔진 최적화
    isInteraction: true
  };
};

export default {
  useAndroidBackButton,
  useAndroidDoubleBackExit,
  useAndroidHaptics,
  useAndroidToast,
  useAndroidMemoryOptimization,
  useAndroidPerformanceMonitoring,
  useAndroidAppStateOptimization,
  useAndroidDeviceInfo,
  useAndroidListOptimization,
  useAndroidImageOptimization,
  useAndroidKeyboard,
  useAndroidAnimationConfig
};
