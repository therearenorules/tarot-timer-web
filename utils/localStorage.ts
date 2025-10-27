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
  APP_INSTALL_INFO: 'app_install_info',
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

export interface AppInstallInfo {
  first_launch_date: string;      // 최초 설치 날짜
  is_trial_active: boolean;       // 무료 체험 활성화 여부
  trial_end_date: string;         // 무료 체험 종료 날짜
  trial_used: boolean;            // 무료 체험 사용 여부
}

export interface PremiumStatus {
  is_premium: boolean;
  subscription_type?: 'monthly' | 'yearly' | 'trial';
  purchase_date?: string;
  expiry_date?: string;
  store_transaction_id?: string;
  unlimited_storage: boolean;
  ad_free: boolean;
  premium_spreads: boolean;
  // 영수증 검증 관련 필드 추가
  last_validated?: string;
  validation_environment?: 'Sandbox' | 'Production' | 'Unknown' | 'Simulation';
  receipt_data?: string;
  original_transaction_id?: string;
  // ✅ FIX: 시뮬레이션 모드 플래그 (테스트용)
  is_simulation?: boolean;
}

export interface UsageLimits {
  max_daily_sessions: number;
  max_spread_sessions: number;
  max_journal_entries: number;
  current_daily_sessions: number;
  current_spread_sessions: number;
  current_journal_entries: number;
  reset_date: string;
}

// 로컬 저장소 매니저 클래스
export class LocalStorageManager {
  // 기본 설정
  private static readonly DATA_VERSION = '1.0.0';
  private static readonly FREE_LIMITS = {
    max_daily_sessions: 15,      // 데일리 타로 15개 (스프레드와 동일)
    max_spread_sessions: 15,     // 스프레드 15개
    max_journal_entries: 20
  };

  // ✅ PERFORMANCE FIX: AsyncStorage.getAllKeys() 캐싱 (프로덕션 빌드 성능 개선)
  private static keysCache: string[] | null = null;
  private static keysCacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 5000; // 5초 캐시

  // ✅ FIX: AsyncStorage 초기화 상태 관리 (프로덕션 빌드 타이밍 문제 해결)
  private static isInitialized: boolean = false;
  private static initPromise: Promise<void> | null = null;

