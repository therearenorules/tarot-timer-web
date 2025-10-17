# 무료 체험 및 저장 제한 구현 계획

**작성일**: 2025-10-16
**요청 사항**: 사용자 요구사항 기반 프리미엄 정책 재설계

---

## 📋 사용자 요구사항

### 1️⃣ **7일 무료 체험 정책**
```
앱 다운로드 즉시 → 7일 무료 체험 시작
7일 후 → 무료 버전으로 자동 전환 (광고 표시)
```

### 2️⃣ **무료 버전 저장 제한**
```
데일리 타로: 최대 30개까지 저장
스프레드: 최대 15개까지 저장
초과 시: 기존 데이터 삭제 또는 구독 필요
```

### 3️⃣ **프리미엄 테마**
```
현재: 준비 중 상태 유지
향후: 추가 예정
```

### 4️⃣ **Priority Support 제거**
```
삭제 요청
```

---

## 🔍 현재 구현 상태 분석

### ✅ **이미 구현된 기능**

#### 1. 저장 제한 시스템 (부분 구현)

**파일**: `utils/localStorage.ts` (116-119줄)

```typescript
private static readonly FREE_LIMITS = {
  max_sessions: 10,        // 현재: 10개
  max_journal_entries: 20  // 현재: 20개
};
```

**UsageLimits 인터페이스** (104-110줄):
```typescript
export interface UsageLimits {
  max_sessions: number;           // 최대 세션 수
  max_journal_entries: number;    // 최대 저널 수
  current_sessions: number;       // 현재 세션 수
  current_journal_entries: number; // 현재 저널 수
  reset_date: string;             // 리셋 날짜
}
```

**저장 제한 체크 함수** (357-367줄):
```typescript
static async canCreateNew(type: 'sessions' | 'journals'): Promise<{
  canCreate: boolean;
  isAtLimit: boolean;
}> {
  const limits = await this.getUsageLimits();

  if (type === 'sessions') {
    return {
      canCreate: limits.current_sessions < limits.max_sessions,
      isAtLimit: limits.current_sessions >= limits.max_sessions
    };
  } else {
    return {
      canCreate: limits.current_journal_entries < limits.max_journal_entries,
      isAtLimit: limits.current_journal_entries >= limits.max_journal_entries
    };
  }
}
```

**구현 상태**:
- ✅ 데이터 구조 정의됨
- ✅ 저장 제한 체크 함수 구현됨
- ⚠️ 제한 값이 요구사항과 다름 (10개/20개 → 30개/15개로 변경 필요)
- ⚠️ 데일리 타로와 스프레드를 구분하지 않음 (현재는 모든 세션을 하나로 관리)

---

### ❌ **미구현된 기능**

#### 1. 7일 무료 체험 시스템
- ❌ 앱 설치 시점 추적 미구현
- ❌ 무료 체험 상태 관리 미구현
- ❌ 7일 후 자동 전환 로직 미구현

#### 2. 세션 타입 구분 저장 제한
- ❌ 데일리 타로 / 스프레드 구분 저장 미구현
- ❌ 각 타입별 제한 적용 미구현

---

## 💡 7일 무료 체험 구현 방안

### 🎯 **권장 방안: 앱 자체 구현 (추천)**

#### **이유**:
1. ✅ **즉시 적용 가능** - 스토어 승인 없이 바로 구현
2. ✅ **완전한 제어** - 정책 변경 시 앱 업데이트만으로 대응
3. ✅ **크로스 플랫폼** - iOS/Android 동일한 로직 적용
4. ✅ **유연성** - 체험 기간 동적 조정 가능 (7일 → 14일 등)
5. ✅ **비용 절감** - 스토어 구독 시스템 사용 시 수수료 불필요

#### **구현 방법**:

**1단계: 앱 최초 설치 감지**
```typescript
// utils/localStorage.ts
export interface AppInstallInfo {
  first_launch_date: string;      // 최초 설치 날짜
  is_trial_active: boolean;       // 무료 체험 활성화 여부
  trial_end_date: string;         // 무료 체험 종료 날짜
  trial_used: boolean;            // 무료 체험 사용 여부
}
```

