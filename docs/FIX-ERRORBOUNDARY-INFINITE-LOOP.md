# ErrorBoundary 무한 루프 문제 해결 보고서

**작성일**: 2025-10-24
**문제**: 앱 백그라운드 복귀 시 ErrorBoundary 화면이 표시되고 "다시 시도" 버튼을 눌러도 화면이 사라지지 않음
**심각도**: 🔴 CRITICAL - 앱 사용 불가

---

## 📋 문제 상황

### 증상
1. 앱을 백그라운드로 보냈다가 다시 포그라운드로 복귀
2. ErrorBoundary 화면 표시:
   ```
   ⚠️ 오류 발생
   Tarot Timer 탭을 로드하는 중 문제가 발생했습니다.
   [다시 시도] 버튼
   ```
3. "다시 시도" 버튼 클릭 → 화면이 사라지지 않고 계속 표시됨
4. 앱 사용 불가능 상태

### 재현 방법
```
1. 앱 실행
2. 홈 버튼 눌러 백그라운드로 이동
3. 몇 초 후 앱 다시 열기
4. ErrorBoundary 화면 표시
5. "다시 시도" 버튼 클릭
6. 화면이 사라지지 않음 (무한 루프)
```

---

## 🔍 원인 분석

### 근본 원인
**ErrorBoundary의 `handleReset` 메서드가 단순히 state만 초기화하고 실제 에러 원인은 해결하지 못함**

#### 기존 코드 (문제)
```typescript
// components/ErrorBoundary.tsx (174-179라인)
handleReset = () => {
  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  if (this.props.onReset) {
    this.props.onReset();
  }
};
```

#### 문제 흐름
```
1. 백그라운드 복귀 시 크래시 발생
   ↓
2. ErrorBoundary가 에러 캐치 → hasError: true
   ↓
3. 에러 화면 표시
   ↓
4. "다시 시도" 버튼 클릭
   ↓
5. handleReset() 실행 → hasError: false (state만 초기화)
   ↓
6. 컴포넌트 다시 렌더링 시도
   ↓
7. 동일한 에러 발생 (원인 미해결)
   ↓
8. ErrorBoundary가 다시 에러 캐치 → hasError: true
   ↓
9. 무한 루프 발생 (3번으로 돌아감)
```

### 실제 크래시 원인 (추정)
- **AppState 핸들러 문제**: 앱 복귀 시 상태 갱신 중 에러
- **Context 초기화 문제**: PremiumContext, NotificationContext 등
- **Timer 초기화 문제**: useTimer 훅의 AppState 처리
- **메모리 릭**: 클린업되지 않은 이벤트 리스너

---

## ✅ 해결 방법

### 1. ErrorBoundary.tsx 수정
**"다시 시도" 버튼이 앱 전체를 리로드하도록 변경**

#### 수정 후 코드
```typescript
handleReset = () => {
  // ✅ CRITICAL FIX: 단순 state 초기화가 아닌 앱 전체 리로드
  // React Native에서는 Updates.reloadAsync() 사용
  // 웹에서는 window.location.reload() 사용

  console.log('🔄 앱 전체 리로드 시도...');

  if (Platform.OS === 'web') {
    // 웹 환경: 페이지 새로고침
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } else {
    // 모바일 환경: Expo Updates 사용
    try {
      const Updates = require('expo-updates');
      Updates.reloadAsync().catch((error: any) => {
        console.error('❌ 앱 리로드 실패:', error);
        // Fallback: state만 초기화 (마지막 수단)
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        if (this.props.onReset) {
          this.props.onReset();
        }
      });
    } catch (error) {
      console.error('❌ expo-updates 로드 실패:', error);
      // Fallback: state만 초기화
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      if (this.props.onReset) {
        this.props.onReset();
      }
    }
  }
};
```

#### 개선 사항
- ✅ 웹: `window.location.reload()` 사용
- ✅ 모바일: `expo-updates`의 `reloadAsync()` 사용
- ✅ Fallback: expo-updates 로드 실패 시 기존 방식 사용
- ✅ 에러 처리: try-catch로 안전하게 처리

### 2. App.tsx TabErrorBoundary 수정
**동일한 로직 적용**

```typescript
handleReset = () => {
  // ✅ CRITICAL FIX: 단순 state 초기화가 아닌 앱 전체 리로드
  console.log(`🔄 ${this.props.tabName} 탭 에러 - 앱 전체 리로드 시도...`);

  if (Platform.OS === 'web') {
    // 웹 환경: 페이지 새로고침
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } else {
    // 모바일 환경: Expo Updates 사용
    try {
      const Updates = require('expo-updates');
      Updates.reloadAsync().catch((error: any) => {
        console.error('❌ 앱 리로드 실패:', error);
        // Fallback: state만 초기화 (마지막 수단)
        this.setState({ hasError: false, error: undefined });
      });
    } catch (error) {
      console.error('❌ expo-updates 로드 실패:', error);
      // Fallback: state만 초기화
      this.setState({ hasError: false, error: undefined });
    }
  }
};
```

### 3. 크래시 로그 뷰어 유틸리티 추가
**실제 크래시 원인을 파악하기 위한 디버깅 도구**

파일: `utils/crashLogViewer.ts`

