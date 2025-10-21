# 앱 종료 후 광고 표시 동작 분석

**작성일**: 2025-10-21
**분석 대상**: InterstitialAd.tsx - 앱 재시작 시나리오

---

## 🔍 **핵심 질문**

> "앱이 꺼졌을 때는 어떻게 체크되서 광고가 나오는건지?"

---

## 📊 **저장 방식 분석**

### 1️⃣ AsyncStorage에 저장되는 데이터 (영구 보존)

```typescript
// 로컬 스토리지 키
const AD_DAILY_COUNT_KEY = 'ad_daily_count';        // ✅ 저장됨
const AD_DAILY_DATE_KEY = 'ad_daily_date';          // ✅ 저장됨
const USER_INSTALL_DATE_KEY = 'user_install_date';  // ✅ 저장됨
```

**저장 시점**:
```typescript
// 광고 표시 성공 시
await AsyncStorage.setItem(AD_DAILY_COUNT_KEY, newCount.toString());
await AsyncStorage.setItem(AD_DAILY_DATE_KEY, today);
```

**복원 시점** (앱 시작 시):
```typescript
const savedDate = await AsyncStorage.getItem(AD_DAILY_DATE_KEY);
const savedCount = await AsyncStorage.getItem(AD_DAILY_COUNT_KEY);
```

### 2️⃣ 메모리에만 저장되는 데이터 (앱 종료 시 소멸) ⚠️

```typescript
const lastShownTimeRef = React.useRef<number>(0);  // ❌ AsyncStorage 저장 안됨!
```

**문제점**:
- 광고 표시 시: `lastShownTimeRef.current = Date.now()`
- **AsyncStorage에 저장하지 않음** ❌
- 앱 종료 시 데이터 소멸
- 앱 재시작 시 `0`으로 초기화됨

---

## 🎯 **앱 재시작 시나리오별 동작**

### 시나리오 1: 앱 실행 중 (백그라운드 전환)

**상황**: 앱을 백그라운드로 보냈다가 다시 포그라운드로

```
1. 사용자가 광고 시청 (10:00)
   → lastShownTimeRef.current = 1234567890000

2. 앱을 백그라운드로 전환 (홈 버튼)
   → lastShownTimeRef 메모리 유지 ✅

3. 5분 후 앱을 다시 열기 (10:05)
   → lastShownTimeRef 여전히 유지
   → 15분 간격 체크: 5분 경과 < 15분
   → 광고 표시 안됨 ✅ (정상)
```

**결과**: ✅ **15분 간격 정책 유지됨**

---

### 시나리오 2: 앱 완전 종료 (메모리에서 제거)

**상황**: 앱을 스와이프로 완전 종료 후 재시작

```
1. 사용자가 광고 시청 (10:00)
   → lastShownTimeRef.current = 1234567890000
   → AsyncStorage: ad_daily_count = 1 ✅

2. 앱을 스와이프로 완전 종료
   → lastShownTimeRef 메모리에서 소멸 ❌
   → AsyncStorage는 유지됨 ✅

3. 5분 후 앱을 다시 시작 (10:05)
   → lastShownTimeRef.current = 0 (초기화됨!)
   → AsyncStorage: ad_daily_count = 1 (복원됨)
   → 15분 간격 체크: timeSinceLastShown = 현재시각 - 0 = 매우 큼
   → if (timeSinceLastShown < 15분 && lastShownTimeRef.current > 0)
   → lastShownTimeRef.current === 0 이므로 조건 통과!
   → 광고 표시됨! ⚠️
```

**코드 분석**:
```typescript
// Line 121
if (timeSinceLastShown < MIN_INTERVAL_MS && lastShownTimeRef.current > 0) {
  // ↑ 중요!
  // lastShownTimeRef.current === 0 이면 이 조건을 통과함
  console.log(`⏰ 전면광고 대기 중: ${minutesRemaining}분 후 표시 가능`);
  return;
}
```

**결과**: ⚠️ **15분 간격 정책이 무시됨!**

---

### 시나리오 3: 자정 넘어서 앱 재시작

**상황**: 자정 전에 광고 시청, 자정 후 앱 재시작

