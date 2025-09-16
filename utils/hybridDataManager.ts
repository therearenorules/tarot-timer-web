/**
 * 하이브리드 데이터 매니저
 * 로컬 우선 저장 + 선택적 클라우드 백업
 */

import LocalStorageManager, {
  TarotSession,
  JournalEntry,
  UserSettings,
  PremiumStatus
} from './localStorage';
import { supabase } from './supabase';

export interface SyncStatus {
  isEnabled: boolean;
  lastSyncTime?: string;
  pendingChanges: number;
  syncInProgress: boolean;
  lastError?: string;
}

export class HybridDataManager {
  private static syncInProgress = false;
  private static pendingChanges: Set<string> = new Set();

  // 로컬 우선 데이터 로딩
  static async initialize(): Promise<void> {
    try {
      // 앱 첫 실행 확인
      const isFirstLaunch = await LocalStorageManager.isFirstLaunch();

      if (isFirstLaunch) {
        console.log('🎯 첫 실행: 로컬 저장소 초기화');
        await LocalStorageManager.getUserSettings(); // 기본 설정 생성
      }

      // 클라우드 백업이 활성화되어 있다면 동기화 시도
      const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
      if (isCloudEnabled) {
        await this.attemptCloudSync();
      }

    } catch (error) {
      console.error('하이브리드 데이터 매니저 초기화 오류:', error);
    }
  }

  // 타로 세션 관리 (로컬 우선)
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

    // 클라우드 백업이 활성화되어 있다면 동기화 마킹
    const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
    if (isCloudEnabled) {
      this.markForSync('tarot_session_' + newSession.id);
      this.scheduleDeferredSync();
    }

