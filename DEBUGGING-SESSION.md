# 🔍 TestFlight 크래시 디버깅 세션 기록

**작성일**: 2025-10-23
**문제**: TestFlight에서 앱 실행 즉시 크래시 발생
**환경**: 윈도우 개발 환경 → Mac 디버깅 환경으로 이동

---

## 📋 **문제 상황**

### **증상**
- TestFlight에서 앱을 열자마자 **크래시 (앱 강제 종료)**
- ErrorBoundary는 작동하지만 상세 오류 메시지 표시 안 됨
- Expo Go에서는 정상 작동 (로컬 환경변수 존재)
- 실제 앱스토어 배포 시에도 동일한 크래시 발생 예상

### **영향 범위**
- 🔴 **CRITICAL**: 모든 TestFlight 사용자에게 영향
- 🔴 **BLOCKER**: 앱스토어 출시 불가능
- 광고, 구독, 프리미엄 기능 관련 크래시 의심

---

## 🔍 **질문과 답변 요약**

### **Q1: 지금까지 한 작업과 오류 수정 내역 체크 요청**

**답변**:
- 최근 10개 커밋 분석
- Build 50-55: Supabase, AuthContext, ErrorBoundary 관련 수정
- Context 시스템 정상 확인
- 앱 구조 검증 완료

### **Q2: TestFlight에서 또다시 오류 발생, 매우 심각하게 픽스 필요**

**분석**:
- Supabase 환경변수 누락 시 `supabase = null` 반환
- AuthContext에서 null 참조로 크래시 발생
- 프로덕션 빌드 특유의 문제 (환경변수 누락)

**조치 (Build 56)**:
1. lib/supabase.ts - Fallback URL/Key 추가, null 방지
2. AuthContext - isSupabaseAvailable() 체크 강화
3. app.json - Supabase 환경변수 추가
4. 인증 함수 추가 및 안전성 검증

### **Q3: 광고, 구독, 프리미엄 온오프 등 오류 발생 지점 찾기**

**분석**:
- Context 초기화 순서 확인
- PremiumContext, AdManager, IAPManager 전수 조사
- LocalStorageManager, ReceiptValidator 파일 존재 확인

**발견된 문제**:
1. **localStorage.ts:416** - 타입 불일치 (`premium_themes` → `premium_spreads`)
2. **PremiumContext:113-163** - 초기화 오류 시 방어 코드 없음
3. **IAPManager** - 이미 방어 코드 존재 확인

**조치 (Build 57)**:
1. localStorage.ts 타입 불일치 수정
2. PremiumContext 3단계 방어 로직 추가
3. 모든 초기화 실패 시에도 앱 실행 보장

### **Q4: 이게 "오류"야 "크래시"야? 방어 코드 vs 근본 원인 수정**

**답변**:
- **정확한 명칭**: "크래시 (Crash)" 또는 "앱 충돌"
- **이유**: 앱이 강제 종료되어 사용자가 아무것도 할 수 없음

**근본적 접근의 중요성**:
- ❌ 방어 코드는 증상만 숨김 (땜질)
- ✅ **근본 원인을 찾아서 수정해야 함**
- 방어 코드는 예측 가능한 외부 요인에만 사용

**올바른 순서**:
1. ✅ 정확한 크래시 지점 파악 (Xcode Console 필수)
2. ✅ 근본 원인 분석
3. ✅ 근본 원인 제거
4. ❌ 방어 코드는 마지막 수단

**실수 인정**:
- Build 56-57에서 방어 코드로 증상만 숨김
- 근본 원인 찾지 않고 추측으로 수정
- 정확한 크래시 로그 확인 필요

### **Q5: 윈도우 환경에서 iOS 크래시 로그 확인 방법**

**답변**:
- Xcode Console은 **Mac에서만 사용 가능**

**윈도우에서 가능한 방법**:
1. **App Store Connect 크래시 로그** (1-2시간 후 확인)
2. **개발 빌드 + React Native Debugger**
3. **Sentry 같은 크래시 리포팅 서비스** (권장)
4. **상세 디버그 로그 추가 + 새 빌드**

**권장 방법**: Mac으로 이동 → Xcode Console 사용

---

## 🔧 **수행한 작업 내역**

### **Build 56 - Supabase 크래시 수정**

#### 수정 파일
1. **lib/supabase.ts**
   - 환경변수 누락 시 Fallback URL/Key 추가
   - `supabase: SupabaseClient` 항상 생성 (null 방지)
   - `isSupabaseAvailable()` 함수로 실제 사용 가능 여부 체크
   - 모든 helper 함수에 `isSupabaseAvailable()` 체크 추가
   - 인증 함수 추가: signInWithEmail, signUpWithEmail, signOut, resetPassword, updateProfile

2. **contexts/AuthContext.tsx**
   - import 경로 수정: `../utils/supabase` → `../lib/supabase`
   - `isSupabaseAvailable()` import 추가
   - 초기화 시 Supabase 사용 불가능하면 오프라인 모드로 실행

3. **app.json**
   - Supabase 환경변수 추가:
     ```json
     "supabaseUrl": "${SUPABASE_URL}",
     "supabaseAnonKey": "${SUPABASE_ANON_KEY}"
     ```
   - iOS buildNumber: 55 → 56
   - Android versionCode: 54 → 56

4. **HOTFIX-BUILD-56.md** (문서 작성)

#### 커밋
```
fix: CRITICAL - Supabase 환경변수 누락 시 크래시 방지 (Build 56)
```

---

### **Build 57 - PremiumContext 크래시 수정**

#### 발견된 문제
1. **utils/localStorage.ts:416** - 타입 불일치
   ```typescript
   // ❌ 잘못된 코드
   premium_themes: false

   // ✅ 수정
   premium_spreads: false
   ```

