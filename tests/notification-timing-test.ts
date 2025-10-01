/**
 * 알림 시간 정확도 테스트
 *
 * 목적: 매시 정각에 알림이 발송되는지 검증
 *
 * 테스트 시나리오:
 * 1. 현재 시각: 14:30
 *    - 기대: 15:00, 16:00, 17:00... 알림 스케줄
 *    - 실패 케이스: 15:30, 16:30, 17:30... (1시간 후부터)
 *
 * 2. 현재 시각: 23:45
 *    - 기대: 00:00 (자정), 01:00, 02:00... 알림 스케줄
 *    - 실패 케이스: 00:45, 01:45, 02:45...
 *
 * 3. 정각인 경우 (예: 10:00)
 *    - 기대: 11:00, 12:00, 13:00... (다음 정각부터)
 *    - 실패 케이스: 11:00 포함하여 이미 지난 시간
 */

// 테스트용 시간 계산 함수 (실제 코드 로직 재현)
function calculateNextHourNotifications(currentTime: Date, count: number = 5): Date[] {
  const notifications: Date[] = [];

  // 다음 정각 계산
  const nextHour = new Date(currentTime);
  nextHour.setHours(currentTime.getHours() + 1, 0, 0, 0);

  // 다음 정각부터 count개의 알림 시간 생성
  for (let i = 0; i < count; i++) {
    const triggerDate = new Date(nextHour.getTime() + (i * 60 * 60 * 1000));
    notifications.push(triggerDate);
  }

  return notifications;
}

// 테스트 케이스 실행
function runTimingTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 알림 시간 정확도 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const testCases = [
    {
      name: '오후 2시 30분 (일반 케이스)',
      currentTime: new Date(2025, 0, 1, 14, 30, 0),
      expectedHours: [15, 16, 17, 18, 19]
    },
    {
      name: '오후 11시 45분 (자정 넘어가는 케이스)',
      currentTime: new Date(2025, 0, 1, 23, 45, 0),
      expectedHours: [0, 1, 2, 3, 4]
    },
    {
      name: '오전 10시 정각 (정각 케이스)',
      currentTime: new Date(2025, 0, 1, 10, 0, 0),
      expectedHours: [11, 12, 13, 14, 15]
    },
    {
      name: '오전 0시 5분 (자정 직후)',
      currentTime: new Date(2025, 0, 1, 0, 5, 0),
      expectedHours: [1, 2, 3, 4, 5]
    },
    {
      name: '오후 11시 59분 (자정 1분 전)',
      currentTime: new Date(2025, 0, 1, 23, 59, 0),
      expectedHours: [0, 1, 2, 3, 4]
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  testCases.forEach((testCase, index) => {
    console.log(`\n테스트 ${index + 1}: ${testCase.name}`);
    console.log(`현재 시각: ${formatTime(testCase.currentTime)}`);

    const notifications = calculateNextHourNotifications(testCase.currentTime, 5);
    const actualHours = notifications.map(n => n.getHours());

    console.log(`기대 시간: ${testCase.expectedHours.map(h => `${h}:00`).join(', ')}`);
    console.log(`실제 시간: ${actualHours.map(h => `${h}:00`).join(', ')}`);

    // 시간 검증
    const isCorrect = JSON.stringify(actualHours) === JSON.stringify(testCase.expectedHours);

    if (isCorrect) {
      console.log('✅ 테스트 통과');
      passedTests++;
    } else {
      console.log('❌ 테스트 실패');
      failedTests++;
    }

    // 정각 검증 (분, 초, 밀리초가 모두 0인지)
    const allOnTheHour = notifications.every(n =>
      n.getMinutes() === 0 && n.getSeconds() === 0 && n.getMilliseconds() === 0
    );

    if (allOnTheHour) {
      console.log('✅ 모든 알림이 정각에 스케줄됨');
    } else {
      console.log('❌ 정각이 아닌 시간에 스케줄된 알림 발견');
      failedTests++;
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📈 테스트 결과 요약`);
  console.log(`   통과: ${passedTests}개`);
  console.log(`   실패: ${failedTests}개`);
  console.log(`   성공률: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return failedTests === 0;
}

// 시간 포맷 헬퍼
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// 테스트 실행
const allTestsPassed = runTimingTests();

if (allTestsPassed) {
  console.log('🎉 모든 테스트 통과! 알림 시간이 정확합니다.\n');
  process.exit(0);
} else {
  console.log('⚠️ 일부 테스트 실패. 알림 시간 로직을 확인하세요.\n');
  process.exit(1);
}
