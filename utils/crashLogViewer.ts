/**
 * 크래시 로그 뷰어 유틸리티
 * AsyncStorage에 저장된 크래시 로그를 조회하고 분석
 */

import { Platform } from 'react-native';

// AsyncStorage 동적 로드
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('⚠️ AsyncStorage not available');
  }
}

/**
 * 저장된 모든 크래시 로그 조회
 */
export async function viewCrashLogs() {
  try {
    if (!AsyncStorage) {
      console.warn('⚠️ AsyncStorage를 사용할 수 없습니다 (웹 환경)');
      return null;
    }

    const logsJson = await AsyncStorage.getItem('CRASH_LOGS');

    if (!logsJson) {
      console.log('📭 저장된 크래시 로그가 없습니다');
      return null;
    }

    const logs = JSON.parse(logsJson);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 총 ${logs.length}개의 크래시 로그 발견`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    logs.forEach((log: any, index: number) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📌 크래시 #${index + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`⏰ 발생 시간: ${log.timestamp}`);
      console.log(`📱 플랫폼: ${log.platform}`);
      console.log(`🏗️ 빌드: ${log.buildType}`);
      if (log.tabName) {
        console.log(`📑 탭: ${log.tabName}`);
      }
      console.log(`\n━━━ 오류 타입 ━━━`);
      console.log(log.name);
      console.log(`\n━━━ 오류 메시지 ━━━`);
      console.log(log.message);
      console.log(`\n━━━ 스택 트레이스 ━━━`);
      console.log(log.stack || '없음');
      console.log(`\n━━━ 컴포넌트 스택 ━━━`);
      console.log(log.componentStack || '없음');
      console.log('\n');
    });

    return logs;
  } catch (error) {
    console.error('❌ 크래시 로그 조회 실패:', error);
    return null;
  }
}

/**
 * 최신 크래시 로그만 조회
 */
export async function viewLatestCrash() {
  try {
    if (!AsyncStorage) {
      console.warn('⚠️ AsyncStorage를 사용할 수 없습니다 (웹 환경)');
      return null;
    }

    const logsJson = await AsyncStorage.getItem('CRASH_LOGS');

    if (!logsJson) {
      console.log('📭 저장된 크래시 로그가 없습니다');
      return null;
    }

    const logs = JSON.parse(logsJson);
    const latest = logs[0];

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📌 최신 크래시 로그`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏰ 발생 시간: ${latest.timestamp}`);
    console.log(`📱 플랫폼: ${latest.platform}`);
    console.log(`🏗️ 빌드: ${latest.buildType}`);
    if (latest.tabName) {
      console.log(`📑 탭: ${latest.tabName}`);
    }
    console.log(`\n━━━ 오류 타입 ━━━`);
    console.log(latest.name);
    console.log(`\n━━━ 오류 메시지 ━━━`);
    console.log(latest.message);
    console.log(`\n━━━ 스택 트레이스 ━━━`);
    console.log(latest.stack || '없음');
    console.log(`\n━━━ 컴포넌트 스택 ━━━`);
    console.log(latest.componentStack || '없음');
    console.log('\n');

    return latest;
  } catch (error) {
    console.error('❌ 최신 크래시 로그 조회 실패:', error);
    return null;
  }
}

/**
 * 크래시 로그 삭제
 */
export async function clearCrashLogs() {
  try {
    if (!AsyncStorage) {
      console.warn('⚠️ AsyncStorage를 사용할 수 없습니다 (웹 환경)');
      return false;
    }

    await AsyncStorage.removeItem('CRASH_LOGS');
    console.log('✅ 모든 크래시 로그가 삭제되었습니다');
    return true;
  } catch (error) {
    console.error('❌ 크래시 로그 삭제 실패:', error);
    return false;
  }
}

/**
 * 크래시 통계 조회
 */
export async function getCrashStats() {
  try {
    if (!AsyncStorage) {
      console.warn('⚠️ AsyncStorage를 사용할 수 없습니다 (웹 환경)');
      return null;
    }

    const logsJson = await AsyncStorage.getItem('CRASH_LOGS');

    if (!logsJson) {
      console.log('📭 저장된 크래시 로그가 없습니다');
      return null;
    }

    const logs = JSON.parse(logsJson);

    // 통계 계산
    const stats = {
      total: logs.length,
      byTab: {} as Record<string, number>,
      byPlatform: {} as Record<string, number>,
      byErrorType: {} as Record<string, number>,
      mostRecent: logs[0]?.timestamp,
      oldOldest: logs[logs.length - 1]?.timestamp,
    };

    logs.forEach((log: any) => {
      // 탭별 통계
      if (log.tabName) {
        stats.byTab[log.tabName] = (stats.byTab[log.tabName] || 0) + 1;
      }

      // 플랫폼별 통계
      stats.byPlatform[log.platform] = (stats.byPlatform[log.platform] || 0) + 1;

      // 에러 타입별 통계
      stats.byErrorType[log.name] = (stats.byErrorType[log.name] || 0) + 1;
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 크래시 통계');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`총 크래시 수: ${stats.total}개`);
    console.log(`\n━━━ 탭별 크래시 ━━━`);
    Object.entries(stats.byTab).forEach(([tab, count]) => {
      console.log(`${tab}: ${count}개`);
    });
    console.log(`\n━━━ 플랫폼별 크래시 ━━━`);
    Object.entries(stats.byPlatform).forEach(([platform, count]) => {
      console.log(`${platform}: ${count}개`);
    });
    console.log(`\n━━━ 에러 타입별 크래시 ━━━`);
    Object.entries(stats.byErrorType).forEach(([type, count]) => {
      console.log(`${type}: ${count}개`);
    });
    console.log(`\n최신 크래시: ${stats.mostRecent}`);
    console.log(`가장 오래된 크래시: ${stats.oldOldest}`);
    console.log('\n');

    return stats;
  } catch (error) {
    console.error('❌ 크래시 통계 조회 실패:', error);
    return null;
  }
}

// 전역 함수로 노출 (개발 모드)
if (__DEV__) {
  (global as any).viewCrashLogs = viewCrashLogs;
  (global as any).viewLatestCrash = viewLatestCrash;
  (global as any).clearCrashLogs = clearCrashLogs;
  (global as any).getCrashStats = getCrashStats;

  console.log('🔍 크래시 로그 뷰어 로드 완료');
  console.log('📌 사용 가능한 함수:');
  console.log('   - viewCrashLogs() : 모든 크래시 로그 조회');
  console.log('   - viewLatestCrash() : 최신 크래시 로그 조회');
  console.log('   - getCrashStats() : 크래시 통계 조회');
  console.log('   - clearCrashLogs() : 모든 크래시 로그 삭제');
}