2. **contexts/PremiumContext.tsx:113-163** - 방어 코드 없음

#### 수정 파일
1. **utils/localStorage.ts:416**
   - `premium_themes` → `premium_spreads` 수정

2. **contexts/PremiumContext.tsx:113-163**
   - 3단계 방어 로직 추가:
     ```typescript
     // 1단계: LocalStorageManager try-catch
     let trialStatus = defaultPremiumStatus;
     try {
       trialStatus = await LocalStorageManager.checkTrialStatus();
     } catch (error) {
       console.error('❌ LocalStorageManager 오류:', error);
     }

     // 2단계: IAPManager try-catch
     let iapStatus = defaultPremiumStatus;
     try {
       await IAPManager.initialize();
       iapStatus = await IAPManager.getCurrentSubscriptionStatus();
     } catch (error) {
       console.error('❌ IAPManager 오류:', error);
     }

     // 3단계: 최종 catch에서 defaultPremiumStatus 설정
     catch (error) {
       console.error('❌ PremiumContext 초기화 오류:', error);
       setPremiumStatus(defaultPremiumStatus);
     }
     ```

3. **app.json**
   - iOS buildNumber: 56 → 57
   - Android versionCode: 56 → 57

4. **CRASH-ANALYSIS.md** (상세 분석 문서 작성)

#### 커밋
```
fix: CRITICAL - PremiumContext 크래시 방어 및 타입 불일치 수정 (Build 57)
```

---

## 📊 **수정 완료 상태**

### **해결된 크래시 시나리오**

| 시나리오 | Build 55 이전 | Build 56 | Build 57 |
|---------|--------------|----------|----------|
| Supabase 환경변수 누락 | ❌ 크래시 | ✅ 오프라인 모드 | ✅ 오프라인 모드 |
| AuthContext null 참조 | ❌ 크래시 | ✅ 초기화 건너뛰기 | ✅ 초기화 건너뛰기 |
| LocalStorageManager 오류 | ❌ 크래시 | ❌ 크래시 | ✅ 기본값으로 계속 |
| IAPManager 초기화 실패 | ❌ 크래시 | ❌ 크래시 | ✅ IAP 없이 계속 |
| premium_themes 타입 불일치 | ❌ 크래시 | ❌ 크래시 | ✅ 수정됨 |

---

## 🚨 **중요: 근본 원인은 아직 미확인**

### **현재 상태**
- ✅ 방어 코드로 증상 완화 (Build 56-57)
- ❌ **정확한 크래시 지점은 아직 모름**
- ❌ **근본 원인은 추측만 함**

### **다음 필수 작업 (Mac 환경)**

#### **1. Xcode Console로 정확한 크래시 로그 확인**
```
1. Mac에서 Xcode 실행
2. Window → Devices and Simulators
3. 왼쪽에서 iPhone 선택
4. 하단 "Open Console" 클릭
5. TestFlight 앱 실행
6. 크래시 발생 시 로그 전체 복사
```

**확인할 내용**:
- `[ERROR] ...`
- `Fatal Exception: ...`
- `*** Terminating app due to uncaught exception ...`
- 정확한 파일명과 라인 번호

#### **2. 크래시 로그 분석 후 근본 원인 수정**

**예시**:
```
// 로그: "Cannot read property 'checkTrialStatus' of undefined"
// → LocalStorageManager가 undefined

// 근본 원인:
// - import 경로 오류?
// - LocalStorageManager 파일 누락?
// - export 문제?

// 수정:
// import 경로 확인 및 수정
```

#### **3. 근본 원인 수정 후 방어 코드 제거 고려**

방어 코드는 필요한 부분만 남기고 나머지는 제거

---

## 📋 **생성된 문서**

1. **HOTFIX-BUILD-56.md** - Build 56 수정 내역
2. **CRASH-ANALYSIS.md** - 크래시 원인 상세 분석
3. **check-error.md** - Xcode Console 확인 가이드
4. **DEBUGGING-SESSION.md** (현재 문서) - 전체 디버깅 세션 기록

---

## 🎯 **Mac 환경에서 할 일**

### **즉시 실행**
1. ✅ Git pull (최신 코드 받기)
2. ✅ TestFlight 앱 실행
3. ✅ Xcode Console 로그 확인
4. ✅ 정확한 크래시 지점 파악

### **크래시 로그 확인 후**
1. ✅ 근본 원인 분석
2. ✅ 근본 원인 수정
3. ✅ 방어 코드 제거 (필요시)
4. ✅ Build 58 배포

### **장기적 개선**
1. ✅ Sentry 같은 크래시 리포팅 서비스 추가
2. ✅ 자동화된 크래시 모니터링
3. ✅ 프로덕션 환경에서도 상세 로그

---

## 🔗 **관련 커밋**

```bash
# Build 56
0081c3f fix: CRITICAL - Supabase 환경변수 누락 시 크래시 방지 (Build 56)

# Build 57
1b9773a fix: CRITICAL - PremiumContext 크래시 방어 및 타입 불일치 수정 (Build 57)
```

---

## 📝 **메모**

### **개발 환경**
- **윈도우**: 코드 작성, 커밋
- **Mac**: iOS 디버깅, Xcode Console 확인 필수

### **다음 세션에서 확인할 것**
1. Xcode Console 로그 내용
2. 정확한 크래시 파일명과 라인 번호
3. 근본 원인 (추측 아닌 확실한 증거)

### **교훈**
- ❌ 방어 코드로 증상만 숨기지 말 것
- ✅ 정확한 로그로 근본 원인 찾기
- ✅ 추측이 아닌 증거 기반 수정

---

**작성자**: Claude Code
**다음 작업자**: Mac 환경에서 Xcode Console 로그 확인 후 근본 원인 수정
