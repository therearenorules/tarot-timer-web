/**
 * 로컬 데이터 매니저
 * 완전한 로컬 저장소 기반 데이터 관리
 * 사용자 데이터는 디바이스에만 저장됨
 */

import LocalStorageManager, {
  TarotSession,
  JournalEntry,
  UserSettings,
  PremiumStatus
} from './localStorage';

export interface LocalDataStatus {
  totalSessions: number;
  totalJournalEntries: number;
  storageUsed: number; // KB 단위
  lastBackupTime?: string;
}

export class LocalDataManager {
  // 로컬 데이터 초기화
  static async initialize(): Promise<void> {
    try {
      // 앱 첫 실행 확인
      const isFirstLaunch = await LocalStorageManager.isFirstLaunch();

      if (isFirstLaunch) {
        console.log('🎯 첫 실행: 로컬 저장소 초기화');
        await LocalStorageManager.getUserSettings(); // 기본 설정 생성
      }

      console.log('📱 로컬 데이터 매니저 초기화 완료');
    } catch (error) {
      console.error('로컬 데이터 매니저 초기화 오류:', error);
    }
  }

  // 타로 세션 관리 (로컬 전용)
  static async getTarotSessions(): Promise<TarotSession[]> {
    return await LocalStorageManager.getTarotSessions();
  }

  static async addTarotSession(session: Omit<TarotSession, 'id' | 'created_at' | 'updated_at'>): Promise<TarotSession> {
    // 사용량 제한 확인
    const usageCheck = await LocalStorageManager.checkUsageLimit('sessions');
    if (!usageCheck.canCreate) {
      throw new Error('저장 한도에 도달했습니다. 프리미엄으로 업그레이드하시거나 기존 세션을 삭제해주세요.');
    }

    // 로컬에 저장
    const newSession = await LocalStorageManager.addTarotSession(session);
    console.log('📝 새 타로 세션 저장됨:', newSession.id);

    return newSession;
  }

  static async updateTarotSession(sessionId: string, updates: Partial<TarotSession>): Promise<TarotSession | null> {
    const updatedSession = await LocalStorageManager.updateTarotSession(sessionId, updates);
    if (updatedSession) {
      console.log('✏️ 타로 세션 업데이트됨:', sessionId);
    }

    return updatedSession;
  }

  static async deleteTarotSession(sessionId: string): Promise<boolean> {
    const deleted = await LocalStorageManager.deleteTarotSession(sessionId);
    if (deleted) {
      console.log('🗑️ 타로 세션 삭제됨:', sessionId);
    }

    return deleted;
  }

  // 저널 엔트리 관리 (로컬 전용)
  static async getJournalEntries(): Promise<JournalEntry[]> {
    return await LocalStorageManager.getJournalEntries();
  }

  static async addJournalEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> {
    // 사용량 제한 확인
    const usageCheck = await LocalStorageManager.checkUsageLimit('journal_entries');
    if (!usageCheck.canCreate) {
      throw new Error('저널 한도에 도달했습니다. 프리미엄으로 업그레이드하시거나 기존 엔트리를 삭제해주세요.');
    }

    // 로컬에 저장
    const newEntry = await LocalStorageManager.addJournalEntry(entry);
    console.log('📖 새 저널 엔트리 저장됨:', newEntry.id);

    return newEntry;
  }

  static async updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<JournalEntry | null> {
    const updatedEntry = await LocalStorageManager.updateJournalEntry(entryId, updates);
    if (updatedEntry) {
      console.log('✏️ 저널 엔트리 업데이트됨:', entryId);
    }

    return updatedEntry;
  }

  static async deleteJournalEntry(entryId: string): Promise<boolean> {
    const deleted = await LocalStorageManager.deleteJournalEntry(entryId);
    if (deleted) {
      console.log('🗑️ 저널 엔트리 삭제됨:', entryId);
    }

    return deleted;
  }

  // 사용자 설정 관리
  static async getUserSettings(): Promise<UserSettings> {
    return await LocalStorageManager.getUserSettings();
  }

  static async updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const updatedSettings = await LocalStorageManager.updateUserSettings(updates);
    console.log('⚙️ 사용자 설정 업데이트됨');

    return updatedSettings;
  }

  // 프리미엄 상태 관리
  static async getPremiumStatus(): Promise<PremiumStatus> {
    return await LocalStorageManager.getPremiumStatus();
  }

  static async updatePremiumStatus(status: PremiumStatus): Promise<void> {
    await LocalStorageManager.updatePremiumStatus(status);
    console.log('💎 프리미엄 상태 업데이트됨:', status.isPremium);
  }

  // 로컬 데이터 상태 조회
  static async getLocalDataStatus(): Promise<LocalDataStatus> {
    try {
      const [sessions, entries] = await Promise.all([
        LocalStorageManager.getTarotSessions(),
        LocalStorageManager.getJournalEntries()
      ]);

      // 저장소 사용량 계산 (근사치)
      const storageEstimate = (sessions.length * 2) + (entries.length * 3); // KB 단위 추정

      const lastBackupTime = await LocalStorageManager.getItem('last_backup_time');

      return {
        totalSessions: sessions.length,
        totalJournalEntries: entries.length,
        storageUsed: storageEstimate,
        lastBackupTime: lastBackupTime || undefined
      };
    } catch (error) {
      console.error('로컬 데이터 상태 조회 오류:', error);
      return {
        totalSessions: 0,
        totalJournalEntries: 0,
        storageUsed: 0
      };
    }
  }

  // 데이터 내보내기/가져오기
  static async exportData(): Promise<string> {
    const exportedData = await LocalStorageManager.exportAllData();

    // 백업 시간 기록
    await LocalStorageManager.setItem('last_backup_time', new Date().toISOString());
    console.log('📤 데이터 내보내기 완료');

    return exportedData;
  }

  static async importData(jsonData: string): Promise<{ success: boolean; message: string }> {
    const result = await LocalStorageManager.importAllData(jsonData);

    if (result.success) {
      console.log('📥 데이터 가져오기 완료');
    }

    return result;
  }

  // 사용량 체크
  static async checkUsageLimit(type: 'sessions' | 'journal_entries'): Promise<{ canCreate: boolean; isAtLimit: boolean }> {
    return await LocalStorageManager.checkUsageLimit(type);
  }

  static async getUsageLimits() {
    return await LocalStorageManager.getUsageLimits();
  }
}

export default LocalDataManager;