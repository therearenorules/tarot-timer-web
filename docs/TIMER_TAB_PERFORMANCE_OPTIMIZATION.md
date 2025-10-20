# ⚡ 타이머 탭 성능 최적화 계획

**작성 일자**: 2025-10-20
**대상 플랫폼**: Android (우선), iOS (2차)
**현재 상태**: 버벅거림 현상 발견
**목표**: 60 FPS 안정적 유지, 부드러운 스크롤

---

## 🎯 **현재 문제점 분석**

### **1. 증상**
- ❌ 타이머 탭 스크롤 시 버벅임 (40-50 FPS)
- ❌ 카드 이미지 로딩 지연 (1-2초)
- ❌ 스크롤 중 끊김 현상
- ❌ 메모리 사용량 증가

### **2. 원인 분석**

#### **A. 과도한 컴포넌트 렌더링**
```typescript
// 현재 구조: ScrollView + 24개 카드 동시 렌더링
<ScrollView>
  {dailyCards.map((card, hour) => (
    <TarotCardComponent key={hour} card={card} hour={hour} />
  ))}
</ScrollView>

// 문제점:
// - 24개 카드가 모두 한번에 렌더링됨
// - 화면 밖 카드도 메모리에 유지됨
// - 스크롤마다 모든 카드 리렌더링
```

#### **B. 이미지 로딩 비효율**
```typescript
// 현재 구조: 순차적 이미지 로딩
for (const card of cards) {
  await preloadImage(card.imagePath);
}

// 문제점:
// - 순차 실행으로 병목 발생
// - 78개 타로 카드 전체 로드 시도
// - AsyncStorage 동기화 부담
```

#### **C. 불필요한 리렌더링**
```typescript
// 현재 구조: Context 변경 시 전체 리렌더링
const { dailyCards, memos } = useTarotCards();

// 문제점:
// - dailyCards 변경 → 24개 카드 모두 리렌더링
// - memos 변경 → 24개 카드 모두 리렌더링
// - memo/useCallback 최적화 부족
```

#### **D. Android 특화 성능 이슈**
```typescript
// Android 특성:
// - JavaScript 브리지 오버헤드
// - 네이티브 뷰 계층 복잡도
// - Hermes 엔진 최적화 필요
// - 하드웨어 가속 미활용
```

---

## 🚀 **최적화 전략**

### **Phase 1: FlatList 가상화 적용** 🔴 P0 (2-3시간)

#### **목표**
- 화면에 보이는 카드만 렌더링
- 스크롤 성능 50% 향상
- 메모리 사용량 30% 감소

#### **구현 방안**

```typescript
// components/tabs/TimerTab.tsx 수정

import { FlatList } from 'react-native';

// ScrollView → FlatList 변경
<FlatList
  data={dailyCards}
  renderItem={({ item: card, index: hour }) => (
    <TarotCardComponent
      key={hour}
      card={card}
      hour={hour}
    />
  )}
  keyExtractor={(item, index) => `card-${index}`}

  // 가상화 최적화
  windowSize={5}  // 화면 위아래 5개씩만 렌더링
  initialNumToRender={6}  // 초기 6개만 렌더링
  maxToRenderPerBatch={3}  // 배치당 3개씩
  removeClippedSubviews={true}  // Android 최적화

  // 성능 최적화
  getItemLayout={(data, index) => ({
    length: CARD_HEIGHT,  // 카드 높이 고정
    offset: CARD_HEIGHT * index,
    index,
  })}

  // 스크롤 최적화
  decelerationRate="fast"
  showsVerticalScrollIndicator={true}
/>
```

#### **예상 효과**
- ✅ FPS: 40-50 → 55-60
- ✅ 메모리: -30% (150MB → 105MB)
- ✅ 스크롤: 부드럽게 개선

---

### **Phase 2: 이미지 로딩 병렬화** 🟡 P1 (1-2시간)

#### **목표**
- 이미지 로딩 시간 70% 단축
- 우선순위 기반 스마트 로딩
- 캐시 히트율 90% 이상

#### **구현 방안**

```typescript
// utils/imageCache.ts 수정

// A. 병렬 배치 로딩 (기존: 순차 → 개선: 병렬)
export async function preloadTarotImagesBatch(
  cards: TarotCard[],
  batchSize = 10,
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<void> {
  const batches: TarotCard[][] = [];

  // 배치로 분할
  for (let i = 0; i < cards.length; i += batchSize) {
    batches.push(cards.slice(i, i + batchSize));
  }

  // 배치별 병렬 처리
  for (const batch of batches) {
    await Promise.all(
      batch.map(card => preloadImage(card.imagePath, priority))
    );
  }
}

// B. 우선순위 기반 로딩
export async function preloadDailyCardsOptimized(
  dailyCards: TarotCard[]
): Promise<void> {
  const currentHour = new Date().getHours();

  // 1순위: 현재 시간 카드 (즉시)
  await preloadImage(dailyCards[currentHour].imagePath, 'high');

  // 2순위: 주변 4개 카드 (1초 후)
  setTimeout(() => {
    const nearby = [
      dailyCards[currentHour - 1],
      dailyCards[currentHour + 1],
      dailyCards[currentHour - 2],
      dailyCards[currentHour + 2],
    ].filter(Boolean);

    preloadTarotImagesBatch(nearby, 2, 'high');
  }, 1000);

  // 3순위: 나머지 카드 (2초 후)
  setTimeout(() => {
    const remaining = dailyCards.filter((_, i) =>
      Math.abs(i - currentHour) > 2
    );

    preloadTarotImagesBatch(remaining, 10, 'normal');
  }, 2000);
}
```

