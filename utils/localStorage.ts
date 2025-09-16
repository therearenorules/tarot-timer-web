/**
 * 로컬 데이터 매니저 - AsyncStorage 기반
 * 하이브리드 모드: 로컬 저장 우선, 선택적 클라우드 백업
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// 로컬 저장 키 상수
export const STORAGE_KEYS = {
  // 사용자 설정
  USER_SETTINGS: 'user_settings',
  PREMIUM_STATUS: 'premium_status',
  CLOUD_BACKUP_ENABLED: 'cloud_backup_enabled',
  DEVICE_ID: 'device_id',

  // 타로 데이터
  TAROT_SESSIONS: 'tarot_sessions',
  JOURNAL_ENTRIES: 'journal_entries',
  CARD_COLLECTIONS: 'card_collections',

  // 앱 상태
  APP_FIRST_LAUNCH: 'app_first_launch',
  LAST_SYNC_TIME: 'last_sync_time',
  DATA_VERSION: 'data_version',

  // 수익 모델
  SUBSCRIPTION_STATUS: 'subscription_status',
  USAGE_LIMITS: 'usage_limits',
  AD_PREFERENCES: 'ad_preferences'
} as const;

// 데이터 타입 정의
export interface UserSettings {
  id: string;
  timezone: string;
  language: string;
  theme: string;
  notifications: {
    daily_reminder: boolean;
    reminder_time: string;
    sound_enabled: boolean;
    vibration_enabled: boolean;
  };
  preferences: {
    card_animation: boolean;
    background_music: boolean;
    haptic_feedback: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface TarotSession {
  id: string;
  session_type: 'daily' | 'spread' | 'custom';
  spread_type?: string;
  cards_drawn: Array<{
    id: string;
    name: string;
    suit?: string;
    position?: string;
    meaning?: string;
    reversed?: boolean;
  }>;
  notes?: string;
  duration?: number;
  mood_before?: string;
  mood_after?: string;
  insights?: any;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  related_session_id?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface PremiumStatus {
  is_premium: boolean;
  subscription_type?: 'monthly' | 'yearly';
  purchase_date?: string;
  expiry_date?: string;
  store_transaction_id?: string;
  unlimited_storage: boolean;
  ad_free: boolean;
  premium_themes: boolean;
  // 영수증 검증 관련 필드 추가
  last_validated?: string;
  validation_environment?: 'Sandbox' | 'Production' | 'Unknown';
  receipt_data?: string;
  original_transaction_id?: string;
}

export interface UsageLimits {
  max_sessions: number;
  max_journal_entries: number;
  current_sessions: number;
  current_journal_entries: number;
  reset_date: string;
}

// 로컬 저장소 매니저 클래스
export class LocalStorageManager {
  // 기본 설정
  private static readonly DATA_VERSION = '1.0.0';
  private static readonly FREE_LIMITS = {
    max_sessions: 10,
    max_journal_entries: 20
  };

  // 제네릭 데이터 저장/로드
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  static async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue || null;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue || null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  // 디바이스 ID 생성 및 관리
  static async getOrCreateDeviceId(): Promise<string> {
    let deviceId = await this.getItem<string>(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }

    return deviceId;
  }

  // 사용자 설정 관리
  static async getUserSettings(): Promise<UserSettings> {
    const settings = await this.getItem<UserSettings>(STORAGE_KEYS.USER_SETTINGS);

    if (!settings) {
      const defaultSettings: UserSettings = {
        id: await this.getOrCreateDeviceId(),
        timezone: 'Asia/Seoul',
        language: 'ko',
        theme: 'mystical_dark',
        notifications: {
          daily_reminder: true,
          reminder_time: '09:00',
          sound_enabled: true,
          vibration_enabled: true
        },
        preferences: {
          card_animation: true,
          background_music: false,
          haptic_feedback: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await this.setItem(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
      return defaultSettings;
    }

    return settings;
  }

  static async updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings();
    const updatedSettings: UserSettings = {
      ...currentSettings,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await this.setItem(STORAGE_KEYS.USER_SETTINGS, updatedSettings);
    return updatedSettings;
  }

  // 타로 세션 관리
  static async getTarotSessions(): Promise<TarotSession[]> {
    return await this.getItem<TarotSession[]>(STORAGE_KEYS.TAROT_SESSIONS, []);
  }

  static async addTarotSession(session: Omit<TarotSession, 'id' | 'created_at' | 'updated_at'>): Promise<TarotSession> {
    const sessions = await this.getTarotSessions();
    const newSession: TarotSession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    sessions.push(newSession);
    await this.setItem(STORAGE_KEYS.TAROT_SESSIONS, sessions);

    // 사용량 업데이트
    await this.updateUsageCount('sessions');

    return newSession;
  }

  static async updateTarotSession(sessionId: string, updates: Partial<TarotSession>): Promise<TarotSession | null> {
    const sessions = await this.getTarotSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);

    if (sessionIndex === -1) return null;

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await this.setItem(STORAGE_KEYS.TAROT_SESSIONS, sessions);
    return sessions[sessionIndex];
  }

  static async deleteTarotSession(sessionId: string): Promise<boolean> {
    const sessions = await this.getTarotSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);

    if (filteredSessions.length === sessions.length) return false;

    await this.setItem(STORAGE_KEYS.TAROT_SESSIONS, filteredSessions);
    return true;
  }

  // 저널 엔트리 관리
  static async getJournalEntries(): Promise<JournalEntry[]> {
    return await this.getItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []);
  }

  static async addJournalEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> {
    const entries = await this.getJournalEntries();
    const newEntry: JournalEntry = {
      ...entry,
      id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    entries.push(newEntry);
    await this.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, entries);

    // 사용량 업데이트
    await this.updateUsageCount('journal_entries');

    return newEntry;
  }

  static async updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<JournalEntry | null> {
    const entries = await this.getJournalEntries();
    const entryIndex = entries.findIndex(e => e.id === entryId);

    if (entryIndex === -1) return null;

    entries[entryIndex] = {
      ...entries[entryIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await this.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
    return entries[entryIndex];
  }

  static async deleteJournalEntry(entryId: string): Promise<boolean> {
    const entries = await this.getJournalEntries();
    const filteredEntries = entries.filter(e => e.id !== entryId);

    if (filteredEntries.length === entries.length) return false;

    await this.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, filteredEntries);
    return true;
  }

  // 프리미엄 상태 관리
  static async getPremiumStatus(): Promise<PremiumStatus> {
    return await this.getItem<PremiumStatus>(STORAGE_KEYS.PREMIUM_STATUS, {
      is_premium: false,
      unlimited_storage: false,
      ad_free: false,
      premium_themes: false
    });
  }

  static async updatePremiumStatus(status: PremiumStatus): Promise<void> {
    await this.setItem(STORAGE_KEYS.PREMIUM_STATUS, status);
  }

  // 사용량 제한 관리
  static async getUsageLimits(): Promise<UsageLimits> {
    const limits = await this.getItem<UsageLimits>(STORAGE_KEYS.USAGE_LIMITS);

    if (!limits) {
      const defaultLimits: UsageLimits = {
        ...this.FREE_LIMITS,
        current_sessions: 0,
        current_journal_entries: 0,
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30일 후
      };

      await this.setItem(STORAGE_KEYS.USAGE_LIMITS, defaultLimits);
      return defaultLimits;
    }

    return limits;
  }

  static async updateUsageCount(type: 'sessions' | 'journal_entries'): Promise<void> {
    const limits = await this.getUsageLimits();

    if (type === 'sessions') {
      limits.current_sessions = (await this.getTarotSessions()).length;
    } else {
      limits.current_journal_entries = (await this.getJournalEntries()).length;
    }

    await this.setItem(STORAGE_KEYS.USAGE_LIMITS, limits);
  }

  static async checkUsageLimit(type: 'sessions' | 'journal_entries'): Promise<{ canCreate: boolean; isAtLimit: boolean }> {
    const premiumStatus = await this.getPremiumStatus();

    if (premiumStatus.is_premium && premiumStatus.unlimited_storage) {
      return { canCreate: true, isAtLimit: false };
    }

    const limits = await this.getUsageLimits();

    if (type === 'sessions') {
      return {
        canCreate: limits.current_sessions < limits.max_sessions,
        isAtLimit: limits.current_sessions >= limits.max_sessions
      };
    } else {
      return {
        canCreate: limits.current_journal_entries < limits.max_journal_entries,
        isAtLimit: limits.current_journal_entries >= limits.max_journal_entries
      };
    }
  }

  // 클라우드 백업 설정
  static async isCloudBackupEnabled(): Promise<boolean> {
    return await this.getItem<boolean>(STORAGE_KEYS.CLOUD_BACKUP_ENABLED, false);
  }

  static async setCloudBackupEnabled(enabled: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.CLOUD_BACKUP_ENABLED, enabled);
  }

  // 데이터 내보내기/가져오기 (백업 기능)
  static async exportAllData(): Promise<string> {
    const data = {
      version: this.DATA_VERSION,
      exported_at: new Date().toISOString(),
      user_settings: await this.getUserSettings(),
      tarot_sessions: await this.getTarotSessions(),
      journal_entries: await this.getJournalEntries(),
      premium_status: await this.getPremiumStatus(),
      usage_limits: await this.getUsageLimits()
    };

    return JSON.stringify(data, null, 2);
  }

  static async importAllData(jsonData: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonData);

      if (!data.version || !data.user_settings) {
        return { success: false, message: '잘못된 백업 파일 형식입니다.' };
      }

      // 데이터 복원
      if (data.user_settings) await this.setItem(STORAGE_KEYS.USER_SETTINGS, data.user_settings);
      if (data.tarot_sessions) await this.setItem(STORAGE_KEYS.TAROT_SESSIONS, data.tarot_sessions);
      if (data.journal_entries) await this.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, data.journal_entries);
      if (data.premium_status) await this.setItem(STORAGE_KEYS.PREMIUM_STATUS, data.premium_status);
      if (data.usage_limits) await this.setItem(STORAGE_KEYS.USAGE_LIMITS, data.usage_limits);

      return { success: true, message: '데이터를 성공적으로 복원했습니다.' };
    } catch (error) {
      return { success: false, message: '데이터 복원 중 오류가 발생했습니다.' };
    }
  }

  // 모든 데이터 삭제 (초기화)
  static async clearAllData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  }

  // 앱 첫 실행 확인
  static async isFirstLaunch(): Promise<boolean> {
    const isFirst = await this.getItem<boolean>(STORAGE_KEYS.APP_FIRST_LAUNCH, true);

    if (isFirst) {
      await this.setItem(STORAGE_KEYS.APP_FIRST_LAUNCH, false);
    }

    return isFirst;
  }
}

// 기본 내보내기
export default LocalStorageManager;