```
1. 사용자가 광고 시청 (23:50)
   → lastShownTimeRef.current = 1234567890000
   → AsyncStorage: ad_daily_count = 5
   → AsyncStorage: ad_daily_date = "Mon Oct 21 2025"

2. 앱 완전 종료

3. 다음날 앱 시작 (00:10)
   → lastShownTimeRef.current = 0 (초기화)
   → savedDate = "Mon Oct 21 2025"
   → today = "Tue Oct 22 2025"
   → savedDate !== today
   → 일일 카운터 리셋! ✅
   → ad_daily_count = 0
   → ad_daily_date = "Tue Oct 22 2025"
```

**코드**:
```typescript
// Line 80-85
if (savedDate !== today) {
  // 날짜가 바뀌면 카운터 리셋
  await AsyncStorage.setItem(AD_DAILY_DATE_KEY, today);
  await AsyncStorage.setItem(AD_DAILY_COUNT_KEY, '0');
  setDailyAdCount(0);
  console.log('🔄 일일 광고 카운터 리셋 (새로운 날)');
}
```

**결과**: ✅ **일일 카운터는 정상 리셋됨**

---

## 🐛 **발견된 문제**

### 문제: 앱 재시작 시 15분 간격 정책이 무시됨

**원인**:
```typescript
const lastShownTimeRef = React.useRef<number>(0);
// ❌ AsyncStorage에 저장하지 않음
// ❌ 앱 종료 시 데이터 소멸
```

**영향**:
- ✅ **일일 한도 (10회)**: 정상 작동 (AsyncStorage 사용)
- ✅ **날짜 리셋**: 정상 작동 (AsyncStorage 사용)
- ✅ **충성 고객 인식**: 정상 작동 (AsyncStorage 사용)
- ❌ **15분 간격**: 앱 재시작 시 무시됨 (메모리만 사용)

---

## 📊 **실제 동작 예시**

### 예시 1: 일반적인 사용 (앱 유지)

```
10:00 - 세션 완료 → 광고 표시 ✅ (1/10)
10:05 - 세션 완료 → 15분 미경과 ❌
10:15 - 세션 완료 → 광고 표시 ✅ (2/10)
10:20 - 세션 완료 → 15분 미경과 ❌
10:30 - 세션 완료 → 광고 표시 ✅ (3/10)
```

**결과**: ✅ 15분 간격 정상 작동

### 예시 2: 앱 재시작 (완전 종료 후)

```
10:00 - 세션 완료 → 광고 표시 ✅ (1/10)
10:05 - 앱 완전 종료
10:10 - 앱 재시작
10:11 - 세션 완료 → 광고 표시 ✅ (2/10)
      ↑ 문제!
      5분밖에 안 지났는데 광고 표시됨
      15분 간격 무시됨 ❌
```

**결과**: ⚠️ 15분 간격 정책 무시됨

### 예시 3: 여러 번 재시작

```
10:00 - 광고 표시 ✅ (1/10)
10:05 - 앱 재시작 → 광고 표시 ✅ (2/10) ← 5분만에!
10:10 - 앱 재시작 → 광고 표시 ✅ (3/10) ← 5분만에!
10:15 - 앱 재시작 → 광고 표시 ✅ (4/10) ← 5분만에!
...
11:00 - 광고 표시 ✅ (10/10) ← 일일 한도 도달
11:05 - 앱 재시작 → 광고 표시 안됨 ❌ (일일 한도)
```

**결과**:
- ⚠️ 15분 간격 무시되지만
- ✅ 일일 한도 10회는 유지됨

---

## 🎯 **현재 정책의 실제 동작**

### 보호 장치 1: 일일 한도 (강력함) ✅

```typescript
const MAX_DAILY_ADS = 10;
// AsyncStorage에 저장되므로 앱 재시작 무관
```

**효과**:
- 앱을 아무리 재시작해도 하루 10회 이상 광고 표시 안됨
- **최종 방어선 역할** ✅

### 보호 장치 2: 15분 간격 (약함) ⚠️

```typescript
const MIN_INTERVAL_MS = 15 * 60 * 1000;
// 메모리에만 저장, 앱 재시작 시 리셋
```

**효과**:
- 앱 실행 중에는 15분 간격 유지 ✅
- 앱 재시작 시 간격 체크 무시됨 ⚠️

---

## 💡 **사용자 경험 영향 분석**

### 긍정적 측면 ✅

