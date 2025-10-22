/**
 * 위젯 데이터 동기화 시스템
 * 앱과 위젯 간의 실시간 데이터 동기화 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { WidgetManager, WidgetData } from './widgetManager';
import { TimerService } from './timerService';

export interface SyncConfig {
  enabled: boolean;
  interval: number; // milliseconds
  retryCount: number;
  retryDelay: number; // milliseconds
  backgroundSync: boolean;
}

export interface SyncStatus {
  lastSync: string;
  isOnline: boolean;
  pendingChanges: number;
  lastError?: string;
  syncInProgress: boolean;
}

class WidgetSyncService {
  private static instance: WidgetSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private config: SyncConfig = {
    enabled: true,
    interval: 30000, // 30초마다 동기화
    retryCount: 3,
    retryDelay: 1000,
    backgroundSync: true
  };
  private status: SyncStatus = {
    lastSync: '',
    isOnline: navigator?.onLine ?? true,
    pendingChanges: 0,
    syncInProgress: false
  };
  private syncQueue: Array<() => Promise<void>> = [];
  private listeners: Array<(status: SyncStatus) => void> = [];

  // ✅ CRITICAL FIX: 이벤트 리스너 함수 참조 저장 (제거 시 동일 참조 필요)
  private boundOnlineHandler = this.handleOnlineStatusChange.bind(this);
  private boundOfflineHandler = this.handleOnlineStatusChange.bind(this);

  private constructor() {
    this.setupNetworkListeners();
  }

  public static getInstance(): WidgetSyncService {
    if (!WidgetSyncService.instance) {
      WidgetSyncService.instance = new WidgetSyncService();
    }
    return WidgetSyncService.instance;
  }

  /**
   * 동기화 서비스 초기화
   */
  public async initialize(config?: Partial<SyncConfig>): Promise<void> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 저장된 설정 로드
      await this.loadConfig();

      // 위젯 매니저 초기화
      await WidgetManager.initialize();

      // 자동 동기화 시작
      if (this.config.enabled) {
        this.startAutoSync();
      }

      this.isInitialized = true;
      console.log('[WidgetSync] 초기화 완료');
    } catch (error) {
      console.error('[WidgetSync] 초기화 오류:', error);
      throw error;
    }
  }

  /**
   * 설정 로드
   */
  private async loadConfig(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem('widget_sync_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('[WidgetSync] 설정 로드 오류:', error);
    }
  }

  /**
   * 설정 저장
   */
  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('widget_sync_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('[WidgetSync] 설정 저장 오류:', error);
    }
  }

  /**
   * 네트워크 리스너 설정
   */
  private setupNetworkListeners(): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // ✅ CRITICAL FIX: bind()로 생성한 함수 참조를 저장해서 제거 시 사용
      window.addEventListener('online', this.boundOnlineHandler);
      window.addEventListener('offline', this.boundOfflineHandler);
    }
  }

  /**
   * 온라인 상태 변경 핸들러
   */
  private handleOnlineStatusChange(): void {
    const wasOnline = this.status.isOnline;
    this.status.isOnline = navigator?.onLine ?? true;

    if (!wasOnline && this.status.isOnline) {
      // 온라인으로 변경된 경우 즉시 동기화
      console.log('[WidgetSync] 온라인 상태로 변경됨 - 동기화 시작');
      this.sync();
    }

    this.notifyListeners();
  }

  /**
   * 자동 동기화 시작
   */
  public startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.config.enabled && this.status.isOnline) {
        this.sync();
      }
    }, this.config.interval);

    console.log(`[WidgetSync] 자동 동기화 시작 (${this.config.interval}ms 간격)`);
  }

  /**
   * 자동 동기화 중지
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[WidgetSync] 자동 동기화 중지');
    }
  }

  /**
   * 즉시 동기화 실행
   */
  public async sync(force = false): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('[WidgetSync] 아직 초기화되지 않음');
      return false;
    }

    if (this.status.syncInProgress && !force) {
      console.log('[WidgetSync] 이미 동기화 중');
      return false;
    }

    if (!this.status.isOnline) {
      console.log('[WidgetSync] 오프라인 상태');
      return false;
    }

    try {
      this.status.syncInProgress = true;
      this.status.lastError = undefined;
      this.notifyListeners();

      console.log('[WidgetSync] 동기화 시작');

      // 현재 앱 상태에서 위젯 데이터 생성
      const widgetData = await this.generateWidgetData();

      // 위젯 데이터 업데이트
      await WidgetManager.updateWidgetData(widgetData);

      // 플랫폼별 위젯 업데이트 알림
      await this.notifyPlatformWidgets();

      // 동기화 상태 업데이트
      this.status.lastSync = new Date().toISOString();
      this.status.pendingChanges = 0;

      console.log('[WidgetSync] 동기화 완료');
      return true;

    } catch (error) {
      console.error('[WidgetSync] 동기화 오류:', error);
      this.status.lastError = error instanceof Error ? error.message : 'Unknown error';
      return false;

    } finally {
      this.status.syncInProgress = false;
      this.notifyListeners();
    }
  }

  /**
   * 앱 상태에서 위젯 데이터 생성
   */
  private async generateWidgetData(): Promise<WidgetData> {
    try {
      // 타이머 서비스에서 현재 상태 가져오기
      const timerData = await this.getCurrentTimerData();

      // 진행률 계산
      const progressData = await this.calculateProgress();

      // 연속 기록 가져오기
      const streakData = await this.getStreakData();

      return {
        cardName: timerData.currentCard || '오늘의 카드',
        progressText: `${progressData.completed}/${progressData.total} 완료`,
        progressPercent: Math.round((progressData.completed / progressData.total) * 100),
        timeRemaining: this.formatTimeRemaining(timerData.timeLeft),
        streakText: `${streakData.days}일 연속`,
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      console.error('[WidgetSync] 위젯 데이터 생성 오류:', error);

      // 기본 데이터 반환
      return {
        cardName: '오늘의 카드',
        progressText: '0/24 완료',
        progressPercent: 0,
        timeRemaining: '24시간 남음',
        streakText: '0일 연속',
        lastUpdate: new Date().toISOString()
      };
    }
  }

  /**
   * 현재 타이머 데이터 가져오기
   */
  private async getCurrentTimerData(): Promise<{
    currentCard: string;
    timeLeft: number;
  }> {
    try {
      // AsyncStorage에서 현재 상태 로드
      const currentCardData = await AsyncStorage.getItem('current_tarot_card');
      const timerState = await AsyncStorage.getItem('timer_state');

      let currentCard = '오늘의 카드';
      let timeLeft = 24 * 60 * 60 * 1000; // 24시간

      if (currentCardData) {
        const cardData = JSON.parse(currentCardData);
        currentCard = cardData.name || '오늘의 카드';
      }

      if (timerState) {
        const state = JSON.parse(timerState);
        const now = Date.now();
        const endTime = new Date(state.endTime).getTime();
        timeLeft = Math.max(0, endTime - now);
      }

      return { currentCard, timeLeft };

    } catch (error) {
      console.error('[WidgetSync] 타이머 데이터 로드 오류:', error);
      return {
        currentCard: '오늘의 카드',
        timeLeft: 24 * 60 * 60 * 1000
      };
    }
  }

  /**
   * 진행률 계산
   */
  private async calculateProgress(): Promise<{
    completed: number;
    total: number;
  }> {
    try {
      const progressData = await AsyncStorage.getItem('daily_progress');
      if (progressData) {
        const progress = JSON.parse(progressData);
        return {
          completed: progress.completed || 0,
          total: progress.total || 24
        };
      }
    } catch (error) {
      console.error('[WidgetSync] 진행률 로드 오류:', error);
    }

    return { completed: 0, total: 24 };
  }

  /**
   * 연속 기록 가져오기
   */
  private async getStreakData(): Promise<{ days: number }> {
    try {
      const streakData = await AsyncStorage.getItem('user_streak');
      if (streakData) {
        const streak = JSON.parse(streakData);
        return { days: streak.days || 0 };
      }
    } catch (error) {
      console.error('[WidgetSync] 연속 기록 로드 오류:', error);
    }

    return { days: 0 };
  }

  /**
   * 남은 시간 포맷팅
   */
  private formatTimeRemaining(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 남음`;
    } else if (minutes > 0) {
      return `${minutes}분 남음`;
    } else {
      return '곧 초기화';
    }
  }

  /**
   * 플랫폼별 위젯 업데이트 알림
   */
  private async notifyPlatformWidgets(): Promise<void> {
    try {
      switch (Platform.OS) {
        case 'ios':
          // iOS 위젯 업데이트 요청
          await this.updateiOSWidget();
          break;

        case 'android':
          // Android 위젯 업데이트 요청
          await this.updateAndroidWidget();
          break;

        case 'web':
          // PWA 위젯 업데이트 (브로드캐스트)
          await this.updatePWAWidget();
          break;
      }
    } catch (error) {
      console.error('[WidgetSync] 플랫폼 위젯 업데이트 오류:', error);
    }
  }

  /**
   * iOS 위젯 업데이트
   */
  private async updateiOSWidget(): Promise<void> {
    try {
      // React Native에서 iOS 네이티브 모듈 호출
      // 실제 구현 시에는 네이티브 브리지 필요
      console.log('[WidgetSync] iOS 위젯 업데이트 요청');
    } catch (error) {
      console.error('[WidgetSync] iOS 위젯 업데이트 오류:', error);
    }
  }

  /**
   * Android 위젯 업데이트
   */
  private async updateAndroidWidget(): Promise<void> {
    try {
      // React Native에서 Android 네이티브 모듈 호출
      // 실제 구현 시에는 네이티브 브리지 필요
      console.log('[WidgetSync] Android 위젯 업데이트 요청');
    } catch (error) {
      console.error('[WidgetSync] Android 위젯 업데이트 오류:', error);
    }
  }

  /**
   * PWA 위젯 업데이트
   */
  private async updatePWAWidget(): Promise<void> {
    try {
      // 브로드캐스트 채널을 통해 PWA 위젯에 업데이트 알림
      if (Platform.OS === 'web' && typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('tarot-timer-widget');
        channel.postMessage({
          type: 'WIDGET_UPDATE',
          timestamp: Date.now()
        });
        channel.close();
      }
      console.log('[WidgetSync] PWA 위젯 업데이트 요청');
    } catch (error) {
      console.error('[WidgetSync] PWA 위젯 업데이트 오류:', error);
    }
  }

  /**
   * 동기화 상태 리스너 추가
   */
  public addStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 동기화 상태 리스너 제거
   */
  public removeStatusListener(listener: (status: SyncStatus) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 리스너들에게 상태 변경 알림
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('[WidgetSync] 리스너 알림 오류:', error);
      }
    });
  }

  /**
   * 설정 업데이트
   */
  public async updateConfig(newConfig: Partial<SyncConfig>): Promise<void> {
    const oldEnabled = this.config.enabled;
    this.config = { ...this.config, ...newConfig };

    await this.saveConfig();

    // 자동 동기화 설정이 변경된 경우
    if (oldEnabled !== this.config.enabled) {
      if (this.config.enabled) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }

    console.log('[WidgetSync] 설정 업데이트됨:', this.config);
  }

  /**
   * 현재 상태 가져오기
   */
  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * 현재 설정 가져오기
   */
  public getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * 서비스 정리
   */
  public cleanup(): void {
    this.stopAutoSync();
    this.listeners = [];

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // ✅ CRITICAL FIX: 등록 시 사용한 동일한 함수 참조로 제거
      window.removeEventListener('online', this.boundOnlineHandler);
      window.removeEventListener('offline', this.boundOfflineHandler);
    }

    console.log('[WidgetSync] 서비스 정리 완료');
  }
}

// 싱글톤 인스턴스 내보내기
export const WidgetSync = WidgetSyncService.getInstance();

// React Hook for using widget sync
import { useState, useEffect } from 'react';

export const useWidgetSync = () => {
  const [status, setStatus] = useState<SyncStatus>(WidgetSync.getStatus());
  const [config, setConfig] = useState<SyncConfig>(WidgetSync.getConfig());

  useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };

    WidgetSync.addStatusListener(handleStatusChange);

    return () => {
      WidgetSync.removeStatusListener(handleStatusChange);
    };
  }, []);

  const sync = async (force = false) => {
    return await WidgetSync.sync(force);
  };

  const updateConfig = async (newConfig: Partial<SyncConfig>) => {
    await WidgetSync.updateConfig(newConfig);
    setConfig(WidgetSync.getConfig());
  };

  return {
    status,
    config,
    sync,
    updateConfig,
    isOnline: status.isOnline,
    isSyncing: status.syncInProgress,
    lastSync: status.lastSync,
    lastError: status.lastError
  };
};