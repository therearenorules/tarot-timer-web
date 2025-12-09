/**
 * 위젯 데이터 관리 시스템
 * iOS Widget Extension, Android App Widget, PWA Widget 지원
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalStorageManager, { TarotSession, UserSettings } from './localStorage';

// 위젯 데이터 타입 정의
export interface WidgetData {
  currentCard?: {
    id: string;
    name: string;
    suit?: string;
    meaning?: string;
    image?: string;
    timestamp: string;
  };
  dailyProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  lastUpdate: string;
  timeRemaining?: {
    hours: number;
    minutes: number;
    seconds: number;
  } | string; // 문자열 형식도 허용 (widgetSync 호환)
  nextCardTime?: string;
  streak: number;
  userSettings: {
    showCard: boolean;
    showProgress: boolean;
    showTimer: boolean;
    theme: 'light' | 'dark' | 'mystical';
  };
  // 추가 필드 (widgetSync 호환용)
  cardName?: string;
  progressText?: string;
  progressPercent?: number;
  streakText?: string;
}

// 위젯 설정 타입
export interface WidgetSettings {
  enabled: boolean;
  updateInterval: number; // 분 단위
  showNotifications: boolean;
  autoRefresh: boolean;
  size: 'small' | 'medium' | 'large';
  style: 'minimal' | 'detailed' | 'mystical';
}

// 위젯 저장 키
const WIDGET_STORAGE_KEYS = {
  DATA: 'widget_data',
  SETTINGS: 'widget_settings',
  LAST_UPDATE: 'widget_last_update',
  SYNC_STATUS: 'widget_sync_status'
} as const;

export class WidgetManager {
  private static updateInterval: NodeJS.Timeout | null = null;
  private static isInitialized = false;

  /**
   * 위젯 매니저 초기화
   */
  static async initialize(): Promise<boolean> {
    try {
      console.log('🔧 위젯 매니저 초기화 시작...');

      // 기본 설정 로드 또는 생성
      await this.ensureDefaultSettings();

      // 초기 위젯 데이터 생성
      await this.updateWidgetData();

      // 자동 업데이트 시작
      await this.startAutoUpdate();

      this.isInitialized = true;
      console.log('✅ 위젯 매니저 초기화 완료');
      return true;

    } catch (error) {
      console.error('❌ 위젯 매니저 초기화 오류:', error);
      return false;
    }
  }

  /**
   * 기본 위젯 설정 보장
   */
  private static async ensureDefaultSettings(): Promise<void> {
    try {
      const existingSettings = await this.getWidgetSettings();

      if (!existingSettings) {
        const defaultSettings: WidgetSettings = {
          enabled: true,
          updateInterval: 5, // 5분마다 업데이트
          showNotifications: true,
          autoRefresh: true,
          size: 'medium',
          style: 'mystical'
        };

        await this.saveWidgetSettings(defaultSettings);
        console.log('📱 기본 위젯 설정 생성 완료');
      }
    } catch (error) {
      console.error('❌ 기본 설정 보장 오류:', error);
      throw error;
    }
  }

  /**
   * 현재 위젯 데이터 조회
   */
  static async getWidgetData(): Promise<WidgetData | null> {
    try {
      const dataStr = await AsyncStorage.getItem(WIDGET_STORAGE_KEYS.DATA);
      if (!dataStr) return null;

      const data: WidgetData = JSON.parse(dataStr);

      // 데이터 유효성 검증
      if (this.isValidWidgetData(data)) {
        return data;
      }

      console.warn('⚠️ 위젯 데이터가 유효하지 않습니다. 새로 생성합니다.');
      return await this.updateWidgetData();

    } catch (error) {
      console.error('❌ 위젯 데이터 조회 오류:', error);
      return null;
    }
  }

  /**
   * 위젯 데이터 업데이트
   */
  static async updateWidgetData(): Promise<WidgetData> {
    try {
      console.log('🔄 위젯 데이터 업데이트 시작...');

      // 현재 타로 세션 데이터 조회
      const sessions = await LocalStorageManager.getTarotSessions();
      const userSettings = await LocalStorageManager.getUserSettings();

      // 오늘의 세션 필터링
      const today = new Date();
      const todaySessions = sessions.filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate.toDateString() === today.toDateString();
      });

      // 현재 활성 카드 조회
      const currentCard = await this.getCurrentCard(todaySessions);

      // 일일 진행률 계산
      const dailyProgress = this.calculateDailyProgress(todaySessions);

      // 남은 시간 계산
      const timeRemaining = this.calculateTimeRemaining();

      // 다음 카드 시간 계산
      const nextCardTime = this.calculateNextCardTime();

      // 연속 기록 계산
      const streak = await this.calculateStreak(sessions);

      // 위젯 데이터 구성
      const widgetData: WidgetData = {
        currentCard,
        dailyProgress,
        lastUpdate: new Date().toISOString(),
        timeRemaining,
        nextCardTime,
        streak,
        userSettings: {
          showCard: true,
          showProgress: true,
          showTimer: true,
          theme: userSettings.theme === 'mystical_dark' ? 'mystical' : 'dark'
        }
      };

      // 위젯 데이터 저장
      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.DATA,
        JSON.stringify(widgetData)
      );

      // 플랫폼별 위젯 업데이트 호출
      await this.notifyPlatformWidgets(widgetData);

      console.log('✅ 위젯 데이터 업데이트 완료');
      return widgetData;

    } catch (error) {
      console.error('❌ 위젯 데이터 업데이트 오류:', error);
      throw error;
    }
  }

  /**
   * 현재 활성 카드 조회
   */
  private static async getCurrentCard(sessions: TarotSession[]): Promise<WidgetData['currentCard']> {
    try {
      // 오늘의 가장 최근 세션에서 카드 조회
      const latestSession = sessions
        .filter(s => s.cards_drawn && s.cards_drawn.length > 0)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      if (!latestSession || !latestSession.cards_drawn[0]) {
        return undefined;
      }

      const card = latestSession.cards_drawn[0];
      return {
        id: card.id,
        name: card.name,
        suit: card.suit,
        meaning: card.meaning,
        image: `/assets/tarot-cards/${card.id}.png`, // 카드 이미지 경로
        timestamp: latestSession.created_at
      };

    } catch (error) {
      console.error('❌ 현재 카드 조회 오류:', error);
      return undefined;
    }
  }

  /**
   * 일일 진행률 계산
   */
  private static calculateDailyProgress(sessions: TarotSession[]): WidgetData['dailyProgress'] {
    const completedSessions = sessions.filter(s => s.is_completed).length;
    const totalExpected = 24; // 24시간 타이머
    const percentage = Math.round((completedSessions / totalExpected) * 100);

    return {
      completed: completedSessions,
      total: totalExpected,
      percentage: Math.min(percentage, 100)
    };
  }

  /**
   * 남은 시간 계산 (자정까지)
   */
  private static calculateTimeRemaining(): WidgetData['timeRemaining'] {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // 다음 날 자정

    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }

  /**
   * 다음 카드 시간 계산
   */
  private static calculateNextCardTime(): string {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);

    return nextHour.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 연속 기록 계산
   */
  private static async calculateStreak(sessions: TarotSession[]): Promise<number> {
    try {
      const dailySessions = new Map<string, boolean>();

      // 날짜별로 세션 완료 여부 체크
      sessions.forEach(session => {
        if (session.is_completed) {
          const date = new Date(session.created_at).toDateString();
          dailySessions.set(date, true);
        }
      });

      // 연속 기록 계산
      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) { // 최대 1년간 체크
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toDateString();

        if (dailySessions.has(dateStr)) {
          streak++;
        } else {
          break; // 연속 기록 중단
        }
      }

      return streak;

    } catch (error) {
      console.error('❌ 연속 기록 계산 오류:', error);
      return 0;
    }
  }

  /**
   * 플랫폼별 위젯 업데이트 알림
   */
  private static async notifyPlatformWidgets(data: WidgetData): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await this.updateIOSWidgets(data);
      } else if (Platform.OS === 'android') {
        await this.updateAndroidWidgets(data);
      } else if (Platform.OS === 'web') {
        await this.updateWebWidgets(data);
      }
    } catch (error) {
      console.error('❌ 플랫폼 위젯 업데이트 오류:', error);
    }
  }

  /**
   * iOS 위젯 업데이트
   */
  private static async updateIOSWidgets(data: WidgetData): Promise<void> {
    try {
      console.log('📱 iOS 위젯 업데이트 준비 중...');

      // App Groups을 통한 데이터 공유
      // timeRemaining이 문자열인지 객체인지 확인
      const getTimeLeftString = () => {
        if (!data.timeRemaining) return '00:00';
        if (typeof data.timeRemaining === 'string') return data.timeRemaining;
        return `${data.timeRemaining.hours}:${String(data.timeRemaining.minutes).padStart(2, '0')}`;
      };

      const sharedData = {
        currentCard: data.currentCard?.name || '카드 없음',
        progress: `${data.dailyProgress.completed}/${data.dailyProgress.total}`,
        percentage: data.dailyProgress.percentage,
        timeLeft: getTimeLeftString(),
        streak: data.streak,
        lastUpdate: data.lastUpdate
      };

      // UserDefaults (App Groups) 저장 시뮬레이션
      await AsyncStorage.setItem('widget_ios_data', JSON.stringify(sharedData));

      // WidgetKit 리로드 요청 (실제 iOS에서는 WidgetCenter.shared.reloadAllTimelines() 호출)
      console.log('📱 iOS WidgetKit 리로드 요청 완료');

    } catch (error) {
      console.error('❌ iOS 위젯 업데이트 오류:', error);
    }
  }

  /**
   * Android 위젯 업데이트
   */
  private static async updateAndroidWidgets(data: WidgetData): Promise<void> {
    try {
      console.log('🤖 Android 위젯 업데이트 준비 중...');

      // timeRemaining이 문자열인지 객체인지 확인
      const getTimeRemainingString = () => {
        if (!data.timeRemaining) return '오늘 완료';
        if (typeof data.timeRemaining === 'string') return data.timeRemaining;
        return `${data.timeRemaining.hours}시간 ${data.timeRemaining.minutes}분 남음`;
      };

      const sharedData = {
        cardName: data.currentCard?.name || '오늘의 카드 없음',
        progressText: `${data.dailyProgress.completed}/${data.dailyProgress.total} 완료`,
        progressPercent: data.dailyProgress.percentage,
        timeRemaining: getTimeRemainingString(),
        streakText: `${data.streak}일 연속`,
        updateTime: new Date(data.lastUpdate).toLocaleTimeString('ko-KR')
      };

      // SharedPreferences 저장 시뮬레이션
      await AsyncStorage.setItem('widget_android_data', JSON.stringify(sharedData));

      // AppWidgetManager 업데이트 요청 시뮬레이션
      console.log('🤖 Android AppWidget 업데이트 요청 완료');

    } catch (error) {
      console.error('❌ Android 위젯 업데이트 오류:', error);
    }
  }

  /**
   * 웹 PWA 위젯 업데이트
   */
  private static async updateWebWidgets(data: WidgetData): Promise<void> {
    try {
      console.log('🌐 웹 PWA 위젯 업데이트 준비 중...');

      // PWA 위젯을 위한 데이터 포맷
      const webWidgetData = {
        title: '타로 타이머',
        currentCard: data.currentCard?.name || '오늘의 카드',
        description: `진행률: ${data.dailyProgress.percentage}% (${data.dailyProgress.completed}/${data.dailyProgress.total})`,
        icon: '/assets/icon-192.png',
        timestamp: new Date(data.lastUpdate).getTime(),
        actions: [
          {
            action: 'draw-card',
            title: '카드 뽑기'
          },
          {
            action: 'view-progress',
            title: '진행 상황'
          }
        ]
      };

      // LocalStorage에 저장 (PWA 위젯에서 접근 가능)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tarot_widget_data', JSON.stringify(webWidgetData));
      }

      // Service Worker에 위젯 업데이트 알림
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'WIDGET_UPDATE',
          data: webWidgetData
        });
      }

      console.log('🌐 웹 PWA 위젯 업데이트 완료');

    } catch (error) {
      console.error('❌ 웹 위젯 업데이트 오류:', error);
    }
  }

  /**
   * 위젯 설정 조회
   */
  static async getWidgetSettings(): Promise<WidgetSettings | null> {
    try {
      const settingsStr = await AsyncStorage.getItem(WIDGET_STORAGE_KEYS.SETTINGS);
      return settingsStr ? JSON.parse(settingsStr) : null;
    } catch (error) {
      console.error('❌ 위젯 설정 조회 오류:', error);
      return null;
    }
  }

  /**
   * 위젯 설정 저장
   */
  static async saveWidgetSettings(settings: WidgetSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );

      // 설정 변경 시 위젯 업데이트
      if (settings.enabled) {
        await this.updateWidgetData();
      }

      console.log('✅ 위젯 설정 저장 완료');
    } catch (error) {
      console.error('❌ 위젯 설정 저장 오류:', error);
      throw error;
    }
  }

  /**
   * 자동 업데이트 시작
   */
  private static async startAutoUpdate(): Promise<void> {
    try {
      const settings = await this.getWidgetSettings();
      if (!settings?.enabled || !settings.autoRefresh) {
        return;
      }

      // 기존 타이머 정리
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }

      // 새 타이머 설정
      const intervalMs = settings.updateInterval * 60 * 1000; // 분을 밀리초로 변환

      this.updateInterval = setInterval(async () => {
        try {
          await this.updateWidgetData();
        } catch (error) {
          console.error('❌ 자동 위젯 업데이트 오류:', error);
        }
      }, intervalMs);

      console.log(`🔄 위젯 자동 업데이트 시작 (${settings.updateInterval}분 간격)`);

    } catch (error) {
      console.error('❌ 자동 업데이트 시작 오류:', error);
    }
  }

  /**
   * 자동 업데이트 중지
   */
  static stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏹️ 위젯 자동 업데이트 중지');
    }
  }

  /**
   * 수동 위젯 업데이트 트리거
   */
  static async refreshWidget(): Promise<boolean> {
    try {
      console.log('🔄 수동 위젯 새로고침...');
      await this.updateWidgetData();
      return true;
    } catch (error) {
      console.error('❌ 수동 위젯 새로고침 오류:', error);
      return false;
    }
  }

  /**
   * 위젯 데이터 유효성 검증
   */
  private static isValidWidgetData(data: any): data is WidgetData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.lastUpdate === 'string' &&
      data.dailyProgress &&
      typeof data.dailyProgress.completed === 'number' &&
      typeof data.dailyProgress.total === 'number' &&
      typeof data.dailyProgress.percentage === 'number' &&
      typeof data.streak === 'number'
    );
  }

  /**
   * 위젯 상태 조회
   */
  static async getWidgetStatus(): Promise<{
    enabled: boolean;
    lastUpdate: string | null;
    dataValid: boolean;
    autoUpdateActive: boolean;
  }> {
    try {
      const settings = await this.getWidgetSettings();
      const data = await this.getWidgetData();

      return {
        enabled: settings?.enabled || false,
        lastUpdate: data?.lastUpdate || null,
        dataValid: data ? this.isValidWidgetData(data) : false,
        autoUpdateActive: this.updateInterval !== null
      };

    } catch (error) {
      console.error('❌ 위젯 상태 조회 오류:', error);
      return {
        enabled: false,
        lastUpdate: null,
        dataValid: false,
        autoUpdateActive: false
      };
    }
  }

  /**
   * 위젯 시스템 정리
   */
  static async cleanup(): Promise<void> {
    try {
      console.log('🧹 위젯 매니저 정리 중...');

      // 자동 업데이트 중지
      this.stopAutoUpdate();

      // 초기화 상태 리셋
      this.isInitialized = false;

      console.log('✅ 위젯 매니저 정리 완료');

    } catch (error) {
      console.error('❌ 위젯 매니저 정리 오류:', error);
    }
  }
}

export default WidgetManager;