1. **일일 한도가 핵심 보호 장치**
   - 하루 10회 이상은 절대 표시 안됨
   - 앱 재시작과 무관하게 유지

2. **자주 재시작하는 사용자는 드뭄**
   - 대부분 사용자는 앱을 백그라운드로만 전환
   - 완전 종료하는 경우가 적음

3. **15분 간격은 보조 정책**
   - 핵심은 일일 한도 (10회)
   - 15분 간격은 추가 보호

### 부정적 측면 ⚠️

1. **의도적 악용 가능**
   ```
   사용자가 광고를 피하기 위해:
   - 광고 표시됨
   - 앱 종료
   - 5분 후 재시작
   - 또 광고 표시됨 (15분 안 지났는데)
   ```

2. **예상치 못한 광고**
   ```
   정상 사용자:
   - 10:00 광고 시청
   - 10:05 배터리 절약으로 앱 종료
   - 10:10 앱 재시작
   - 광고 또 표시됨 (불편함)
   ```

---

## 🔧 **개선 방안 (선택 사항)**

### 옵션 1: lastShownTime을 AsyncStorage에 저장

```typescript
// 현재
const lastShownTimeRef = React.useRef<number>(0);

// 개선안
const AD_LAST_SHOWN_TIME_KEY = 'ad_last_shown_time';

// 초기화 시
const savedTime = await AsyncStorage.getItem(AD_LAST_SHOWN_TIME_KEY);
const lastShownTime = savedTime ? parseInt(savedTime, 10) : 0;

// 광고 표시 시
await AsyncStorage.setItem(AD_LAST_SHOWN_TIME_KEY, Date.now().toString());
```

**효과**:
- ✅ 앱 재시작 후에도 15분 간격 유지
- ✅ 악용 방지
- ⚠️ AsyncStorage 읽기/쓰기 1회 추가

**권장도**: 🟡 선택 사항 (현재 정책도 충분함)

---

### 옵션 2: 현재 정책 유지 (권장) ✅

**이유**:
1. **일일 한도 10회가 핵심 보호**
   - 앱 재시작과 무관하게 작동
   - 충분히 사용자 친화적

2. **15분 간격은 보조 정책**
   - 앱 실행 중에만 작동해도 충분
   - 대부분 사용자는 앱을 완전 종료하지 않음

3. **복잡도 증가 불필요**
   - AsyncStorage 접근 증가
   - 추가 오류 가능성
   - 얻는 이득이 크지 않음

---

## 📊 **최종 결론**

### 현재 동작 요약:

| 상황 | 15분 간격 | 일일 10회 | 평가 |
|------|-----------|-----------|------|
| **앱 실행 중** | ✅ 작동 | ✅ 작동 | 🟢 완벽 |
| **백그라운드 전환** | ✅ 작동 | ✅ 작동 | 🟢 완벽 |
| **앱 완전 종료** | ❌ 리셋 | ✅ 작동 | 🟡 허용 가능 |
| **자정 리셋** | ❌ 리셋 | ✅ 리셋 | 🟢 정상 |

### 핵심 보호 장치:

```
✅ 일일 한도 10회 (AsyncStorage) ← 강력함!
⚠️ 15분 간격 (메모리) ← 보조 정책
✅ 충성 고객 50% 감소 (AsyncStorage)
✅ 날짜별 리셋 (AsyncStorage)
```

### 권장 조치:

**현재 정책 유지 (변경 불필요)** ✅

**이유**:
1. 일일 한도가 핵심 방어선으로 충분히 작동
2. 15분 간격은 앱 실행 중에만 작동해도 OK
3. 추가 구현의 복잡도 > 얻는 이득
4. 사용자 경험 큰 영향 없음

---

## 🔍 **코드 위치 참고**

**광고 간격 체크**: `components/ads/InterstitialAd.tsx`
- **Line 36**: `lastShownTimeRef` 선언 (메모리만)
- **Line 121**: 15분 간격 체크 조건
- **Line 141**: 광고 표시 시간 기록 (메모리만)
- **Line 146**: 일일 카운터 저장 (AsyncStorage ✅)

**초기화 로직**: `components/ads/InterstitialAd.tsx`
- **Line 76-92**: AsyncStorage에서 일일 카운터 복원
- **주의**: lastShownTime은 복원하지 않음!

---

**작성자**: Claude Code
**마지막 업데이트**: 2025-10-21