**2단계: 앱 시작 시 체험 상태 확인**
```typescript
// PremiumContext.tsx 초기화 시
const checkTrialStatus = async () => {
  const installInfo = await LocalStorageManager.getAppInstallInfo();

  // 최초 설치 시
  if (!installInfo) {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7일 후

    await LocalStorageManager.setAppInstallInfo({
      first_launch_date: new Date().toISOString(),
      is_trial_active: true,
      trial_end_date: trialEndDate.toISOString(),
      trial_used: true
    });

    // 무료 체험 프리미엄 상태 적용
    return {
      is_premium: true,
      ad_free: true,
      unlimited_storage: true,
      premium_themes: false,
      subscription_type: 'trial'
    };
  }

  // 무료 체험 기간 확인
  const now = new Date();
  const trialEnd = new Date(installInfo.trial_end_date);

  if (installInfo.is_trial_active && now < trialEnd) {
    // 무료 체험 중
    return {
      is_premium: true,
      ad_free: true,
      unlimited_storage: true,
      premium_themes: false,
      subscription_type: 'trial'
    };
  } else {
    // 무료 체험 종료 → 무료 버전
    return {
      is_premium: false,
      ad_free: false,
      unlimited_storage: false,
      premium_themes: false
    };
  }
};
```

**3단계: 무료 체험 종료 알림**
```typescript
// 무료 체험 종료 3일 전 알림
if (daysUntilTrialEnd === 3) {
  showNotification({
    title: '무료 체험 종료 예정',
    message: '3일 후 무료 체험이 종료됩니다. 프리미엄을 계속 이용하시려면 구독해 주세요.',
    action: '구독하기'
  });
}

// 무료 체험 종료 시 알림
if (trialJustEnded) {
  showNotification({
    title: '무료 체험이 종료되었습니다',
    message: '광고 없는 프리미엄 경험을 계속하시려면 구독해 주세요.',
    action: '구독하기'
  });
}
```

---

### 🏪 **대안: 스토어 구독 시스템 활용 (비추천)**

#### **이유**:
1. ❌ **복잡한 설정** - Google Play Console / App Store Connect 각각 설정
2. ❌ **승인 필요** - 정책 변경 시 스토어 재승인 필요 (1-3일)
3. ❌ **수수료** - 스토어 수수료 30% (무료 체험에도 적용)
4. ❌ **제한적** - 체험 기간 변경 시 스토어 재설정 필요
5. ❌ **테스트 어려움** - 실제 결제 시스템 테스트 필요

#### **구현 방법** (참고용):

**Google Play Console**:
```
구독 상품 → 무료 체험 설정
- 월간 구독: 7일 무료 체험
- 연간 구독: 14일 무료 체험
```

**App Store Connect**:
```
구독 그룹 → 무료 체험 설정
- Introductory Offer: 7일 무료
```

**단점**:
- 사용자가 구독 취소를 잊으면 자동 결제됨 (사용자 불만)
- 스토어 정책 변경 시 대응 어려움
- 크로스 플랫폼 일관성 유지 어려움

---

## ✅ **최종 권장사항: 앱 자체 구현**

### **구현 우선순위**

#### **Phase 1: 7일 무료 체험 (즉시 구현)**
1. ✅ `AppInstallInfo` 데이터 구조 추가
2. ✅ 앱 최초 설치 감지 로직
3. ✅ 무료 체험 상태 관리 (PremiumContext)
4. ✅ 7일 후 자동 전환 로직
5. ✅ 무료 체험 종료 알림

#### **Phase 2: 저장 제한 수정 (즉시 구현)**
1. ✅ FREE_LIMITS 값 변경 (10→30, 20→15)
2. ✅ 데일리 타로 / 스프레드 타입 구분 저장
3. ✅ 각 타입별 제한 적용
4. ✅ 제한 초과 시 UI 알림

#### **Phase 3: Priority Support 제거 (즉시 구현)**
1. ✅ PremiumFeature 타입에서 제거
2. ✅ 관련 문서 업데이트

---

## 📊 저장 제한 구현 상세

