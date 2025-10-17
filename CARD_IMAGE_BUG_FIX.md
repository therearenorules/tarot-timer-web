# 🔧 24시간 카드 이미지 로딩 버그 수정 가이드

**날짜**: 2025-10-17
**우선순위**: 🔴 P0 (크리티컬)
**영향**: 24시간 타로 카드 뽑기 후 카드 클릭 시 이미지 미표시

---

## 📋 문제 요약

**증상**: 저널 탭에서 저장된 24시간 타로 기록 클릭 시 카드 이미지가 표시되지 않음

**원인**: `components/TarotDaily.tsx`에서 `hourlyCards` 데이터 구조 불일치
- 저장 형식: `TarotCard[]` (배열)
- 접근 방식: `hourlyCards?.[hour]` (객체로 취급)

---

## 🔍 코드 분석

### 1. 데이터 구조 정의 (utils/tarotData.ts)
```typescript
export interface DailyTarotSave {
  id: string;
  date: string;
  hourlyCards: TarotCard[]; // ← 배열로 정의됨
  memos: { [hour: number]: string };
  insights: string;
  savedAt: string;
}
```

### 2. 데이터 저장 (hooks/useTarotCards.ts)
```typescript
const saveDailyCards = useCallback(async (cards: TarotCard[], memos?: Record<number, string>) => {
  const saveData: DailyTarotSave = {
    date: today,
    hourlyCards: cards, // ← 배열로 저장됨
    memos: memos || cardMemos,
  };
  await simpleStorage.setItem(storageKey, JSON.stringify(saveData));
}, [cardMemos]);
```

### 3. 잘못된 접근 방식 (components/TarotDaily.tsx)

#### ❌ 문제 1: Line 91 (DailyTarotViewer 컴포넌트)
```typescript
if (!reading) return null;

const selectedCard = reading.hourlyCards?.[selectedHour]; // ❌ 객체 접근 방식
```

#### ❌ 문제 2: Line 130 (24시간 카드 루프)
```typescript
{Array.from({ length: 24 }, (_, hour) => {
  const card = reading.hourlyCards?.[hour]; // ❌ 객체 접근 방식
  const hasMemo = cardMemos[hour] && cardMemos[hour].trim().length > 0;
  const isSelected = selectedHour === hour;

  if (!card) return null; // ← card가 undefined이므로 이미지 표시 안됨
```

---

## ✅ 수정 방법

### 수정 1: DailyTarotViewer 컴포넌트 (Line 89-92)

**변경 전**:
```typescript
if (!reading) return null;

const selectedCard = reading.hourlyCards?.[selectedHour];

return (
```

**변경 후**:
```typescript
if (!reading) return null;

// ✅ FIX: hourlyCards는 배열이므로 배열 접근 방식 사용
const hourlyCardsArray = Array.isArray(reading.hourlyCards) ? reading.hourlyCards : [];
const selectedCard = hourlyCardsArray[selectedHour];

return (
```

### 수정 2: 24시간 카드 루프 (Line 128-134)

**변경 전**:
```typescript
{Array.from({ length: 24 }, (_, hour) => {
  const card = reading.hourlyCards?.[hour];
  const hasMemo = cardMemos[hour] && cardMemos[hour].trim().length > 0;
  const isSelected = selectedHour === hour;

  if (!card) return null;
```

**변경 후**:
```typescript
{Array.from({ length: 24 }, (_, hour) => {
  // ✅ FIX: 배열 접근 방식으로 수정 (위에서 선언한 hourlyCardsArray 사용)
  const card = hourlyCardsArray[hour];
  const hasMemo = cardMemos[hour] && cardMemos[hour].trim().length > 0;
  const isSelected = selectedHour === hour;

  if (!card) return null;
```

---

## 📝 수정 단계

### Step 1: components/TarotDaily.tsx 파일 열기
```bash
code components/TarotDaily.tsx
```

### Step 2: Line 89-92 수정
1. Line 91 찾기: `const selectedCard = reading.hourlyCards?.[selectedHour];`
2. 위에 새 줄 추가:
   ```typescript
   const hourlyCardsArray = Array.isArray(reading.hourlyCards) ? reading.hourlyCards : [];
   ```
3. Line 91을 다음으로 변경:
   ```typescript
   const selectedCard = hourlyCardsArray[selectedHour];
   ```

### Step 3: Line 128-130 수정
1. Line 130 찾기: `const card = reading.hourlyCards?.[hour];`
2. 다음으로 변경:
   ```typescript
   const card = hourlyCardsArray[hour];
   ```

### Step 4: 파일 저장 및 테스트
```bash
# 개발 서버가 실행 중이면 자동 반영됨
npx expo start --port 8083

# 브라우저 또는 실제 디바이스에서 테스트
# 1. 24시간 카드 뽑기
# 2. 저널 탭으로 이동
# 3. 저장된 기록 클릭
# 4. 카드 이미지가 정상 표시되는지 확인
```

---

## 🧪 테스트 체크리스트

- [ ] **24시간 카드 뽑기 후 저장 확인**
  - 타이머 탭에서 24시간 카드 뽑기
  - 저장 완료 메시지 확인

- [ ] **저널 탭에서 기록 조회**
  - 저널 탭으로 이동
  - Daily Tarot 탭에서 저장된 기록 확인
  - 카드 미리보기 이미지 표시 확인

- [ ] **상세 뷰어 모달 테스트**
  - 저장된 기록 클릭하여 모달 열기
  - 24시간 카드 가로 스크롤 확인
  - 각 시간별 카드 이미지 표시 확인
  - 카드 클릭 시 선택 상태 변경 확인

- [ ] **메모 기능 테스트**
  - 특정 시간 카드 클릭
  - 메모 입력 및 저장
  - 메모 표시 여부 확인 (📝 아이콘)

- [ ] **다국어 지원 테스트**
  - 설정에서 언어 변경 (한국어, English, 日本語)
  - 시간 표시 확인 (자정, noon, 午前 등)

---

## 🎯 예상 결과

**수정 전**:
```
24시간 카드 클릭 → card = undefined → 이미지 미표시 ❌
```

**수정 후**:
```
24시간 카드 클릭 → card = hourlyCardsArray[hour] → 이미지 정상 표시 ✅
```

---

## 📊 관련 파일

1. **수정 필요**: [components/TarotDaily.tsx](components/TarotDaily.tsx)
2. **참고**: [utils/tarotData.ts](utils/tarotData.ts) - 데이터 구조 정의
3. **참고**: [hooks/useTarotCards.ts](hooks/useTarotCards.ts) - 저장 로직
4. **테스트**: Android 실제 디바이스 또는 Expo Go 앱

---

## 🔄 다음 단계

이 수정이 완료되면 다음 작업 진행:
1. ⏳ **SafeAreaView 수정** - 상단/하단 네비게이션 바 겹침 현상
2. ⏳ **실제 디바이스 통합 테스트**
3. ⏳ **Android Build 34 준비**

---

**마지막 업데이트**: 2025-10-17
**작성자**: Claude Code SuperClaude Agent
**상태**: 수정 방법 문서화 완료, 실제 코드 수정 대기
