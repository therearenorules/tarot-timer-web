/**
 * AppState 이벤트 중앙 관리 시스템
 * 백그라운드/포그라운드 전환 시 발생하는 모든 이벤트를 조율
 */

import { Platform, AppState, AppStateStatus } from 'react-native';

type AppStateCallback = () => void | Promise<void>;

interface AppStateHandler {
  id: string;
  priority: number;
  callback: AppStateCallback;
  debounceMs: number;
}

export class AppStateManager {
  private static instance: AppStateManager;
  private handlers: AppStateHandler[] = [];
  private subscription: any = null;
  private lastActiveTime = 0;
  private isProcessing = false;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  // ✅ CRITICAL: AppState 이벤트 완전 비활성화 플래그
  private static DISABLE_APPSTATE_EVENTS = false; // true로 변경하면 모든 AppState 이벤트 차단

  private constructor() {
    this.initialize();
  }

  static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  /**
   * AppState 리스너 초기화
   */
  private initialize() {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('⚠️ AppStateManager: 웹 환경에서는 작동하지 않음');
      return;
    }

    if (AppStateManager.DISABLE_APPSTATE_EVENTS) {
      console.log('🚫 AppStateManager: AppState 이벤트 완전 비활성화됨');
      return;
    }

    try {
      this.subscription = AppState.addEventListener('change', this.handleAppStateChange.bind(this));
      console.log('✅ AppStateManager 초기화 완료');
    } catch (error) {
      console.error('❌ AppStateManager 초기화 실패:', error);
    }
  }

  /**
   * AppState 변경 핸들러 (중앙 조율)
   */
  private handleAppStateChange(nextAppState: AppStateStatus) {
    try {
      if (nextAppState === 'active') {
        const now = Date.now();
        const timeSinceLastActive = now - this.lastActiveTime;
        this.lastActiveTime = now;

        console.log(`📱 앱 포그라운드 복귀 (마지막 활성: ${timeSinceLastActive}ms 전)`);

        // ✅ CRITICAL: 이미 처리 중이면 중복 실행 방지
        if (this.isProcessing) {
          console.log('⏳ 이미 처리 중 - 중복 실행 방지');
          return;
        }

        // ✅ CRITICAL: 우선순위 순서대로 핸들러 실행 (병렬이 아닌 순차)
        this.executeHandlersSequentially();
      }
    } catch (error) {
      console.error('❌ AppStateManager 핸들러 오류:', error);
    }
  }

  /**
   * 핸들러를 우선순위 순서대로 순차 실행
   */
  private async executeHandlersSequentially() {
    if (this.handlers.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // 우선순위 순서로 정렬 (낮은 숫자 = 높은 우선순위)
      const sortedHandlers = [...this.handlers].sort((a, b) => a.priority - b.priority);

      for (const handler of sortedHandlers) {
        try {
          // 디바운스 체크
          if (this.debounceTimers.has(handler.id)) {
            console.log(`⏭️ ${handler.id} 디바운스 중 - 스킵`);
            continue;
          }

          console.log(`🔄 ${handler.id} 실행 중 (우선순위: ${handler.priority})...`);

          // 디바운스 타이머 설정
          if (handler.debounceMs > 0) {
            const timer = setTimeout(() => {
              this.debounceTimers.delete(handler.id);
            }, handler.debounceMs);
            this.debounceTimers.set(handler.id, timer);
          }

          // 핸들러 실행 (타임아웃 5초)
          await Promise.race([
            handler.callback(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);

          console.log(`✅ ${handler.id} 완료`);
        } catch (error) {
          console.error(`❌ ${handler.id} 실행 실패:`, error);
          // 한 핸들러 실패해도 계속 진행
        }
      }
    } finally {
      this.isProcessing = false;
      console.log('✅ 모든 AppState 핸들러 실행 완료');
    }
  }

  /**
   * 핸들러 등록
   * @param id 고유 식별자
   * @param callback 실행할 함수
   * @param priority 우선순위 (낮을수록 먼저 실행, 기본: 100)
   * @param debounceMs 디바운스 시간 (기본: 1000ms)
   */
  registerHandler(
    id: string,
    callback: AppStateCallback,
    priority: number = 100,
    debounceMs: number = 1000
  ): () => void {
    if (AppStateManager.DISABLE_APPSTATE_EVENTS) {
      console.log(`🚫 AppStateManager: ${id} 등록 차단됨 (비활성화)`);
      return () => {}; // no-op
    }

    // 이미 등록된 핸들러는 제거
    this.unregisterHandler(id);

    const handler: AppStateHandler = {
      id,
      priority,
      callback,
      debounceMs
    };

    this.handlers.push(handler);
    console.log(`📝 AppStateManager: ${id} 등록됨 (우선순위: ${priority})`);

    // 정리 함수 반환
    return () => this.unregisterHandler(id);
  }

  /**
   * 핸들러 제거
   */
  unregisterHandler(id: string) {
    const index = this.handlers.findIndex(h => h.id === id);
    if (index !== -1) {
      this.handlers.splice(index, 1);
      console.log(`🗑️ AppStateManager: ${id} 제거됨`);
    }

    // 디바운스 타이머 정리
    const timer = this.debounceTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(id);
    }
  }

  /**
   * 모든 핸들러 제거 및 정리
   */
  dispose() {
    this.handlers = [];

    // 모든 디바운스 타이머 정리
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    if (this.subscription?.remove) {
      this.subscription.remove();
      this.subscription = null;
    }

    console.log('🧹 AppStateManager 정리 완료');
  }
}

export default AppStateManager;
