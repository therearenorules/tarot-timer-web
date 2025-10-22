# Build 39 치명적 버그 분석 보고서

**분석 일시**: 2025-10-22
**버그 보고**: TestFlight Build 39
**심각도**: 🔴 CRITICAL (서비스 중단)

---

## 📊 요약

| 버그 ID | 문제 | 심각도 | 영향 범위 | 상태 |
|---------|------|--------|-----------|------|
| **BUG-001** | 데일리 타로 저장 실패 | 🔴 CRITICAL | 핵심 기능 | 분석 완료 |
| **BUG-002** | 타이머 탭 로딩 크래시 | 🔴 CRITICAL | 앱 안정성 | 분석 완료 |

---

## 🐛 BUG-001: 데일리 타로 저장 실패

### 증상
- 24시간 타로 카드 뽑은 후 "저장하기" 버튼 클릭
- 데일리 타로 저널에 저장되지 않음
- 사용자가 저장한 내용이 사라짐

### 근본 원인: 이중 저장소 시스템 불일치

#### 문제 구조
앱에 **2개의 독립적인 저장소 시스템**이 존재:

```
1. TarotUtils (tarotData.ts)
   - 저장 키: STORAGE_KEYS.DAILY_TAROT = 'daily_tarot_'
   - 저장 방식: AsyncStorage에 날짜별 키로 저장
   - 예시: 'daily_tarot_2025-10-22'

2. LocalStorageManager (localStorage.ts)
   - 저장 키: STORAGE_KEYS.TAROT_SESSIONS = 'tarot_sessions'
   - 저장 방식: TarotSession[] 배열로 저장
   - 제한 확인: TarotSession 배열 카운트
```

#### 문제 코드 흐름

**Step 1: TimerTab에서 저장 시도**
```typescript
// components/tabs/TimerTab.tsx:562
await TarotUtils.saveDailyTarot(dailyTarotSave);
```

**Step 2: TarotUtils.saveDailyTarot 실행**
```typescript
// utils/tarotData.ts:1519-1536
saveDailyTarot: async (dailyTarot: DailyTarotSave): Promise<void> => {
  // ❌ 문제 1: 잘못된 저장소에서 제한 확인
  const limitCheck = await LocalStorageManager.checkUsageLimit('daily');

  if (limitCheck.isAtLimit) {
    // ❌ 저장 실패!
    const error = new Error('STORAGE_LIMIT_REACHED');
    (error as any).limitInfo = limitCheck;
    throw error;
  }

  // ✅ 실제 저장은 별도 키로 (문제 없음)
  const storageKey = STORAGE_KEYS.DAILY_TAROT + dailyTarot.date;
  await simpleStorage.setItem(storageKey, JSON.stringify(dailyTarot));
}
```

**Step 3: LocalStorageManager.checkUsageLimit 실행**
```typescript
// utils/localStorage.ts:456-492
static async checkUsageLimit(type: 'daily'): Promise<...> {
  const premiumStatus = await this.getPremiumStatus();

  // ✅ 프리미엄 사용자는 무제한
  if (premiumStatus.is_premium && premiumStatus.unlimited_storage) {
    return { canCreate: true, isAtLimit: false, currentCount: 0, maxCount: 999999 };
  }

  const limits = await this.getUsageLimits();

  // ❌ 문제 2: TarotSession 배열을 카운트
  // DailyTarotSave는 TarotSession이 아님!
  return {
    canCreate: limits.current_daily_sessions < limits.max_daily_sessions,
    isAtLimit: limits.current_daily_sessions >= limits.max_daily_sessions,
    currentCount: limits.current_daily_sessions,  // ← 잘못된 카운트
    maxCount: limits.max_daily_sessions  // 15
  };
}
```

**Step 4: updateUsageCount (카운트 불일치)**
```typescript
// utils/localStorage.ts:441-454
static async updateUsageCount(type: 'daily'): Promise<void> {
  const limits = await this.getUsageLimits();
  const sessions = await this.getTarotSessions();  // ← TAROT_SESSIONS 배열

  if (type === 'daily') {
    // ❌ 문제 3: TarotSession 배열에서 'daily' 타입만 필터링
    // 하지만 DailyTarotSave는 TarotSession에 없음!
    limits.current_daily_sessions = sessions.filter(
      s => s.session_type === 'daily'
    ).length;  // ← 항상 0
  }

  await this.setItem(STORAGE_KEYS.USAGE_LIMITS, limits);
}
```

