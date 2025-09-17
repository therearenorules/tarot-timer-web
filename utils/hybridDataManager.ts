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

    // 로컬 저장소만 사용 (클라우드 백업 제거됨)

    return newSession;
  }

  static async updateTarotSession(sessionId: string, updates: Partial<TarotSession>): Promise<TarotSession | null> {
    const updatedSession = await LocalStorageManager.updateTarotSession(sessionId, updates);

    // 로컬 저장소만 사용 (클라우드 백업 제거됨)

    return updatedSession;
  }

  static async deleteTarotSession(sessionId: string): Promise<boolean> {
    const deleted = await LocalStorageManager.deleteTarotSession(sessionId);

    // 로컬 저장소만 사용 (클라우드 백업 제거됨)

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

    // 로컬 저장소만 사용 (클라우드 백업 제거됨)

    return newEntry;
  }

  static async updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<JournalEntry | null> {
    const updatedEntry = await LocalStorageManager.updateJournalEntry(entryId, updates);

    // 로컬 저장소만 사용 (클라우드 백업 제거됨)

    return updatedEntry;
  }

  static async deleteJournalEntry(entryId: string): Promise<boolean> {
    const deleted = await LocalStorageManager.deleteJournalEntry(entryId);

    // 로컬 저장소만 사용 (클라우드 백업 제거됨)

    return deleted;
  }

  // 사용자 설정 관리
  static async getUserSettings(): Promise<UserSettings> {
    return await LocalStorageManager.getUserSettings();
  }

  static async updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const updatedSettings = await LocalStorageManager.updateUserSettings(updates);

    // 로컬 저장소만 사용 (클라우드 백업 제거됨)

    return updatedSettings;
  }

  // 프리미엄 상태 관리
  static async getPremiumStatus(): Promise<PremiumStatus> {
    return await LocalStorageManager.getPremiumStatus();
  }

  static async updatePremiumStatus(status: PremiumStatus): Promise<void> {
    await LocalStorageManager.updatePremiumStatus(status);

    // 로컬 저장소만 사용 (클라우드 백업 제거됨)
  }

  // 사용자 클라우드 백업 기능 제거됨 (관리자 전용으로 변경)
  // 로컬 저장소만 사용하도록 변경

  // 로컬 저장소 상태 조회 (클라우드 백업 제거됨)
  static async getSyncStatus(): Promise<SyncStatus> {
    return {
      isEnabled: false, // 사용자 클라우드 백업 비활성화
      lastSyncTime: undefined,
      pendingChanges: 0,
      syncInProgress: false,
      lastError: undefined
    };
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

    // 로컬 저장소에만 데이터 가져오기 (클라우드 백업 제거됨)

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