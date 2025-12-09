/**
 * 익명 분석 데이터 수집 시스템
 * 사용자의 개인정보를 보호하면서 앱 사용 패턴 분석
 */

import { Platform } from 'react-native';

// 익명 분석 데이터 타입 정의
export interface AnalyticsEvent {
  id: string;
  event_type: 'app_launch' | 'app_close' | 'tarot_session_start' | 'tarot_session_complete' | 'journal_entry_add' | 'premium_feature_use' | 'setting_change' | 'card_draw' | 'spread_select' | 'export_data' | 'import_data' | 'feedback_submitted';
  timestamp: string;
  session_id: string; // 세션별 고유 ID (앱 실행마다 새로 생성)
  device_info: DeviceInfo;
  event_data: Record<string, any>;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  app_version: string;
  locale: string;
  timezone: string;
  screen_size?: string; // 'small' | 'medium' | 'large'
}

export interface AppUsageStats {
  total_sessions: number;
  total_tarot_sessions: number;
  total_journal_entries: number;
  avg_session_duration: number; // 분 단위
  popular_cards: string[];
  popular_spreads: string[];
  feature_usage: Record<string, number>;
  retention_data: {
    day_1: number;
    day_7: number;
    day_30: number;
  };
}

export class AnalyticsManager {
  private static sessionId: string = '';
  private static sessionStartTime: number = 0;
  private static isEnabled: boolean = true; // 기본적으로 활성화 (설정에서 비활성화 가능)

  // 세션 시작
  static async startSession(): Promise<void> {
    try {
      this.sessionId = this.generateSessionId();
      this.sessionStartTime = Date.now();

      await this.trackEvent('app_launch', {
        previous_session_id: await this.getPreviousSessionId(),
        is_first_launch: await this.isFirstLaunch()
      });

      console.log('📊 분석 세션 시작:', this.sessionId);
    } catch (error) {
      console.error('분석 세션 시작 오류:', error);
    }
  }

  // 세션 종료
  static async endSession(): Promise<void> {
    try {
      if (!this.sessionId) return;

      const sessionDuration = Math.round((Date.now() - this.sessionStartTime) / 1000 / 60); // 분 단위

      await this.trackEvent('app_close', {
        session_duration_minutes: sessionDuration
      });

      console.log('📊 분석 세션 종료:', this.sessionId, `${sessionDuration}분`);
    } catch (error) {
      console.error('분석 세션 종료 오류:', error);
    }
  }

  // 이벤트 추적
  static async trackEvent(eventType: AnalyticsEvent['event_type'], eventData: Record<string, any> = {}): Promise<void> {
    try {
      if (!this.isEnabled) return;

      const event: AnalyticsEvent = {
        id: this.generateEventId(),
        event_type: eventType,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId || this.generateSessionId(),
        device_info: await this.getDeviceInfo(),
        event_data: eventData
      };

      // 로컬에 임시 저장 (나중에 배치로 전송)
      await this.storeEventLocally(event);

      console.log('📊 이벤트 추적:', eventType, eventData);
    } catch (error) {
      console.error('이벤트 추적 오류:', error);
    }
  }

  // 타로 세션 시작 추적
  static async trackTarotSessionStart(spreadType: string, cardCount: number): Promise<void> {
    await this.trackEvent('tarot_session_start', {
      spread_type: spreadType,
      card_count: cardCount
    });
  }

  // 타로 세션 완료 추적
  static async trackTarotSessionComplete(spreadType: string, cardCount: number, sessionDurationMinutes: number): Promise<void> {
    await this.trackEvent('tarot_session_complete', {
      spread_type: spreadType,
      card_count: cardCount,
      session_duration_minutes: sessionDurationMinutes
    });
  }

  // 저널 엔트리 추가 추적
  static async trackJournalEntry(entryLength: number, hasImages: boolean): Promise<void> {
    await this.trackEvent('journal_entry_add', {
      entry_length: entryLength,
      has_images: hasImages
    });
  }

  // 프리미엄 기능 사용 추적
  static async trackPremiumFeatureUse(featureName: string): Promise<void> {
    await this.trackEvent('premium_feature_use', {
      feature_name: featureName
    });
  }

