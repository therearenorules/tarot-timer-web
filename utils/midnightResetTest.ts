/**
 * 자정 초기화 시스템 테스트 유틸리티
 *
 * 사용법:
 * 1. 개발자 콘솔에서 import { testMidnightReset } from './utils/midnightResetTest'
 * 2. testMidnightReset() 실행
 * 3. 로그 확인
 */

// 날짜 문자열 가져오기 (YYYY-MM-DD)
const getDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// 시간 변경 시뮬레이션 테스트
export const testMidnightReset = () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 자정 초기화 시스템 테스트 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const currentDate = getDateString();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  console.log(`📅 현재 날짜: ${currentDate}`);
  console.log(`🕐 현재 시각: ${currentHour}:${currentTime.getMinutes().toString().padStart(2, '0')}`);
  console.log('');

  console.log('✅ 예상 동작:');
  console.log('1️⃣ 앱 실행 중 자정(00:00)이 되면:');
  console.log('   - useTimer가 날짜 변경 감지');
  console.log('   - handleMidnightReset() 자동 실행');
  console.log('   - 24시간 카드 상태 초기화');
  console.log('   - 새로운 날짜로 카드 데이터 로드');
  console.log('');

  console.log('2️⃣ 앱을 종료했다가 다음날 실행하면:');
  console.log('   - getTodayDateString()이 새로운 날짜 반환');
  console.log('   - 새로운 날짜 키로 조회 → 빈 데이터');
  console.log('   - 사용자가 새 카드 뽑기 버튼 클릭');
  console.log('');

  console.log('3️⃣ 백그라운드에서 자정이 지나고 포어그라운드 복귀:');
  console.log('   - AppState 리스너가 날짜 변경 감지');
  console.log('   - handleMidnightReset() 자동 실행');
  console.log('   - 24시간 카드 상태 초기화');
  console.log('');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 현재 시스템 상태 확인');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // AsyncStorage 키 확인
  const storageKey = `tarot_daily_${currentDate}`;
  console.log(`🗄️ AsyncStorage 키: ${storageKey}`);
  console.log('');

  console.log('🎯 테스트 방법:');
  console.log('1. 23:58에 앱 실행 → 카드 뽑기');
  console.log('2. 앱을 계속 실행한 채로 자정(00:00) 대기');
  console.log('3. 자정이 되면 콘솔에 다음 메시지 확인:');
  console.log('   "🌙 자정 감지: 2025-10-08 → 2025-10-09"');
  console.log('   "🌙 자정 초기화 - 24시간 카드 리셋 시작"');
  console.log('   "🌙 TimerTab - 자정 초기화 실행"');
  console.log('   "✅ 자정 초기화 완료 - 새로운 24시간 카드를 뽑아주세요!"');
  console.log('4. 화면에서 카드가 사라졌는지 확인');
  console.log('5. "24시간 카드 뽑기" 버튼 클릭 → 새 카드 생성');
  console.log('');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 테스트 준비 완료');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

// 자정까지 남은 시간 계산
export const getTimeUntilMidnight = (): string => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours}시간 ${minutes}분 ${seconds}초`;
};

// 현재 상태 요약
export const showCurrentStatus = () => {
  const currentDate = getDateString();
  const currentTime = new Date();
  const timeUntilMidnight = getTimeUntilMidnight();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 자정 초기화 시스템 현재 상태');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📅 현재 날짜: ${currentDate}`);
  console.log(`🕐 현재 시각: ${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`);
  console.log(`⏰ 자정까지: ${timeUntilMidnight}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

// 전역으로 노출 (개발 모드에서만)
if (__DEV__) {
  (global as any).testMidnightReset = testMidnightReset;
  (global as any).showMidnightStatus = showCurrentStatus;

  console.log('🧪 자정 초기화 테스트 유틸리티 로드됨');
  console.log('📌 사용 방법:');
  console.log('   - testMidnightReset() : 전체 테스트 가이드 출력');
  console.log('   - showMidnightStatus() : 현재 상태 확인');
}