#### 주요 기능
```typescript
// 개발 모드에서 사용 가능한 함수
viewCrashLogs()     // 모든 크래시 로그 조회
viewLatestCrash()   // 최신 크래시 로그 조회
getCrashStats()     // 크래시 통계 조회
clearCrashLogs()    // 모든 크래시 로그 삭제
```

#### 사용 방법
```typescript
// Expo Go 또는 Development Build에서
// Metro 콘솔에서 다음 명령어 실행

// 1. 최신 크래시 확인
viewLatestCrash()

// 2. 모든 크래시 확인
viewCrashLogs()

// 3. 크래시 통계
getCrashStats()

// 4. 로그 삭제
clearCrashLogs()
```

---

## 🧪 테스트 방법

### 1. 수정 확인
```bash
# 1. 개발 서버 실행
npm start

# 2. Expo Go에서 앱 열기

# 3. 백그라운드로 이동 후 다시 복귀

# 4. ErrorBoundary 화면 표시 시 "다시 시도" 버튼 클릭

# 5. 앱이 전체 리로드되는지 확인
```

### 2. 크래시 로그 확인
```typescript
// Metro 콘솔에서 실행
viewLatestCrash()

// 출력 예시:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📌 최신 크래시 로그
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⏰ 발생 시간: 2025-10-24T09:25:00.000Z
// 📱 플랫폼: ios
// 🏗️ 빌드: development
// 📑 탭: TimerTab
//
// ━━━ 오류 타입 ━━━
// TypeError
//
// ━━━ 오류 메시지 ━━━
// Cannot read property 'refreshStatus' of undefined
```

### 3. 예상 결과
```
✅ "다시 시도" 버튼 클릭 시
  → 앱 전체 리로드
  → 메인 화면으로 복귀
  → 정상 작동

❌ 이전 동작 (문제)
  → state만 초기화
  → 동일한 에러 다시 발생
  → 무한 루프
```

---

## 📊 수정 파일 목록

### 수정된 파일 (3개)
1. **components/ErrorBoundary.tsx**
   - `handleReset` 메서드 수정 (174-207라인)
   - 앱 전체 리로드 로직 추가

2. **App.tsx**
   - `TabErrorBoundary.handleReset` 메서드 추가 (180-204라인)
   - 크래시 로그 뷰어 import 추가 (48-58라인)
   - 앱 전체 리로드 로직 추가

3. **utils/crashLogViewer.ts** (신규)
   - 크래시 로그 조회 유틸리티
   - AsyncStorage 기반 디버깅 도구

---

## 🔮 향후 작업

### 1. 근본 원인 해결 (P0 - 긴급)
```
현재 수정은 임시 해결책 (앱 리로드)
실제 크래시 원인을 파악하고 수정 필요
```

#### 조사 필요 영역
- [ ] PremiumContext의 AppState 핸들러
- [ ] NotificationContext의 초기화
- [ ] useTimer의 AppState 처리
- [ ] 메모리 릭 및 클린업 누락

#### 조사 방법
```typescript
// 1. 크래시 로그 확인
viewLatestCrash()

// 2. 스택 트레이스 분석

// 3. 해당 컴포넌트/훅 수정

// 4. 테스트
```

### 2. 에러 복구 개선 (P1)
```
앱 전체 리로드 대신 더 우아한 복구 방법 고려
```

#### 개선 아이디어
- Context 선택적 리셋
- 문제 컴포넌트만 리마운트
- 상태 자동 복원

### 3. 모니터링 강화 (P2)
```
프로덕션에서 크래시 발생 시 자동 보고
```

#### 구현 계획
- Sentry 또는 Firebase Crashlytics 연동
- 자동 크래시 보고 시스템
- 크래시 통계 대시보드

---

## 📈 예상 효과

### 사용자 경험 개선
| 항목 | Before | After |
|------|--------|-------|
| 에러 화면 무한 루프 | ❌ 발생 | ✅ 해결 |
| 앱 복구 가능 여부 | ❌ 불가능 | ✅ 가능 (리로드) |
| 사용자 대응 시간 | 앱 재시작 필요 | 버튼 클릭만 |

### 개발자 경험 개선
- ✅ 크래시 로그 조회 기능 추가
- ✅ 디버깅 도구 제공
- ✅ 실시간 크래시 분석 가능

---

## 🎓 배운 교훈

### 1. ErrorBoundary 설계 원칙
```
❌ 잘못된 방식: state만 초기화
✅ 올바른 방식:
  - 앱 전체 리로드
  - 또는 근본 원인 해결
  - 또는 Context 선택적 리셋
```

### 2. 에러 복구 전략
```
Level 1: 컴포넌트 리마운트
Level 2: Context 리셋
Level 3: 앱 전체 리로드 ✅ (현재 적용)
Level 4: 앱 재시작 필요
```

### 3. 디버깅 도구 중요성
```
크래시 로그 수집 → 원인 파악 → 근본 해결
없으면 무한 루프 원인 찾기 어려움
```

---

## 📞 추가 지원

### 크래시 로그 제출
```
1. viewLatestCrash() 실행
2. 콘솔 출력 복사
3. GitHub Issue 생성
4. 로그 첨부
```

### 관련 이슈
- GitHub: https://github.com/therearenorules/tarot-timer-web/issues
- 이메일: changsekwon@gmail.com

---

**작성자**: Claude Code Assistant
**최종 업데이트**: 2025-10-24
**상태**: ✅ 임시 해결 완료 (근본 원인 조사 필요)
