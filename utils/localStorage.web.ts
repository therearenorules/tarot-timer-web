/**
 * 로컬 데이터 매니저 - 웹 브라우저 localStorage 기반
 * 하이브리드 모드: 로컬 저장 우선, 선택적 클라우드 백업
 */

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

// 데이터 타입 정의 (React Native 버전과 동일)
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
  first_launch_date: string;
  is_trial_active: boolean;
  trial_end_date: string;
  trial_used: boolean;
}

export interface PremiumStatus {
  is_premium: boolean;
  subscription_type?: 'monthly' | 'yearly' | 'trial';
  purchase_date?: string;
  expiry_date?: string;
  ad_free: boolean;
  unlimited_storage: boolean;
  premium_spreads: boolean;
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

/**
 * 웹 브라우저 localStorage를 사용하는 로컬 데이터 매니저
 */
export default class LocalStorageManager {
  // 무료 사용자 제한
  private static readonly FREE_LIMITS = {
    max_daily_sessions: 100,
    max_spread_sessions: 50,
    max_journal_entries: 100
  };

  // 웹 localStorage 래퍼 메서드
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('LocalStorageManager setItem error:', error);
      throw error;
    }
  }

  static async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const jsonValue = localStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : (defaultValue || null);
    } catch (error) {
      console.error('LocalStorageManager getItem error:', error);
      return defaultValue || null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorageManager removeItem error:', error);
      throw error;
    }
  }

  // 디바이스 ID 관리
  static async getOrCreateDeviceId(): Promise<string> {
    let deviceId = await this.getItem<string>(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
      deviceId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul',
        language: navigator.language.split('-')[0] || 'ko',
        theme: 'dark',
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
    const updatedSettings = {
      ...currentSettings,
      ...updates,
      updated_at: new Date().toISOString()
    };
    await this.setItem(STORAGE_KEYS.USER_SETTINGS, updatedSettings);
    return updatedSettings;
  }

  // 타로 세션 관리
  static async getTarotSessions(): Promise<TarotSession[]> {
    return (await this.getItem<TarotSession[]>(STORAGE_KEYS.TAROT_SESSIONS)) || [];
  }

  static async addTarotSession(session: Omit<TarotSession, 'id' | 'created_at' | 'updated_at'>): Promise<TarotSession | null> {
    const sessions = await this.getTarotSessions();
    const limits = await this.getUsageLimits();
    const isPremium = (await this.checkTrialStatus()).is_premium;

    if (!isPremium) {
      if (session.session_type === 'daily' && limits.current_daily_sessions >= limits.max_daily_sessions) {
        return null;
      }
      if (session.session_type === 'spread' && limits.current_spread_sessions >= limits.max_spread_sessions) {
        return null;
      }
    }

    const newSession: TarotSession = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    sessions.push(newSession);
    await this.setItem(STORAGE_KEYS.TAROT_SESSIONS, sessions);
    await this.updateUsageCount(session.session_type === 'daily' ? 'daily' : 'spread');

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
    return (await this.getItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES)) || [];
  }

  static async addJournalEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> {
    const entries = await this.getJournalEntries();

    const newEntry: JournalEntry = {
      ...entry,
      id: `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    entries.push(newEntry);
    await this.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
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
    return (await this.getItem<PremiumStatus>(STORAGE_KEYS.PREMIUM_STATUS)) || {
      is_premium: false,
      ad_free: false,
      unlimited_storage: false,
      premium_spreads: false
    };
  }

  static async updatePremiumStatus(status: PremiumStatus): Promise<void> {
    await this.setItem(STORAGE_KEYS.PREMIUM_STATUS, status);
  }

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
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await this.setItem(STORAGE_KEYS.USAGE_LIMITS, defaultLimits);
      return defaultLimits;
    }

    return limits;
  }

  static async updateUsageCount(type: 'daily' | 'spread' | 'journal_entries'): Promise<void> {
    const limits = await this.getUsageLimits();
    const now = new Date();
    const resetDate = new Date(limits.reset_date);

    if (now > resetDate) {
      const newResetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await this.setItem(STORAGE_KEYS.USAGE_LIMITS, {
        ...this.FREE_LIMITS,
        current_daily_sessions: 0,
        current_spread_sessions: 0,
        current_journal_entries: 0,
        reset_date: newResetDate.toISOString()
      });
      return;
    }

    const updatedLimits = { ...limits };
    if (type === 'daily') updatedLimits.current_daily_sessions++;
    else if (type === 'spread') updatedLimits.current_spread_sessions++;
    else if (type === 'journal_entries') updatedLimits.current_journal_entries++;

    await this.setItem(STORAGE_KEYS.USAGE_LIMITS, updatedLimits);
  }

  static async checkUsageLimit(type: 'daily' | 'spread' | 'journal_entries'): Promise<{
    isAllowed: boolean;
    current: number;
    max: number;
  }> {
    const limits = await this.getUsageLimits();
    const isPremium = (await this.checkTrialStatus()).is_premium;

    if (isPremium) {
      return { isAllowed: true, current: 0, max: Infinity };
    }

    let current = 0;
    let max = 0;

    if (type === 'daily') {
      current = limits.current_daily_sessions;
      max = limits.max_daily_sessions;
    } else if (type === 'spread') {
      current = limits.current_spread_sessions;
      max = limits.max_spread_sessions;
    } else if (type === 'journal_entries') {
      current = limits.current_journal_entries;
      max = limits.max_journal_entries;
    }

    return {
      isAllowed: current < max,
      current,
      max
    };
  }

  // 클라우드 백업 설정
  static async isCloudBackupEnabled(): Promise<boolean> {
    return (await this.getItem<boolean>(STORAGE_KEYS.CLOUD_BACKUP_ENABLED)) || false;
  }

  static async setCloudBackupEnabled(enabled: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.CLOUD_BACKUP_ENABLED, enabled);
  }

  // 데이터 내보내기/가져오기
  static async exportAllData(): Promise<string> {
    const allData = {
      settings: await this.getUserSettings(),
      sessions: await this.getTarotSessions(),
      entries: await this.getJournalEntries(),
      premium: await this.getPremiumStatus(),
      limits: await this.getUsageLimits(),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(allData, null, 2);
  }

  static async importAllData(jsonData: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonData);

      if (data.settings) await this.setItem(STORAGE_KEYS.USER_SETTINGS, data.settings);
      if (data.sessions) await this.setItem(STORAGE_KEYS.TAROT_SESSIONS, data.sessions);
      if (data.entries) await this.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, data.entries);
      if (data.premium) await this.setItem(STORAGE_KEYS.PREMIUM_STATUS, data.premium);
      if (data.limits) await this.setItem(STORAGE_KEYS.USAGE_LIMITS, data.limits);

      return { success: true, message: '데이터를 성공적으로 가져왔습니다.' };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: '데이터 가져오기에 실패했습니다.' };
    }
  }

  // 모든 데이터 삭제
  static async clearAllData(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // 최초 실행 확인
  static async isFirstLaunch(): Promise<boolean> {
    const isFirst = !(await this.getItem<boolean>(STORAGE_KEYS.APP_FIRST_LAUNCH));
    if (isFirst) {
      await this.setItem(STORAGE_KEYS.APP_FIRST_LAUNCH, true);
    }
    return isFirst;
  }

  // 온보딩 완료 확인 (호환성)
  static async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.APP_FIRST_LAUNCH, completed);
  }
}
