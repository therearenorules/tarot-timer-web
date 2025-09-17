/**
 * iOS 성능 최적화 유틸리티
 * iPhone에서의 앱 성능을 최적화하는 기능들을 제공
 */

import { Platform, InteractionManager, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface iOSOptimizationConfig {
  enableBackgroundSync: boolean;
  enablePushNotifications: boolean;
  enableHapticFeedback: boolean;
  enableReducedMotion: boolean;
  memoryThreshold: number; // MB
  performanceMode: 'auto' | 'performance' | 'battery';
}

class iOSOptimizationService {
  private static instance: iOSOptimizationService;
  private config: iOSOptimizationConfig = {
    enableBackgroundSync: true,
    enablePushNotifications: true,
    enableHapticFeedback: true,
    enableReducedMotion: false,
    memoryThreshold: 150, // 150MB
    performanceMode: 'auto'
  };
  private isInitialized = false;
  private performanceMetrics = {
    memoryUsage: 0,
    batteryLevel: 1.0,
    thermalState: 'normal' as 'normal' | 'fair' | 'serious' | 'critical',
    lowPowerMode: false
  };

  private constructor() {}

  public static getInstance(): iOSOptimizationService {
    if (!iOSOptimizationService.instance) {
      iOSOptimizationService.instance = new iOSOptimizationService();
    }
    return iOSOptimizationService.instance;
  }

  /**
   * iOS 최적화 서비스 초기화
   */
  public async initialize(): Promise<void> {
    if (!Platform.OS === 'ios') {
      console.log('[iOSOptimization] iOS가 아닙니다. 건너뜀.');
      return;
    }

    try {
      console.log('[iOSOptimization] iOS 최적화 서비스 초기화 시작');

      // 저장된 설정 로드
      await this.loadConfig();

      // 초기 성능 측정
      await this.measurePerformance();

      // 자동 성능 모니터링 시작
      this.startPerformanceMonitoring();

      // 메모리 경고 리스너 설정
      this.setupMemoryWarningListener();

      this.isInitialized = true;
      console.log('[iOSOptimization] 초기화 완료');

    } catch (error) {
      console.error('[iOSOptimization] 초기화 오류:', error);
    }
  }

  /**
   * 설정 로드
   */
  private async loadConfig(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem('ios_optimization_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('[iOSOptimization] 설정 로드 오류:', error);
    }
  }

  /**
   * 설정 저장
   */
  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('ios_optimization_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('[iOSOptimization] 설정 저장 오류:', error);
    }
  }

  /**
   * 성능 측정
   */
  private async measurePerformance(): Promise<void> {
    try {
      // 메모리 사용량 측정 (시뮬레이션)
      if (global.gc) {
        global.gc();
      }

      // iOS에서는 실제 배터리 정보나 열 상태를 정확히 측정하기 어려우므로
      // 시뮬레이션된 값들을 사용
      this.performanceMetrics = {
        memoryUsage: this.estimateMemoryUsage(),
        batteryLevel: 0.8, // 80% 가정
        thermalState: 'normal',
        lowPowerMode: false
      };

      console.log('[iOSOptimization] 성능 측정 완료:', this.performanceMetrics);

    } catch (error) {
      console.error('[iOSOptimization] 성능 측정 오류:', error);
    }
  }

  /**
   * 메모리 사용량 추정
   */
  private estimateMemoryUsage(): number {
    try {
      // React Native에서 정확한 메모리 측정은 어려우므로 추정값 사용
      const estimatedUsage = Math.random() * 100 + 50; // 50-150MB 범위
      return Math.round(estimatedUsage);
    } catch (error) {
      return 100; // 기본값
    }
  }

  /**
   * 성능 모니터링 시작
   */
  private startPerformanceMonitoring(): void {
    // 30초마다 성능 측정
    setInterval(() => {
      this.measurePerformance().then(() => {
        this.optimizeBasedOnPerformance();
      });
    }, 30000);
  }

  /**
   * 성능 기반 자동 최적화
   */
  private optimizeBasedOnPerformance(): void {
    const { memoryUsage, lowPowerMode } = this.performanceMetrics;

    // 메모리 사용량이 임계값을 초과하면 최적화 모드 활성화
    if (memoryUsage > this.config.memoryThreshold) {
      console.log('[iOSOptimization] 높은 메모리 사용량 감지, 최적화 모드 활성화');
      this.enablePerformanceMode();
    }

    // 저전력 모드에서 최적화
    if (lowPowerMode) {
      console.log('[iOSOptimization] 저전력 모드 감지, 배터리 절약 모드 활성화');
      this.enableBatterySavingMode();
    }
  }

  /**
   * 성능 모드 활성화
   */
  private enablePerformanceMode(): void {
    // 애니메이션 감소
    this.config.enableReducedMotion = true;

    // 백그라운드 동기화 빈도 감소
    this.config.enableBackgroundSync = false;

    // 햅틱 피드백 비활성화
    this.config.enableHapticFeedback = false;

    this.saveConfig();
    console.log('[iOSOptimization] 성능 모드 활성화됨');
  }

  /**
   * 배터리 절약 모드 활성화
   */
  private enableBatterySavingMode(): void {
    this.config.performanceMode = 'battery';
    this.config.enableBackgroundSync = false;
    this.config.enableHapticFeedback = false;

    this.saveConfig();
    console.log('[iOSOptimization] 배터리 절약 모드 활성화됨');
  }

  /**
   * 메모리 경고 리스너 설정
   */
  private setupMemoryWarningListener(): void {
    // React Native에서는 직접적인 메모리 경고 이벤트가 없으므로
    // 주기적으로 메모리 사용량을 체크
    setInterval(() => {
      if (this.performanceMetrics.memoryUsage > this.config.memoryThreshold * 1.5) {
        this.handleMemoryWarning();
      }
    }, 10000);
  }

  /**
   * 메모리 경고 처리
   */
  private handleMemoryWarning(): void {
    console.warn('[iOSOptimization] 메모리 경고 발생');

    // 메모리 정리 시도
    if (global.gc) {
      global.gc();
    }

    // 사용자에게 알림 (선택적)
    if (__DEV__) {
      Alert.alert(
        '성능 최적화',
        '앱의 메모리 사용량이 높습니다. 성능 최적화를 적용합니다.',
        [{ text: '확인' }]
      );
    }

    // 강제 성능 모드 활성화
    this.enablePerformanceMode();
  }

  /**
   * 지연된 실행 (성능 최적화)
   */
  public runAfterInteractions(callback: () => void): void {
    InteractionManager.runAfterInteractions(() => {
      // 추가 지연으로 더 부드러운 실행
      setTimeout(callback, 0);
    });
  }

  /**
   * 햅틱 피드백 실행 (최적화됨)
   */
  public triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (!this.config.enableHapticFeedback || Platform.OS !== 'ios') {
      return;
    }

    try {
      // React Native Haptics 사용 시뮬레이션
      console.log(`[iOSOptimization] 햅틱 피드백 실행: ${type}`);
    } catch (error) {
      console.error('[iOSOptimization] 햅틱 피드백 오류:', error);
    }
  }

  /**
   * 애니메이션 최적화 설정 반환
   */
  public getAnimationConfig(): {
    useNativeDriver: boolean;
    duration: number;
    easing: string;
  } {
    const baseConfig = {
      useNativeDriver: true,
      duration: 300,
      easing: 'ease-in-out'
    };

    if (this.config.enableReducedMotion) {
      return {
        ...baseConfig,
        duration: 150, // 50% 더 빠름
      };
    }

    return baseConfig;
  }

  /**
   * 현재 성능 메트릭 반환
   */
  public getPerformanceMetrics(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * 현재 설정 반환
   */
  public getConfig(): iOSOptimizationConfig {
    return { ...this.config };
  }

  /**
   * 설정 업데이트
   */
  public async updateConfig(newConfig: Partial<iOSOptimizationConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfig();
    console.log('[iOSOptimization] 설정 업데이트됨:', this.config);
  }

  /**
   * 서비스 정리
   */
  public cleanup(): void {
    // 정리 작업이 필요한 경우 여기에 추가
    console.log('[iOSOptimization] 서비스 정리 완료');
  }
}

// 싱글톤 인스턴스 내보내기
export const iOSOptimization = iOSOptimizationService.getInstance();

// React Hook
import { useState, useEffect } from 'react';

export const useiOSOptimization = () => {
  const [metrics, setMetrics] = useState(iOSOptimization.getPerformanceMetrics());
  const [config, setConfig] = useState(iOSOptimization.getConfig());

  useEffect(() => {
    // 성능 메트릭 주기적 업데이트
    const interval = setInterval(() => {
      setMetrics(iOSOptimization.getPerformanceMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateConfig = async (newConfig: Partial<iOSOptimizationConfig>) => {
    await iOSOptimization.updateConfig(newConfig);
    setConfig(iOSOptimization.getConfig());
  };

  return {
    metrics,
    config,
    updateConfig,
    runAfterInteractions: iOSOptimization.runAfterInteractions.bind(iOSOptimization),
    triggerHapticFeedback: iOSOptimization.triggerHapticFeedback.bind(iOSOptimization),
    getAnimationConfig: iOSOptimization.getAnimationConfig.bind(iOSOptimization),
  };
};