### 데이터 불일치 예시

**사용자가 저장한 DailyTarot**:
```
AsyncStorage:
  'daily_tarot_2025-10-20' → {id: '...', date: '2025-10-20', hourlyCards: [...]}
  'daily_tarot_2025-10-21' → {id: '...', date: '2025-10-21', hourlyCards: [...]}
  'daily_tarot_2025-10-22' → {id: '...', date: '2025-10-22', hourlyCards: [...]}

실제 저장 개수: 3개
```

**LocalStorageManager가 인식하는 카운트**:
```
AsyncStorage:
  'tarot_sessions' → []  // ← 비어있음!

LocalStorageManager.checkUsageLimit('daily'):
  currentCount: 0  // ← 잘못됨!
  maxCount: 15
```

### 왜 저장이 실패했는가?

**가설 1: 프리미엄 상태 오류**
```typescript
// 무료 체험이 종료되었는데 프리미엄 상태가 false로 전환
// → checkUsageLimit에서 제한 확인 시작
// → 하지만 카운트가 0이므로 저장 가능해야 함
// ❌ 이 가설은 맞지 않음
```

**가설 2: 카운트 업데이트 로직 누락** ✅ **가능성 높음**
```typescript
// TarotUtils.saveDailyTarot 함수에서:
// 1. checkUsageLimit 호출 (카운트 확인)
// 2. simpleStorage.setItem 저장
// 3. ❌ updateUsageCount 호출 누락!

// 결과: 저장은 되지만 카운트가 증가하지 않음
// → 다음 저장 시도 시 카운트가 여전히 0
// → 문제는 다른 곳에 있을 가능성
```

**가설 3: AsyncStorage 쓰기 실패** ✅ **가능성 높음**
```typescript
// iOS에서 AsyncStorage 쓰기 제한 초과
// 또는 저장 권한 문제
// → simpleStorage.setItem이 실패하지만 에러가 catch되지 않음
```

**가설 4: 날짜 키 생성 오류** ✅ **가능성 있음**
```typescript
// TarotUtils.getTodayDateString() 함수가 잘못된 날짜 반환
// → 저장 키가 잘못 생성되어 저장 실패
// → 또는 타임존 문제로 날짜 불일치
```

### 영향 범위
- ✅ **핵심 기능 중단**: 데일리 타로 저장 불가능
- ✅ **사용자 데이터 손실**: 뽑은 카드와 메모가 사라짐
- ✅ **저널 탭 빈 화면**: 저장된 데이터가 없어 보임
- ⚠️ **무료 체험 사용자**: 프리미엄 상태가 정상이면 영향 없음
- ⚠️ **유료 사용자**: unlimited_storage = true이면 영향 없음

---

## 🐛 BUG-002: 타이머 탭 로딩 크래시

### 증상
- 앱을 조금 켜두고 있으면 "!오류 발생" 메시지
- "Tarot Timer 탭을 로드하는 중 문제가 발생했습니다."
- "다시시도" 버튼 눌러도 해결 안 됨
- 앱 재시작 필요

### 근본 원인 (추정)

#### 원인 1: 광고 로딩 실패로 인한 컴포넌트 크래시 ✅ **가능성 높음**

**Build 39 변경사항**:
```typescript
// components/tabs/TimerTab.tsx:744-749
{/* 하단 배너 광고 */}
<BannerAd
  placement="main_screen"
  onAdLoaded={() => console.log('✅ TimerTab 배너 광고 로드됨')}
  onAdFailedToLoad={(error) => console.log('❌ TimerTab 배너 광고 실패:', error)}
/>
```

**문제 시나리오**:
1. BannerAd 컴포넌트 렌더링 시도
2. AdMob SDK에서 광고 로딩 실패 (네트워크 오류, 광고 재고 부족)
3. BannerAd에서 처리되지 않은 에러 발생
4. **에러 경계(Error Boundary) 없음** → 전체 TimerTab 크래시
5. React Native가 에러 화면 표시

**BannerAd 에러 처리 분석**:
```typescript
// components/ads/BannerAd.tsx:158
const handleAdFailedToLoad = (loadError) => {
  console.log('❌ 배너 광고 로드 실패:', loadError);
  if (onAdFailedToLoad) {
    onAdFailedToLoad(loadError);  // ← 콜백만 호출, 에러 catch 안 함
  }
};
```

#### 원인 2: 메모리 누수로 인한 앱 불안정 ✅ **가능성 있음**

