# 크래시 로그 확인 방법 가이드

**작성일**: 2025-10-24
**목적**: 앱 크래시 로그를 확인하고 분석하는 방법

---

## 📍 크래시 로그 저장 위치

### AsyncStorage 저장 구조
```typescript
// 저장 키: 'CRASH_LOGS'
// 저장 위치: 디바이스의 AsyncStorage
// 최대 개수: 10개 (자동으로 오래된 것 삭제)
// 저장 시점: ErrorBoundary가 에러를 캐치할 때

// 저장 형식:
[
  {
    message: "Cannot read property 'refreshStatus' of undefined",
    name: "TypeError",
    stack: "TypeError: Cannot read property...",
    componentStack: "in Component (at App.tsx:123)",
    timestamp: "2025-10-24T09:25:00.000Z",
    platform: "ios",
    buildType: "production",
    tabName: "TimerTab" // 탭에서 발생한 경우
  },
  // ... 최대 10개
]
```

---

## 🔍 크래시 로그 확인 방법

### 1️⃣ **개발 환경 (Expo Go 또는 Development Build)**

가장 쉽고 빠른 방법입니다!

#### 단계별 가이드
```bash
# 1. 개발 서버 실행
npm start

# 2. Expo Go 또는 Development Build에서 앱 열기

# 3. Metro 번들러 터미널에서 다음 명령어 입력:
```

#### 사용 가능한 명령어
```javascript
// 📌 최신 크래시 로그 1개만 보기 (추천)
viewLatestCrash()

// 📌 모든 크래시 로그 보기 (최대 10개)
viewCrashLogs()

// 📌 크래시 통계 보기
getCrashStats()

// 📌 크래시 로그 삭제
clearCrashLogs()
```

#### 출력 예시
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 최신 크래시 로그
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ 발생 시간: 2025-10-24T09:25:00.000Z
📱 플랫폼: ios
🏗️ 빌드: production
📑 탭: TimerTab

━━━ 오류 타입 ━━━
TypeError

━━━ 오류 메시지 ━━━
Cannot read property 'refreshStatus' of undefined

━━━ 스택 트레이스 ━━━
TypeError: Cannot read property 'refreshStatus' of undefined
    at PremiumContext.tsx:92:15
    at App.tsx:156:20
    ...

━━━ 컴포넌트 스택 ━━━
    in TimerTab (at App.tsx:345)
    in ErrorBoundary (at App.tsx:340)
    in TabContainer (at App.tsx:330)
```

---

### 2️⃣ **TestFlight (iOS)**

TestFlight에서는 **자동으로 크래시 로그를 수집**합니다!

#### TestFlight 크래시 로그 확인

##### A. TestFlight 앱에서 확인
```
1. TestFlight 앱 열기
2. "Tarot Timer" 앱 선택
3. "이전 빌드" 탭
4. 해당 빌드 선택
5. "크래시 보고서" 섹션
```

##### B. App Store Connect에서 확인 (더 상세함)
```
1. App Store Connect 로그인
   https://appstoreconnect.apple.com

2. "앱" 메뉴 클릭

3. "Tarot Timer" 앱 선택

4. 좌측 메뉴에서 "TestFlight" 클릭

5. "빌드" 탭에서 해당 빌드 선택

6. "크래시 및 메트릭" 섹션 확인
```

##### C. Xcode Organizer에서 확인 (Mac만)
```
1. Xcode 실행

2. Window > Organizer (⌘⇧O)

3. "Crashes" 탭 선택

4. "Tarot Timer" 앱 선택

5. 크래시 목록 및 상세 정보 확인
```

#### TestFlight 크래시 로그 정보
- ✅ **시스템 크래시**: iOS가 자동 수집
- ✅ **스택 트레이스**: 전체 콜 스택
- ✅ **디바이스 정보**: iOS 버전, 디바이스 모델
- ✅ **발생 빈도**: 얼마나 자주 발생하는지
- ⚠️ **우리가 저장한 AsyncStorage 로그**: 직접 접근 불가

#### TestFlight 제한사항
```
❌ AsyncStorage에 저장된 우리의 커스텀 로그는 TestFlight에서 직접 볼 수 없음
✅ 대신 시스템 레벨 크래시는 자동으로 수집됨
✅ 앱이 완전히 죽지 않고 ErrorBoundary가 캐치한 에러는 우리가 저장한 로그만 있음
```

---

### 3️⃣ **Production 빌드 (App Store)**

Production에서도 TestFlight와 동일하게 확인 가능합니다.

#### App Store Connect에서 확인
```
1. App Store Connect 로그인
   https://appstoreconnect.apple.com

2. "앱" 메뉴 클릭

3. "Tarot Timer" 앱 선택

4. 좌측 메뉴에서 "App Analytics" 클릭

5. "크래시" 섹션 선택

6. 크래시 보고서 확인
```

#### App Store Connect Analytics 정보
- ✅ **크래시율**: 전체 세션 대비 크래시 비율
- ✅ **영향받은 사용자**: 크래시를 경험한 사용자 수
- ✅ **크래시 그룹**: 유사한 크래시를 그룹화
- ✅ **iOS 버전별**: 각 iOS 버전에서의 크래시율

---

### 4️⃣ **이메일로 전송 받기** (가장 확실한 방법!)

ErrorBoundary 화면에서 직접 전송할 수 있습니다.

#### 사용 방법
```
1. 앱에서 크래시 발생
   ↓
2. ErrorBoundary 화면 표시
   ↓
3. "오류 보고 보내기" 버튼 클릭
   ↓
4. 이메일 앱 자동 열림 (changsekwon@gmail.com)
   ↓
5. 모든 크래시 로그가 이메일 본문에 자동 첨부됨
   ↓