  // 카드 뽑기 추적
  static async trackCardDraw(cardName: string, position: number, isReversed: boolean): Promise<void> {
    await this.trackEvent('card_draw', {
      card_name: cardName,
      position: position,
      is_reversed: isReversed
    });
  }

  // 설정 변경 추적
  static async trackSettingChange(settingName: string, oldValue: any, newValue: any): Promise<void> {
    await this.trackEvent('setting_change', {
      setting_name: settingName,
      old_value: oldValue,
      new_value: newValue
    });
  }

  // 분석 활성화/비활성화
  static async setAnalyticsEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;

    // 설정을 로컬 저장소에 저장
    try {
      const { default: LocalStorageManager } = await import('./localStorage');
      await LocalStorageManager.setItem('analytics_enabled', enabled.toString());

      console.log('📊 분석 설정 변경:', enabled ? '활성화' : '비활성화');
    } catch (error) {
      console.error('분석 설정 저장 오류:', error);
    }
  }

  // 분석 활성화 상태 확인
  static async isAnalyticsEnabled(): Promise<boolean> {
    try {
      const { default: LocalStorageManager } = await import('./localStorage');
      const enabled = await LocalStorageManager.getItem('analytics_enabled');
      return enabled !== 'false'; // 기본값은 true
    } catch (error) {
      console.error('분석 설정 로드 오류:', error);
      return true;
    }
  }

  // 로컬에 저장된 이벤트들을 가져오기
  static async getStoredEvents(): Promise<AnalyticsEvent[]> {
    try {
      const { default: LocalStorageManager } = await import('./localStorage');
      const eventsData = await LocalStorageManager.getItem('analytics_events');

      if (!eventsData) return [];

      return JSON.parse(eventsData as string);
    } catch (error) {
      console.error('저장된 이벤트 로드 오류:', error);
      return [];
    }
  }

  // 사용 통계 생성
  static async generateUsageStats(): Promise<AppUsageStats> {
    try {
      const events = await this.getStoredEvents();

      const stats: AppUsageStats = {
        total_sessions: this.countEventsByType(events, 'app_launch'),
        total_tarot_sessions: this.countEventsByType(events, 'tarot_session_complete'),
        total_journal_entries: this.countEventsByType(events, 'journal_entry_add'),
        avg_session_duration: this.calculateAverageSessionDuration(events),
        popular_cards: this.getPopularCards(events),
        popular_spreads: this.getPopularSpreads(events),
        feature_usage: this.getFeatureUsage(events),
        retention_data: this.calculateRetention(events)
      };

      return stats;
    } catch (error) {
      console.error('사용 통계 생성 오류:', error);
      return {
        total_sessions: 0,
        total_tarot_sessions: 0,
        total_journal_entries: 0,
        avg_session_duration: 0,
        popular_cards: [],
        popular_spreads: [],
        feature_usage: {},
        retention_data: { day_1: 0, day_7: 0, day_30: 0 }
      };
    }
  }

  // 데이터 익명화 및 관리자 전송 준비
  static async prepareDataForAdmin(): Promise<any> {
    try {
      const events = await this.getStoredEvents();
      const stats = await this.generateUsageStats();

      // 개인식별 정보 제거
      const anonymizedEvents = events.map(event => ({
        ...event,
        session_id: this.hashString(event.session_id), // 세션 ID 해시화
        id: this.hashString(event.id), // 이벤트 ID 해시화
        device_info: {
          ...event.device_info,
          // IP 주소, 디바이스 ID 등 제거
        }
      }));

      return {
        stats,
        anonymized_events: anonymizedEvents.slice(-1000), // 최근 1000개 이벤트만
        data_version: '1.0',
        collected_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('관리자 데이터 준비 오류:', error);
      return null;
    }
  }

  // 로컬 이벤트 데이터 정리 (30일 이상 된 데이터 삭제)
  static async cleanupOldEvents(): Promise<void> {
    try {
      const events = await this.getStoredEvents();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentEvents = events.filter(event =>
        new Date(event.timestamp) > thirtyDaysAgo
      );

      const { default: LocalStorageManager } = await import('./localStorage');
      await LocalStorageManager.setItem('analytics_events', JSON.stringify(recentEvents));

      console.log('📊 오래된 분석 데이터 정리 완료:', events.length - recentEvents.length, '개 삭제');
    } catch (error) {
      console.error('분석 데이터 정리 오류:', error);
    }
  }

  // 내부 메서드들
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async getDeviceInfo(): Promise<DeviceInfo> {
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

    return {
      platform,
      app_version: '1.0.0', // package.json에서 가져오도록 개선 가능
      locale: 'ko-KR', // 실제 디바이스 로케일 가져오도록 개선 가능
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen_size: this.getScreenSize()
    };
  }

  private static getScreenSize(): string {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) return 'small';
      if (width < 1024) return 'medium';
      return 'large';
    }
    return 'unknown';
  }

  private static async storeEventLocally(event: AnalyticsEvent): Promise<void> {
    try {
      const { default: LocalStorageManager } = await import('./localStorage');
      const existingEvents = await this.getStoredEvents();

      existingEvents.push(event);

      // 최대 5000개 이벤트만 보관
      if (existingEvents.length > 5000) {
        existingEvents.splice(0, existingEvents.length - 5000);
      }

      await LocalStorageManager.setItem('analytics_events', JSON.stringify(existingEvents));
    } catch (error) {
      console.error('이벤트 로컬 저장 오류:', error);
    }
  }

  private static async getPreviousSessionId(): Promise<string | null> {
    try {
      const { default: LocalStorageManager } = await import('./localStorage');
      return await LocalStorageManager.getItem('last_session_id');
    } catch (error) {
      return null;
    }
  }

  private static async isFirstLaunch(): Promise<boolean> {
    try {
      const { default: LocalStorageManager } = await import('./localStorage');
      return await LocalStorageManager.isFirstLaunch();
    } catch (error) {
      return false;
    }
  }

  private static countEventsByType(events: AnalyticsEvent[], eventType: string): number {
    return events.filter(event => event.event_type === eventType).length;
  }

  private static calculateAverageSessionDuration(events: AnalyticsEvent[]): number {
    const closeEvents = events.filter(event => event.event_type === 'app_close');
    if (closeEvents.length === 0) return 0;

    const totalDuration = closeEvents.reduce((sum, event) => {
      return sum + (event.event_data.session_duration_minutes || 0);
    }, 0);

    return Math.round(totalDuration / closeEvents.length);
  }

  private static getPopularCards(events: AnalyticsEvent[]): string[] {
    const cardDrawEvents = events.filter(event => event.event_type === 'card_draw');
    const cardCounts: Record<string, number> = {};

    cardDrawEvents.forEach(event => {
      const cardName = event.event_data.card_name;
      cardCounts[cardName] = (cardCounts[cardName] || 0) + 1;
    });

    return Object.entries(cardCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([card]) => card);
  }

  private static getPopularSpreads(events: AnalyticsEvent[]): string[] {
    const spreadEvents = events.filter(event => event.event_type === 'tarot_session_start');
    const spreadCounts: Record<string, number> = {};

    spreadEvents.forEach(event => {
      const spreadType = event.event_data.spread_type;
      spreadCounts[spreadType] = (spreadCounts[spreadType] || 0) + 1;
    });

    return Object.entries(spreadCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([spread]) => spread);
  }

  private static getFeatureUsage(events: AnalyticsEvent[]): Record<string, number> {
    const featureEvents = events.filter(event => event.event_type === 'premium_feature_use');
    const featureCounts: Record<string, number> = {};

    featureEvents.forEach(event => {
      const featureName = event.event_data.feature_name;
      featureCounts[featureName] = (featureCounts[featureName] || 0) + 1;
    });

    return featureCounts;
  }

  private static calculateRetention(events: AnalyticsEvent[]): { day_1: number; day_7: number; day_30: number } {
    // 간단한 리텐션 계산 (더 정교한 계산 필요)
    const launchEvents = events.filter(event => event.event_type === 'app_launch');
    const uniqueDays = new Set(launchEvents.map(event =>
      new Date(event.timestamp).toDateString()
    ));

    return {
      day_1: uniqueDays.size,
      day_7: uniqueDays.size,
      day_30: uniqueDays.size
    };
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return hash.toString(36);
  }
}

export default AnalyticsManager;