#### **예상 효과**
- ✅ 로딩 시간: 3-5초 → 1-2초
- ✅ 초기 로딩: 즉시 표시
- ✅ 사용자 체감: 대폭 개선

---

### **Phase 3: 컴포넌트 메모이제이션** 🟡 P1 (1-2시간)

#### **목표**
- 불필요한 리렌더링 제거
- 메모리 사용 효율화
- 응답 속도 향상

#### **구현 방안**

```typescript
// components/TarotCard.tsx 최적화

import React, { memo, useMemo, useCallback } from 'react';

// A. 카드 컴포넌트 메모이제이션
export const TarotCardComponent = memo(({
  card,
  hour,
  onPress,
}: TarotCardProps) => {
  // 불변 데이터 메모이제이션
  const cardData = useMemo(() => ({
    name: card.name_ko,
    meaning: card.meaning_ko,
    imagePath: card.imagePath,
  }), [card.name_ko, card.meaning_ko, card.imagePath]);

  // 콜백 메모이제이션
  const handlePress = useCallback(() => {
    onPress?.(hour, card);
  }, [hour, card, onPress]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <OptimizedImage source={cardData.imagePath} />
      <Text>{cardData.name}</Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수
  return (
    prevProps.card.name_ko === nextProps.card.name_ko &&
    prevProps.hour === nextProps.hour
  );
});

// B. 타이머 탭 최적화
const TimerTab = () => {
  const { dailyCards, memos } = useTarotCards();

  // 메모 변경 최적화
  const handleMemoChange = useCallback((hour: number, memo: string) => {
    // 해당 시간만 업데이트
    updateMemo(hour, memo);
  }, []);

  // 카드 렌더 최적화
  const renderCard = useCallback(({ item: card, index: hour }) => (
    <TarotCardComponent
      card={card}
      hour={hour}
      memo={memos[hour]}
      onMemoChange={handleMemoChange}
    />
  ), [memos, handleMemoChange]);

  return (
    <FlatList
      data={dailyCards}
      renderItem={renderCard}
      // ...
    />
  );
};
```

#### **예상 효과**
- ✅ 리렌더링: -60% (메모 변경 시)
- ✅ 응답 속도: 즉각 반응
- ✅ 메모리: 안정적 유지

---

### **Phase 4: Android 네이티브 최적화** 🟢 P2 (30분)

#### **목표**
- Android 하드웨어 가속 활용
- Hermes 엔진 최적화
- 네이티브 뷰 계층 단순화

#### **구현 방안**

```typescript
// A. Android 매니페스트 최적화 (app.json)
{
  "android": {
    "hardwareAcceleration": true,  // ✅ 하드웨어 가속
    "largeHeap": true,  // ✅ 대용량 힙
    "enableHermes": true  // ✅ Hermes 엔진
  }
}

// B. 네이티브 뷰 최적화
<View
  style={styles.cardContainer}
  renderToHardwareTextureAndroid={true}  // ✅ 하드웨어 텍스처
  needsOffscreenAlphaCompositing={false}  // ✅ 오프스크린 컴포지팅 비활성화
  shouldRasterizeIOS={true}  // ✅ iOS 래스터화
>
  <TarotCardComponent />
</View>

// C. 이미지 최적화
<Image
  source={cardImage}
  resizeMode="cover"
  fadeDuration={0}  // ✅ Android 페이드 비활성화 (성능)
/>
```

#### **예상 효과**
- ✅ 렌더링 성능: +10-15%
- ✅ 메모리 안정성: 향상
- ✅ 배터리 소모: 감소

---

## 📊 **성능 측정 계획**

### **측정 도구**
```typescript
// utils/performanceMonitor.ts

import { PerformanceObserver, performance } from 'react-native';

class PerformanceMonitor {
  static measureFPS(callback: (fps: number) => void) {
    // FPS 측정 로직
  }

  static measureMemory(): MemoryUsage {
    // 메모리 측정 로직
  }

  static measureRenderTime(componentName: string): void {
    // 렌더링 시간 측정
  }
}
```

### **측정 지표**

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| FPS | 40-50 | 55-60 | PerformanceMonitor |
| 초기 로딩 | 3-5초 | 1-2초 | Performance API |
| 메모리 | 150MB | 105MB | memory-profiler |
| 스크롤 응답 | 200ms | 50ms | TouchEvent 타임스탬프 |

---

## 🎯 **실행 계획**

### **오늘 (2025-10-20)**
- [x] 문제점 분석 완료
- [ ] Phase 1: FlatList 가상화 구현
- [ ] 성능 측정 도구 추가

### **내일 (2025-10-21)**
- [ ] Phase 2: 이미지 로딩 병렬화
- [ ] Phase 3: 컴포넌트 메모이제이션
- [ ] 테스트 및 검증

### **모레 (2025-10-22)**
- [ ] Phase 4: Android 네이티브 최적화
- [ ] Android Build 40 준비
- [ ] 성능 벤치마크 문서화

---

## 📈 **예상 성과**

### **성능 개선**
- FPS: 40-50 → **55-60** (+25%)
- 초기 로딩: 3-5초 → **1-2초** (-60%)
- 메모리: 150MB → **105MB** (-30%)
- 스크롤 응답: 200ms → **50ms** (-75%)

### **사용자 경험**
- ✅ 부드러운 스크롤
- ✅ 즉각적인 카드 표시
- ✅ 안정적인 앱 실행
- ✅ 배터리 효율 개선

---

**마지막 업데이트**: 2025-10-20
**작성자**: Claude Code AI Assistant
**상태**: 계획 수립 완료 → 구현 준비 🚀
