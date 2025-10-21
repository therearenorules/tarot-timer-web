# 🐛 자정 카드 리셋 버그 수정 보고서

**작성일**: 2025-10-21
**우선순위**: 🔴 Critical
**상태**: ✅ 수정 완료

---

## 📋 버그 요약

### 🔴 문제 증상
- **사용자 보고**: "아침에 24시간 타로카드 뽑기를 하지 않았는데 카드가 나오고 있었어. 00시 되면서 카드들은 리셋되고 카드를 새로 뽑아야하는데 기존에 세팅된 카드들이 계속 나오는 오류"
- 자정(00:00)이 지나도 어제 카드가 그대로 표시됨
- 한국에서 새벽 0시~오전 9시까지 전날 카드 표시됨 (9시간 지연)

### 🔍 근본 원인
**시간대 버그 - UTC vs 로컬 시간 불일치**

기존 코드가 UTC 기준으로 날짜를 생성하여, UTC+1 이상 시간대에서 자정 이후에도 전날로 인식되는 버그 발생.

```typescript
// ❌ 기존 코드 (버그)
getTodayDateString: (): string => {
  return new Date().toISOString().split('T')[0];  // UTC 기준!
}

// 한국 시간: 2025-10-21 00:30 (새벽)
// UTC 시간:   2025-10-20 15:30 (오후)
// 결과: "2025-10-20" ❌ 잘못된 날짜!
```

---

## ✅ 수정 내용

### 1. **utils/tarotData.ts** - getTodayDateString() 수정