**의심 코드**:
```typescript
// components/tabs/TimerTab.tsx에서:
// - 24개 카드 이미지 로딩
// - 카드 애니메이션 효과
// - 메모 입력 상태 관리
// - 광고 컴포넌트 추가

// 메모리 누수 가능성:
// 1. 이미지 캐시 미해제
// 2. 이벤트 리스너 cleanup 누락
// 3. 광고 컴포넌트 unmount 시 메모리 미해제
```

#### 원인 3: 타임존 검증 로직 오류 ⚠️ **가능성 낮음**

**Build 39에 추가된 코드**:
```typescript
// utils/timezoneValidation.ts (새 파일)
// 타임존 검증 로직이 추가되었는데, 이것이 TimerTab에서 호출되면서
// 무한 루프나 크래시를 유발할 수 있음
```

### 영향 범위
- 🔴 **앱 사용 불가능**: 타이머 탭 진입 불가
- 🔴 **사용자 경험 최악**: 앱 재시작 필요
- ⚠️ **다른 탭**: Journal, Spread, Settings 탭은 정상 작동 가능

---

## 🔍 디버깅을 위한 추가 정보 필요

### BUG-001 (저장 실패) 디버깅
1. **프리미엄 상태 확인**
   - 현재 무료 체험 중인가? 종료되었는가?
   - `is_premium`, `unlimited_storage` 값은?

2. **AsyncStorage 쓰기 로그**
   - `simpleStorage.setItem` 성공/실패 로그
   - 저장 시도한 키 값 확인

3. **저장 제한 카운트 확인**
   - `LocalStorageManager.getUsageLimits()` 결과
   - `current_daily_sessions` 값

### BUG-002 (타이머 탭 크래시) 디버깅
1. **에러 메시지 전체 텍스트**
   - React Native 에러 화면에 표시된 스택 트레이스

2. **광고 로딩 로그**
   - "❌ TimerTab 배너 광고 실패" 로그 확인
   - AdMob 에러 코드

3. **메모리 사용량**
   - 크래시 직전 메모리 사용량
   - iOS 메모리 경고 발생 여부

---

## 🚀 긴급 수정 계획

### 우선순위 1: BUG-001 수정 (데일리 타로 저장)

**방안 A: 저장소 시스템 통합** (근본적 해결, 20분)
- DailyTarotSave를 TarotSession으로 변환
- 단일 저장소로 통합
- ⚠️ 리스크: 기존 저장된 데이터 마이그레이션 필요

**방안 B: 카운트 로직 수정** (안전한 해결, 15분) ✅ **권장**
- `checkUsageLimit`에서 실제 DailyTarot 개수 카운트
- `updateUsageCount` 수정
- ✅ 리스크: 낮음, 기존 데이터 영향 없음

**방안 C: 제한 확인 제거** (임시 해결, 5분) ⚠️ **비권장**
- `saveDailyTarot`에서 `checkUsageLimit` 호출 제거
- ⚠️ 리스크: 무료 사용자 저장 제한 무력화

### 우선순위 2: BUG-002 수정 (타이머 탭 크래시)

**방안 A: Error Boundary 추가** (안전한 해결, 10분) ✅ **권장**
- TimerTab을 Error Boundary로 감싸기
- 에러 발생 시 Fallback UI 표시
- ✅ 리스크: 없음, 사용자 경험 개선

**방안 B: 광고 조건부 렌더링** (안전한 해결, 5분) ✅ **권장**
- 광고 로딩 실패 시 컴포넌트 숨김
- 에러 처리 강화
- ✅ 리스크: 없음, 광고 수익 약간 감소

**방안 C: 광고 제거** (임시 해결, 2분) ⚠️ **비권장**
- TimerTab에서 BannerAd 제거
- ⚠️ 리스크: 광고 수익 손실

---

## 📊 수정 후 테스트 계획

### 필수 테스트 항목
1. **데일리 타로 저장**
   - 무료 체험 중 저장 (무제한)
   - 무료 체험 종료 후 저장 (15개 제한)
   - 15개 저장 후 추가 저장 시도 (제한 메시지)

2. **타이머 탭 안정성**
   - 앱 실행 후 10분 대기
   - 광고 로딩 실패 시나리오
   - 메모리 누수 확인

3. **전체 앱 회귀 테스트**
   - 다른 탭 정상 작동 확인
   - 카드 뽑기 기능
   - 저널 조회

---

**다음 단계**: 사용자에게 추가 정보 요청 또는 즉시 수정 시작