  // AsyncStorage 초기화 보장
  private static async ensureInitialized(): Promise<void> {
    // 이미 초기화된 경우 즉시 반환
    if (this.isInitialized) {
      return;
    }

    // 초기화 중인 경우 기존 Promise 대기
    if (this.initPromise) {
      return this.initPromise;
    }

    // 새로운 초기화 시작
    this.initPromise = (async () => {
      try {
        console.log('🔄 AsyncStorage 초기화 시작...');
        // AsyncStorage 초기화 테스트 (더미 읽기)
        await AsyncStorage.getItem('__init_test__');
        this.isInitialized = true;
        console.log('✅ AsyncStorage 초기화 완료');
      } catch (error) {
        console.error('❌ AsyncStorage 초기화 실패:', error);
        // 초기화 실패 시에도 계속 진행 (다음 호출 시 재시도)
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  // getAllKeys() Retry 로직
  private static async getAllKeysWithRetry(maxRetries = 3, delayMs = 300): Promise<string[]> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const keys = await AsyncStorage.getAllKeys();
        if (attempt > 1) {
          console.log(`✅ AsyncStorage.getAllKeys() 성공 (${attempt}번째 시도)`);
        }
        return keys;
      } catch (error) {
        console.warn(`⚠️  AsyncStorage.getAllKeys() 실패 (${attempt}/${maxRetries})`, error);

        if (attempt < maxRetries) {
          // 지수 백오프: 300ms, 600ms, 1200ms
          const delay = delayMs * attempt;
          console.log(`⏳ ${delay}ms 대기 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // 최종 실패
          console.error('❌ AsyncStorage.getAllKeys() 최대 재시도 횟수 초과');
          throw error;
        }
      }
    }
    return []; // TypeScript 만족용 (실제로는 throw에서 끝남)
  }

  // 캐시된 키 목록 가져오기
  private static async getCachedKeys(): Promise<string[]> {
    // ✅ FIX: AsyncStorage 초기화 대기
    await this.ensureInitialized();

    const now = Date.now();

    // 캐시가 유효한 경우 바로 반환
    if (this.keysCache && (now - this.keysCacheTimestamp < this.CACHE_DURATION)) {
      return this.keysCache;
    }

    // 캐시 만료 또는 없음 - 새로 가져오기 (Retry 포함)
    try {
      const keys = await this.getAllKeysWithRetry(3, 300);
      this.keysCache = keys;
      this.keysCacheTimestamp = now;
      console.log(`📊 AsyncStorage 키 목록 캐시 갱신: ${keys.length}개`);
      return keys;
    } catch (error) {
      console.error('❌ AsyncStorage.getAllKeys() 완전 실패:', error);
      // 에러 시 이전 캐시 반환 (있으면)
      if (this.keysCache && this.keysCache.length > 0) {
        console.warn('⚠️  이전 캐시 데이터 사용');
        return this.keysCache;
      }
      // 캐시도 없으면 빈 배열 (안전한 fallback)
      return [];
    }
  }

  // 캐시 무효화 (데이터 변경 시 호출)
  private static invalidateCache(): void {
    this.keysCache = null;
    this.keysCacheTimestamp = 0;
  }

  // 제네릭 데이터 저장/로드
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      // ✅ 데이터 변경 시 캐시 무효화
      this.invalidateCache();
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
      // ✅ 데이터 삭제 시 캐시 무효화
      this.invalidateCache();
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

  static async addTarotSession(session: Omit<TarotSession, 'id' | 'created_at' | 'updated_at'>): Promise<TarotSession | null> {
    // 프리미엄 상태 확인
    const premiumStatus = await this.getPremiumStatus();

    // 프리미엄이 아닌 경우 저장 제한 체크
    if (!premiumStatus.is_premium || !premiumStatus.unlimited_storage) {
      const sessionType = session.session_type === 'daily' ? 'daily' : 'spread';
      const limitCheck = await this.checkUsageLimit(sessionType);

      if (limitCheck.isAtLimit) {
        // 제한 초과 시 null 반환
        console.warn(`저장 제한 초과: ${sessionType} (${limitCheck.currentCount}/${limitCheck.maxCount})`);
        return null;
      }
    }

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
    const sessionType = session.session_type === 'daily' ? 'daily' : 'spread';
    await this.updateUsageCount(sessionType);

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
      premium_spreads: false
    });
  }

  static async updatePremiumStatus(status: PremiumStatus): Promise<void> {
    await this.setItem(STORAGE_KEYS.PREMIUM_STATUS, status);
  }

  // 앱 설치 정보 관리 (7일 무료 체험)
  static async getAppInstallInfo(): Promise<AppInstallInfo | null> {
    return await this.getItem<AppInstallInfo>(STORAGE_KEYS.APP_INSTALL_INFO);
  }

  static async setAppInstallInfo(info: AppInstallInfo): Promise<void> {
    await this.setItem(STORAGE_KEYS.APP_INSTALL_INFO, info);
  }

  static async checkTrialStatus(): Promise<PremiumStatus> {
    // APPLE REVIEW FIX: 7일 무료 체험 일시 비활성화 (Build 95)
    const TRIAL_DISABLED = true; // false로 변경하면 7일 무료 체험 재활성화

    if (TRIAL_DISABLED) {
      console.log('무료 체험 비활성화 (Apple 심사용)');
      return {
        is_premium: false,
        ad_free: false,
        unlimited_storage: false,
        premium_spreads: false
      };
    }

    // 7일 무료 체험 로직
    const installInfo = await this.getAppInstallInfo();

    // 최초 설치 시 7일 무료 체험 시작
    if (!installInfo) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      const newInstallInfo: AppInstallInfo = {
        first_launch_date: new Date().toISOString(),
        is_trial_active: true,
        trial_end_date: trialEndDate.toISOString(),
        trial_used: true
      };

      await this.setAppInstallInfo(newInstallInfo);
      console.log('✨ 7일 무료 체험 시작!');

      return {
        is_premium: true,
        ad_free: true,
        unlimited_storage: true,
        premium_spreads: true,
        subscription_type: 'trial',
        purchase_date: new Date().toISOString(),
        expiry_date: trialEndDate.toISOString()
      };
    }

    // 무료 체험 기간 확인
    const now = new Date();
    const trialEnd = new Date(installInfo.trial_end_date);
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (installInfo.is_trial_active && now < trialEnd) {
      console.log(`🎁 무료 체험 중 (남은 기간: ${daysRemaining}일)`);
      return {
        is_premium: true,
        ad_free: true,
        unlimited_storage: true,
        premium_spreads: true,
        subscription_type: 'trial',
        purchase_date: installInfo.first_launch_date,
        expiry_date: installInfo.trial_end_date
      };
    }

    // 무료 체험 종료
    if (installInfo.is_trial_active) {
      console.log('⏰ 무료 체험이 종료되었습니다.');
      installInfo.is_trial_active = false;
      await this.setAppInstallInfo(installInfo);
    }

    return {
      is_premium: false,
      ad_free: false,
      unlimited_storage: false,
      premium_spreads: false
    };
  }

  // 사용량 제한 관리
  static async getUsageLimits(): Promise<UsageLimits> {
    const limits = await this.getItem<UsageLimits>(STORAGE_KEYS.USAGE_LIMITS);

    if (!limits) {
      const defaultLimits: UsageLimits = {
        ...this.FREE_LIMITS,
        current_daily_sessions: 0,
        current_spread_sessions: 0,
        current_journal_entries: 0,
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30일 후
      };

      await this.setItem(STORAGE_KEYS.USAGE_LIMITS, defaultLimits);
      return defaultLimits;
    }

    return limits;
  }

  static async updateUsageCount(type: 'daily' | 'spread' | 'journal_entries'): Promise<void> {
    const limits = await this.getUsageLimits();

    if (type === 'daily') {
      // ✅ PERFORMANCE FIX: 캐시된 키 목록 사용
      let dailyCount = 0;
      try {
        const allKeys = await this.getCachedKeys();
        const dailyTarotKeys = allKeys.filter(key => key.startsWith('daily_tarot_'));
        dailyCount = dailyTarotKeys.length;
        console.log(`📊 실제 DailyTarot 저장 개수: ${dailyCount}개`);
      } catch (error) {
        console.error('DailyTarot 카운트 실패:', error);
        // 에러 시 기존 로직 유지 (TarotSession 카운트)
        const sessions = await this.getTarotSessions();
        dailyCount = sessions.filter(s => s.session_type === 'daily').length;
      }
      limits.current_daily_sessions = dailyCount;
    } else if (type === 'spread') {
      const sessions = await this.getTarotSessions();
      limits.current_spread_sessions = sessions.filter(s => s.session_type === 'spread' || s.session_type === 'custom').length;
    } else {
      limits.current_journal_entries = (await this.getJournalEntries()).length;
    }

    await this.setItem(STORAGE_KEYS.USAGE_LIMITS, limits);
  }

  static async checkUsageLimit(type: 'daily' | 'spread' | 'journal_entries'): Promise<{
    canCreate: boolean;
    isAtLimit: boolean;
    currentCount: number;
    maxCount: number;
  }> {
    const premiumStatus = await this.getPremiumStatus();

    if (premiumStatus.is_premium && premiumStatus.unlimited_storage) {
      return { canCreate: true, isAtLimit: false, currentCount: 0, maxCount: 999999 };
    }

    const limits = await this.getUsageLimits();

    if (type === 'daily') {
      // ✅ PERFORMANCE FIX: 캐시된 키 목록으로 실시간 개수 확인
      let actualDailyCount = limits.current_daily_sessions;
      try {
        const allKeys = await this.getCachedKeys();
        const dailyTarotKeys = allKeys.filter(key => key.startsWith('daily_tarot_'));
        actualDailyCount = dailyTarotKeys.length;
        console.log(`🔍 DailyTarot 저장 제한 확인: ${actualDailyCount}/${limits.max_daily_sessions}`);
      } catch (error) {
        console.error('DailyTarot 카운트 실패, 캐시된 값 사용:', error);
      }

      return {
        canCreate: actualDailyCount < limits.max_daily_sessions,
        isAtLimit: actualDailyCount >= limits.max_daily_sessions,
        currentCount: actualDailyCount,
        maxCount: limits.max_daily_sessions
      };
    } else if (type === 'spread') {
      return {
        canCreate: limits.current_spread_sessions < limits.max_spread_sessions,
        isAtLimit: limits.current_spread_sessions >= limits.max_spread_sessions,
        currentCount: limits.current_spread_sessions,
        maxCount: limits.max_spread_sessions
      };
    } else {
      return {
        canCreate: limits.current_journal_entries < limits.max_journal_entries,
        isAtLimit: limits.current_journal_entries >= limits.max_journal_entries,
        currentCount: limits.current_journal_entries,
        maxCount: limits.max_journal_entries
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