6. 전송 버튼 클릭
```

#### 이메일 내용 예시
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 타로 타이머 크래시 리포트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 총 3개의 오류 발견

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 오류 #1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ 발생 시간: 2025-10-24T09:25:00.000Z
📱 플랫폼: ios
🏗️ 빌드: production
📑 탭: TimerTab

━━━ 오류 타입 ━━━
TypeError

━━━ 오류 메시지 ━━━
Cannot read property 'refreshStatus' of undefined

━━━ 스택 트레이스 ━━━
TypeError: Cannot read property 'refreshStatus' of undefined
    at PremiumContext.tsx:92:15
    ...

━━━ 컴포넌트 스택 ━━━
    in TimerTab (at App.tsx:345)
    ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 오류 #2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
```

---

## 🔄 크래시 로그 수집 흐름

### 전체 프로세스
```
1. 앱에서 에러 발생
   ↓
2. ErrorBoundary가 에러 캐치
   ↓
3. 크래시 로그를 AsyncStorage에 저장 (최대 10개)
   {
     message: "...",
     name: "TypeError",
     stack: "...",
     componentStack: "...",
     timestamp: "...",
     platform: "ios",
     buildType: "production",
     tabName: "TimerTab"
   }
   ↓
4. ErrorBoundary 화면 표시
   ↓
5. 사용자가 "오류 보고 보내기" 클릭 (선택)
   ↓
6. 모든 크래시 로그를 이메일로 전송
   ↓
7. 개발자가 이메일 수신 및 분석
```

---

## 🛠️ 개발자용 디버깅 팁

### 1. 실시간 로그 모니터링
```bash
# Metro 번들러 콘솔에서
viewLatestCrash()

# 앱을 사용하면서 주기적으로 확인
```

### 2. 크래시 재현
```typescript
// 의도적으로 크래시 발생시켜 테스트
throw new Error('테스트 크래시');

// 또는 TestErrorButton 컴포넌트 사용
// App.tsx에 이미 포함되어 있음
```

### 3. 크래시 패턴 분석
```javascript
// 크래시 통계로 패턴 파악
getCrashStats()

// 출력:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 크래시 통계
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 총 크래시 수: 5개
//
// ━━━ 탭별 크래시 ━━━
// TimerTab: 3개
// SettingsTab: 2개
//
// ━━━ 플랫폼별 크래시 ━━━
// ios: 4개
// android: 1개
//
// ━━━ 에러 타입별 크래시 ━━━
// TypeError: 3개
// ReferenceError: 2개
```

### 4. 로그 정리
```javascript
// 테스트 후 로그 삭제
clearCrashLogs()

// 확인
viewCrashLogs()
// → "📭 저장된 크래시 로그가 없습니다"
```

---

## 📱 플랫폼별 차이점

### iOS
```
✅ TestFlight 자동 크래시 수집
✅ App Store Connect Analytics
✅ Xcode Organizer (Mac)
✅ 우리의 AsyncStorage 로그
✅ 이메일 전송
```

### Android
```
✅ Google Play Console 자동 크래시 수집
✅ 우리의 AsyncStorage 로그
✅ 이메일 전송
⚠️ TestFlight 없음 (Internal Testing 사용)
```

### 웹
```
⚠️ AsyncStorage 없음 (LocalStorage 사용 가능)
✅ 브라우저 개발자 도구 콘솔
✅ 이메일 전송 (제한적)
```

---

## 🎯 추천 워크플로우

### 개발 중
```
1. 개발 서버 실행 (npm start)
2. 앱 테스트
3. 크래시 발생 시 Metro 콘솔에서 즉시 확인
   → viewLatestCrash()
4. 스택 트레이스 분석
5. 코드 수정
6. 재테스트
```

### TestFlight 배포 후
```
1. TestFlight 빌드 업로드
2. 테스터들에게 테스트 요청
3. App Store Connect에서 크래시 모니터링
4. 테스터가 이메일로 전송한 로그 확인
5. 패턴 분석 후 수정
6. 새 빌드 업로드
```

### Production 배포 후
```
1. App Store Connect Analytics 매일 확인
2. 크래시율 모니터링 (목표: <1%)
3. 사용자가 전송한 이메일 로그 확인
4. 핫픽스 또는 정기 업데이트로 수정
```

---

## 🚨 크래시 발생 시 체크리스트

### 즉시 확인
- [ ] 크래시 로그 확인 (`viewLatestCrash()`)
- [ ] 에러 메시지 및 스택 트레이스 분석
- [ ] 어느 탭/화면에서 발생했는지 확인
- [ ] 재현 가능한지 테스트

### 원인 파악
- [ ] 해당 파일 및 라인 확인
- [ ] 관련 Context/Hook 확인
- [ ] AppState 전환과 관련있는지 확인
- [ ] 메모리 릭 가능성 확인

### 수정 및 검증
- [ ] 코드 수정
- [ ] 로컬 테스트
- [ ] 크래시 로그 삭제 (`clearCrashLogs()`)
- [ ] 재테스트 (크래시 재발 확인)
- [ ] 빌드 및 배포

---

## 📞 문의 및 지원

### 크래시 로그 관련 질문
- GitHub Issues: https://github.com/therearenorules/tarot-timer-web/issues
- 이메일: changsekwon@gmail.com

### 관련 문서
- [FIX-ERRORBOUNDARY-INFINITE-LOOP.md](./FIX-ERRORBOUNDARY-INFINITE-LOOP.md)
- [PROJECT_STATUS.md](../.claude/PROJECT_STATUS.md)
- [QUICK_REFERENCE.md](../.claude/QUICK_REFERENCE.md)

---

**작성자**: Claude Code Assistant
**최종 업데이트**: 2025-10-24
**상태**: ✅ 완성