### **현재 구조 문제점**

**TarotSession 인터페이스** (53-74줄):
```typescript
export interface TarotSession {
  id: string;
  session_type: 'daily' | 'spread' | 'custom'; // ← 타입 정의는 되어있음
  spread_type?: string;
  cards_drawn: Array<{...}>;
  // ...
}
```

**문제**:
- ✅ `session_type` 필드는 이미 존재
- ❌ 저장 제한 체크 시 타입을 구분하지 않음

### **수정 방안**

#### 1. **FREE_LIMITS 수정**

**변경 전**:
```typescript
private static readonly FREE_LIMITS = {
  max_sessions: 10,        // 모든 세션 통합 10개
  max_journal_entries: 20
};
```

**변경 후**:
```typescript
private static readonly FREE_LIMITS = {
  max_daily_sessions: 30,     // 데일리 타로 30개
  max_spread_sessions: 15,    // 스프레드 15개
  max_journal_entries: 20     // 저널은 유지 (향후 조정 가능)
};
```

#### 2. **UsageLimits 인터페이스 수정**

**변경 전**:
```typescript
export interface UsageLimits {
  max_sessions: number;
  max_journal_entries: number;
  current_sessions: number;
  current_journal_entries: number;
  reset_date: string;
}
```

**변경 후**:
```typescript
export interface UsageLimits {
  max_daily_sessions: number;        // 데일리 타로 최대
  max_spread_sessions: number;       // 스프레드 최대
  max_journal_entries: number;       // 저널 최대
  current_daily_sessions: number;    // 데일리 현재
  current_spread_sessions: number;   // 스프레드 현재
  current_journal_entries: number;   // 저널 현재
  reset_date: string;
}
```

#### 3. **저장 제한 체크 함수 수정**

**변경 전**:
```typescript
static async canCreateNew(type: 'sessions' | 'journals'): Promise<{
  canCreate: boolean;
  isAtLimit: boolean;
}> {
  // ...
}
```

**변경 후**:
```typescript
static async canCreateNew(type: 'daily' | 'spread' | 'journals'): Promise<{
  canCreate: boolean;
  isAtLimit: boolean;
  currentCount: number;
  maxCount: number;
}> {
  const limits = await this.getUsageLimits();

  if (type === 'daily') {
    return {
      canCreate: limits.current_daily_sessions < limits.max_daily_sessions,
      isAtLimit: limits.current_daily_sessions >= limits.max_daily_sessions,
      currentCount: limits.current_daily_sessions,
      maxCount: limits.max_daily_sessions
    };
  } else if (type === 'spread') {
    return {
      canCreate: limits.current_spread_sessions < limits.max_spread_sessions,
      isAtLimit: limits.current_spread_sessions >= limits.max_spread_sessions,
      currentCount: limits.current_spread_sessions,
      maxCount: limits.max_spread_sessions
    };
  } else {
    return {
      canCreate: limits.current_journal_entries < limits.max_journal_entries,
      isAtLimit: limits.current_journal_entries >= limits.max_journal_entries,
      currentCount: limits.current_journal_entries,
      maxCount: limits.max_journal_entries
    };
  }
}
```

#### 4. **저장 시 제한 체크**

```typescript
static async addTarotSession(session: Omit<TarotSession, 'id' | 'created_at' | 'updated_at'>): Promise<TarotSession | null> {
  // 프리미엄 상태 확인
  const premiumStatus = await this.getPremiumStatus();

  // 프리미엄이 아닌 경우 저장 제한 체크
  if (!premiumStatus.is_premium || !premiumStatus.unlimited_storage) {
    const sessionType = session.session_type === 'daily' ? 'daily' : 'spread';
    const limitCheck = await this.canCreateNew(sessionType);

    if (limitCheck.isAtLimit) {
      // 제한 초과 시 null 반환
      console.warn(`저장 제한 초과: ${sessionType} (${limitCheck.currentCount}/${limitCheck.maxCount})`);
      return null;
    }
  }

  // 저장 진행
  const sessions = await this.getTarotSessions();
  const newSession: TarotSession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  sessions.push(newSession);
  await this.setItem(STORAGE_KEYS.TAROT_SESSIONS, sessions);

  // 사용량 업데이트
  await this.updateUsageLimits(session.session_type === 'daily' ? 'daily' : 'spread');

  return newSession;
}
```