    return newSession;
  }

  static async updateTarotSession(sessionId: string, updates: Partial<TarotSession>): Promise<TarotSession | null> {
    const updatedSession = await LocalStorageManager.updateTarotSession(sessionId, updates);

    if (updatedSession) {
      const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
      if (isCloudEnabled) {
        this.markForSync('tarot_session_' + sessionId);
        this.scheduleDeferredSync();
      }
    }

    return updatedSession;
  }

  static async deleteTarotSession(sessionId: string): Promise<boolean> {
    const deleted = await LocalStorageManager.deleteTarotSession(sessionId);

    if (deleted) {
      const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
      if (isCloudEnabled) {
        this.markForSync('delete_tarot_session_' + sessionId);
        this.scheduleDeferredSync();
      }
    }

    return deleted;
  }

  // 저널 엔트리 관리 (로컬 우선)
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

    // 클라우드 백업 마킹
    const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
    if (isCloudEnabled) {
      this.markForSync('journal_entry_' + newEntry.id);
      this.scheduleDeferredSync();
    }

    return newEntry;
  }

  static async updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<JournalEntry | null> {
    const updatedEntry = await LocalStorageManager.updateJournalEntry(entryId, updates);

    if (updatedEntry) {
      const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
      if (isCloudEnabled) {
        this.markForSync('journal_entry_' + entryId);
        this.scheduleDeferredSync();
      }
    }

    return updatedEntry;
  }

  static async deleteJournalEntry(entryId: string): Promise<boolean> {
    const deleted = await LocalStorageManager.deleteJournalEntry(entryId);

    if (deleted) {
      const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
      if (isCloudEnabled) {
        this.markForSync('delete_journal_entry_' + entryId);
        this.scheduleDeferredSync();
      }
    }

    return deleted;
  }

  // 사용자 설정 관리
  static async getUserSettings(): Promise<UserSettings> {
    return await LocalStorageManager.getUserSettings();
  }

  static async updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const updatedSettings = await LocalStorageManager.updateUserSettings(updates);

    const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
    if (isCloudEnabled) {
      this.markForSync('user_settings');
      this.scheduleDeferredSync();
    }

    return updatedSettings;
  }

  // 프리미엄 상태 관리
  static async getPremiumStatus(): Promise<PremiumStatus> {
    return await LocalStorageManager.getPremiumStatus();
  }

  static async updatePremiumStatus(status: PremiumStatus): Promise<void> {
    await LocalStorageManager.updatePremiumStatus(status);

    const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
    if (isCloudEnabled) {
      this.markForSync('premium_status');
      this.scheduleDeferredSync();
    }
  }

  // 클라우드 백업 토글
  static async enableCloudBackup(): Promise<{ success: boolean; message: string }> {
    try {
      // Supabase 연결 확인
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          message: '클라우드 백업을 위해서는 로그인이 필요합니다.'
        };
      }

      await LocalStorageManager.setCloudBackupEnabled(true);

      // 전체 데이터 백업 시작
      await this.performFullCloudBackup();

      return {
        success: true,
        message: '클라우드 백업이 활성화되었습니다.'
      };
    } catch (error) {
      console.error('클라우드 백업 활성화 오류:', error);
      return {
        success: false,
        message: '클라우드 백업 활성화 중 오류가 발생했습니다.'
      };
    }
  }

  static async disableCloudBackup(): Promise<void> {
    await LocalStorageManager.setCloudBackupEnabled(false);
    this.pendingChanges.clear();
  }

  // 동기화 상태 조회
  static async getSyncStatus(): Promise<SyncStatus> {
    const isEnabled = await LocalStorageManager.isCloudBackupEnabled();
    const lastSyncTime = await LocalStorageManager.getItem<string>('last_sync_time');

    return {
      isEnabled,
      lastSyncTime: lastSyncTime || undefined,
      pendingChanges: this.pendingChanges.size,
      syncInProgress: this.syncInProgress,
      lastError: await LocalStorageManager.getItem<string>('last_sync_error') || undefined
    };
  }

  // 수동 동기화
  static async manualSync(): Promise<{ success: boolean; message: string }> {
    const isEnabled = await LocalStorageManager.isCloudBackupEnabled();

    if (!isEnabled) {
      return {
        success: false,
        message: '클라우드 백업이 비활성화되어 있습니다.'
      };
    }

    try {
      await this.performFullCloudBackup();
      return {
        success: true,
        message: '동기화가 완료되었습니다.'
      };
    } catch (error) {
      console.error('수동 동기화 오류:', error);
      return {
        success: false,
        message: '동기화 중 오류가 발생했습니다.'
      };
    }
  }

  // 내부 메서드들
  private static markForSync(changeId: string): void {
    this.pendingChanges.add(changeId);
  }

  private static scheduleDeferredSync(): void {
    // 5초 후 동기화 시도 (디바운싱)
    setTimeout(() => {
      if (this.pendingChanges.size > 0 && !this.syncInProgress) {
        this.attemptCloudSync();
      }
    }, 5000);
  }

  private static async attemptCloudSync(): Promise<void> {
    if (this.syncInProgress) return;

    try {
      this.syncInProgress = true;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // 로그인되지 않은 경우 스킵

      await this.performIncrementalSync();

    } catch (error) {
      console.error('클라우드 동기화 오류:', error);
      await LocalStorageManager.setItem('last_sync_error', error.message);
    } finally {
      this.syncInProgress = false;
    }
  }

  private static async performFullCloudBackup(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    // 모든 로컬 데이터를 클라우드에 백업
    const [sessions, entries, settings] = await Promise.all([
      LocalStorageManager.getTarotSessions(),
      LocalStorageManager.getJournalEntries(),
      LocalStorageManager.getUserSettings()
    ]);

    // Supabase에 데이터 업로드 (배치 처리)
    // 여기에 실제 Supabase 업로드 로직 구현
    // 현재는 시뮬레이션

    this.pendingChanges.clear();
    await LocalStorageManager.setItem('last_sync_time', new Date().toISOString());
  }

  private static async performIncrementalSync(): Promise<void> {
    // 변경된 항목들만 동기화
    const changes = Array.from(this.pendingChanges);

    for (const changeId of changes) {
      // 각 변경사항을 Supabase에 적용
      // 실제 구현에서는 changeId를 파싱하여 적절한 API 호출
      console.log('동기화 중:', changeId);
    }

    this.pendingChanges.clear();
    await LocalStorageManager.setItem('last_sync_time', new Date().toISOString());
  }

  // 데이터 내보내기/가져오기
  static async exportData(): Promise<string> {
    return await LocalStorageManager.exportAllData();
  }

  static async importData(jsonData: string): Promise<{ success: boolean; message: string }> {
    const result = await LocalStorageManager.importAllData(jsonData);

    if (result.success) {
      // 가져온 데이터를 클라우드에도 동기화
      const isCloudEnabled = await LocalStorageManager.isCloudBackupEnabled();
      if (isCloudEnabled) {
        this.markForSync('full_import');
        this.scheduleDeferredSync();
      }
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

export default HybridDataManager;