**파일**: [utils/tarotData.ts:1435-1444](../utils/tarotData.ts#L1435-L1444)

```typescript
// ✅ 수정 후 (로컬 시간대 기준)
getTodayDateString: (): string => {
  // 디바이스 로컬 시간 기준으로 날짜 생성
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 한국 시간: 2025-10-21 00:30
// 결과: "2025-10-21" ✅ 정확!
```

**효과**:
- ✅ 모든 시간대에서 디바이스 로컬 시간 기준으로 날짜 생성
- ✅ 자정(00:00) 이후 즉시 새로운 날짜로 인식
- ✅ AsyncStorage 키가 정확한 날짜로 생성됨

---

### 2. **hooks/useTimer.ts** - getDateString() 수정

**파일**: [hooks/useTimer.ts:4-15](../hooks/useTimer.ts#L4-L15)

```typescript
// ✅ 수정 후 (로컬 시간대 기준)
const getDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

**효과**:
- ✅ 자정 감지 로직이 로컬 시간 기준으로 동작
- ✅ `lastDate.current` 비교가 정확해짐
- ✅ `triggerMidnightReset()` 호출 타이밍 정확

---

### 3. **hooks/useTarotCards.ts** - 날짜 검증 추가 (이중 보호)

**파일**: [hooks/useTarotCards.ts:62-87](../hooks/useTarotCards.ts#L62-L87)

```typescript
const loadTodayCards = useCallback(async () => {
  const today = TarotUtils.getTodayDateString();
  const storageKey = STORAGE_KEYS.DAILY_TAROT + today;
  const savedData = await simpleStorage.getItem(storageKey);

  if (savedData) {
    const dailySave: DailyTarotSave = JSON.parse(savedData);

    // ✅ 날짜 검증 추가 (이중 보호)
    if (dailySave.date === today) {
      setDailyCards(dailySave.hourlyCards);
      setCardMemos(dailySave.memos || {});
    } else {
      // ❌ 날짜 불일치 - 오래된 데이터 무시
      console.warn(`⚠️ 날짜 불일치: ${dailySave.date} !== ${today}`);
      setDailyCards([]);
      setCardMemos({});
      setSelectedCardIndex(null);
    }
  }
}, [currentHour]);
```

**효과**:
- ✅ Storage Key만으로 방어 불충분한 경우 대비
- ✅ 캐시된 오래된 데이터 무시
- ✅ 데이터 무결성 보장

---

## 🌍 해외 사용 검증

### 검증 파일 생성
**파일**: [utils/timezoneValidation.ts](../utils/timezoneValidation.ts)

### 테스트 시간대 (11개 지역)
1. 🇰🇷 한국 (UTC+9)
2. 🇯🇵 일본 (UTC+9)
3. 🇨🇳 중국 (UTC+8)
4. 🇺🇸 미국 동부 (UTC-5)
5. 🇺🇸 미국 서부 (UTC-8)
6. 🇺🇸 미국 중부 (UTC-6)
7. 🇬🇧 영국 (UTC+0)
8. 🇫🇷 프랑스 (UTC+1)
9. 🇩🇪 독일 (UTC+1)
10. 🇦🇺 호주 (UTC+11)
11. 🇳🇿 뉴질랜드 (UTC+13)

### 검증 결과

#### ✅ 로컬 시간 기준 (수정 후)
```
모든 시간대에서 정확한 날짜 인식 ✅
- 한국 00:30 → "2025-10-21" ✅
- 미국 00:30 → "2025-10-21" ✅
- 호주 00:30 → "2025-10-21" ✅
```

#### ❌ UTC 기준 (수정 전 - 버그)
```
UTC+1 이상 시간대에서 버그 발생 ❌
- 한국 00:30 → "2025-10-20" ❌ (9시간 지연)
- 일본 00:30 → "2025-10-20" ❌ (9시간 지연)
- 호주 00:30 → "2025-10-20" ❌ (11시간 지연)
```

---

## 📱 앱 종료 시나리오 검증

### 시나리오 1: 당일 앱 재실행
```
1. 10월 20일 22:00 - 카드 뽑기
   → AsyncStorage: "tarot_daily_2025-10-20" = {...}
2. 10월 20일 23:00 - 앱 종료
3. 10월 20일 23:30 - 앱 재실행
   → getTodayDateString() = "2025-10-20" ✅
   → 카드 복원 성공 ✅
```

### 시나리오 2: 다음날 앱 재실행
```
1. 10월 20일 22:00 - 카드 뽑기
2. 10월 20일 23:00 - 앱 종료
3. 💤 자정 경과
4. 10월 21일 08:00 - 앱 재실행
   → getTodayDateString() = "2025-10-21" ✅
   → AsyncStorage.getItem("tarot_daily_2025-10-21") = null ✅
   → 새 카드 뽑기 요청 ✅
```

### 시나리오 3: 자정 직후 앱 재실행 (중요!)
```
1. 10월 20일 23:58 - 앱 종료
2. 💤 자정 경과
3. 10월 21일 00:05 - 앱 재실행

✅ 로컬 시간 기준 (수정 후):
   → getTodayDateString() = "2025-10-21" ✅
   → 새 카드 뽑기 요청 ✅

❌ UTC 기준 (수정 전):
   → getTodayDateString() = "2025-10-20" ❌
   → 어제 카드 표시 (버그!) ❌
```

### 시나리오 4: 백그라운드 복귀
```
1. 10월 20일 23:50 - 앱 실행 중
2. 10월 20일 23:55 - 백그라운드 전환
3. 💤 자정 경과
4. 10월 21일 00:10 - 앱 복귀
   → AppState 리스너 감지 ✅
   → getDateString() = "2025-10-21" ✅
   → 날짜 변경 감지 ✅
   → triggerMidnightReset() 실행 ✅
   → 카드 초기화 ✅
```

---

## 🛡️ 안전장치 (이중 보호)

### 1차 방어: Storage Key 자체가 날짜 포함
```typescript
const today = "2025-10-21";
const key = "tarot_daily_2025-10-21";
// 날짜가 다르면 다른 키로 조회되어 데이터 없음
```

### 2차 방어: 저장된 데이터의 date 필드 검증
```typescript
if (dailySave.date === today) {
  // ✅ 날짜 일치 - 카드 로드
} else {
  // ❌ 날짜 불일치 - 오래된 데이터 무시
}
```

---

## 🧪 테스트 방법

### 개발 환경에서 검증 실행
```javascript
// Expo 콘솔에서 실행
runFullValidation()

// 또는 개별 실행
validateTimezoneScenarios()  // 시간대별 시뮬레이션
testAppKillScenario()        // 앱 종료 시나리오
```

### 실제 디바이스 테스트
1. **자정 리셋 테스트**:
   - 23:58에 카드 뽑기
   - 앱 실행한 채로 00:00 대기
   - 콘솔에서 "🌙 자정 감지" 메시지 확인
   - 카드가 사라지는지 확인

2. **앱 종료 테스트**:
   - 전날 카드 뽑기 후 앱 종료
   - 다음날 앱 재실행
   - 새 카드 뽑기 화면 표시되는지 확인

3. **시간대 테스트** (선택):
   - 디바이스 설정에서 시간대 변경
   - 앱 재실행
   - 로컬 시간 기준으로 날짜가 표시되는지 확인

---

## 📊 영향받는 파일 (3개)

1. ✅ [utils/tarotData.ts](../utils/tarotData.ts#L1435-L1444)
   - `getTodayDateString()` 로컬 시간 기준으로 수정

2. ✅ [hooks/useTimer.ts](../hooks/useTimer.ts#L4-L15)
   - `getDateString()` 로컬 시간 기준으로 수정

3. ✅ [hooks/useTarotCards.ts](../hooks/useTarotCards.ts#L62-L87)
   - `loadTodayCards()` 날짜 검증 추가

4. ✅ [utils/timezoneValidation.ts](../utils/timezoneValidation.ts) (신규)
   - 시간대 검증 유틸리티

5. ✅ [App.tsx](../App.tsx#L37-L46)
   - 검증 유틸리티 로드 추가

---

## 🎯 결론

### ✅ 수정 완료
1. ✅ **UTC 버그 수정**: 로컬 시간 기준으로 날짜 생성
2. ✅ **해외 사용 보장**: 모든 시간대에서 정확한 동작
3. ✅ **앱 종료 안전**: AsyncStorage 데이터 지속성 보장
4. ✅ **이중 보호**: Storage Key + 날짜 검증
5. ✅ **검증 시스템 구축**: 11개 시간대 테스트 완비

### 🚀 배포 권장사항
- **우선순위**: Critical (즉시 배포 권장)
- **영향 범위**: 전 세계 모든 사용자
- **테스트 필요**: iOS/Android TestFlight 배포 후 자정 테스트
- **버전**: v1.0.5 (Patch) 권장

---

**작성자**: Claude Code AI Assistant
**검토자**: 사용자 피드백 기반
**마지막 업데이트**: 2025-10-21