#### 5. **UI 알림 메시지**

```typescript
// 저장 제한 초과 시 UI 알림
if (!savedSession) {
  const sessionType = session.session_type === 'daily' ? '데일리 타로' : '스프레드';
  const maxCount = session.session_type === 'daily' ? 30 : 15;

  showAlert({
    title: '저장 제한 도달',
    message: `무료 버전은 ${sessionType} 세션을 최대 ${maxCount}개까지 저장할 수 있습니다.\n\n기존 데이터를 삭제하거나 프리미엄으로 업그레이드하여 무제한 저장을 이용하세요.`,
    buttons: [
      { text: '기존 데이터 삭제', onPress: () => navigateToSessionList() },
      { text: '프리미엄 구독', onPress: () => navigateToSubscription() },
      { text: '취소', style: 'cancel' }
    ]
  });
}
```

---

## 🎯 Priority Support 제거

### **수정 파일**

#### 1. **PremiumContext.tsx**

**변경 전**:
```typescript
export type PremiumFeature =
  | 'unlimited_storage'
  | 'ad_free'
  | 'premium_themes'
  | 'priority_support';  // ← 제거
```

**변경 후**:
```typescript
export type PremiumFeature =
  | 'unlimited_storage'
  | 'ad_free'
  | 'premium_themes';
```

#### 2. **모든 문서 업데이트**
- PREMIUM_BENEFITS_SUMMARY.md
- ANDROID_BUILD_READY_REPORT.md
- GOOGLE_PLAY_SUBSCRIPTION_SETUP.md
- PREMIUM_SUBSCRIPTION_SYSTEM_REPORT.md

---

## ✅ 최종 구현 계획

### **즉시 구현 항목**

1. ✅ **7일 무료 체험 시스템**
   - AppInstallInfo 데이터 구조 추가
   - 앱 최초 설치 감지
   - 무료 체험 상태 관리
   - 7일 후 자동 전환

2. ✅ **저장 제한 수정**
   - FREE_LIMITS 값 변경 (데일리 30개, 스프레드 15개)
   - 세션 타입 구분 저장 로직
   - 제한 초과 시 UI 알림

3. ✅ **Priority Support 제거**
   - PremiumFeature 타입에서 제거
   - 모든 문서 업데이트

### **예상 작업 시간**
- 7일 무료 체험: 2-3시간
- 저장 제한 수정: 1-2시간
- Priority Support 제거: 30분
- 테스트: 1-2시간
- **총 예상 시간**: 4-7시간

---

## 📋 테스트 계획

### **7일 무료 체험 테스트**
1. ✅ 앱 최초 설치 시 무료 체험 시작 확인
2. ✅ 무료 체험 중 광고 숨김 확인
3. ✅ 무료 체험 중 무제한 저장 확인
4. ✅ 7일 후 무료 버전 전환 확인
5. ✅ 무료 체험 종료 알림 확인

### **저장 제한 테스트**
1. ✅ 데일리 타로 30개 저장 제한 확인
2. ✅ 스프레드 15개 저장 제한 확인
3. ✅ 제한 초과 시 UI 알림 확인
4. ✅ 프리미엄 구독 시 무제한 저장 확인
5. ✅ 기존 데이터 삭제 후 저장 확인

---

## 🎉 결론

### **권장 구현 방안**
✅ **7일 무료 체험: 앱 자체 구현 (추천)**
✅ **저장 제한: 데일리 30개, 스프레드 15개로 수정**
✅ **Priority Support: 제거**

### **구현 우선순위**
1. Priority Support 제거 (30분)
2. 저장 제한 수정 (1-2시간)
3. 7일 무료 체험 구현 (2-3시간)

---

**작성일**: 2025-10-16
**담당자**: Claude (AI Assistant)
**상태**: ✅ 분석 완료 / 🚀 구현 대기
