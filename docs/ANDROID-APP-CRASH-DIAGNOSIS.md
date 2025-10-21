# 🔴 Android 앱 다운 문제 - 긴급 진단 보고서

**작성일**: 2025-10-21
**우선순위**: 🔴 Critical
**증상**: 앱을 계속 켜두면 충돌 발생 (iOS에서는 발생하지 않음)
**빌드 버전**: Android Build 40 (v1.0.4)

---

## 🚨 **문제 요약**

### **사용자 보고**
> "안드로이드 앱에서 테스트 진행 중인데, 앱을 계속 켜두다 보면 계속 앱이 다운되는 오류가 발생되고 있는거 같아. 앱스토어에서는 이런일이 없는데 안드로이드에서는 이런 다운이 발생되는거 같아."

### **핵심 증상**
- ❌ 앱을 계속 실행하면 충돌 (Crash)
- ✅ iOS에서는 정상 동작 (앱스토어 = TestFlight)
- 🔴 Android 특정 문제

---

## 🔍 **근본 원인 분석 (5가지 주요 원인)**

과거 Android Build 33, 34, 39 분석 문서를 기반으로 다음 5가지 원인이 가장 유력합니다:

---

### **1. 메모리 누수 (Memory Leak)** 🔴 **가장 유력**

#### **원인**
Android는 iOS보다 메모리 관리가 엄격하며, 장시간 실행 시 메모리 누수로 인해 OOM(Out Of Memory) 크래시 발생.

#### **의심 지점**

##### **A. useTimer.ts - 타이머 클린업 부족**
[hooks/useTimer.ts:41-74](../hooks/useTimer.ts#L41-L74)

```typescript
// ✅ 타이머는 정리됨
useEffect(() => {
  const timer = setInterval(() => {
    // ... 날짜/시간 체크
  }, 60000); // 1분마다

  return () => clearInterval(timer); // ✅ 정리됨
}, [triggerMidnightReset]);

// ✅ AppState 리스너도 정리됨
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => {
    subscription?.remove(); // ✅ 정리됨
  };
}, [triggerMidnightReset]);
```

**현재 상태**: ✅ 타이머와 리스너는 정리되고 있음

##### **B. NotificationContext - 알림 리스너 누적**
[contexts/NotificationContext.tsx](../contexts/NotificationContext.tsx)

```typescript
// ⚠️ 알림 리스너가 계속 쌓일 가능성
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    // ...
  });

  // ❌ cleanup 확인 필요
  return () => subscription.remove();
}, []);
```

**의심 사유**:
- 알림이 1분마다 스케줄됨
- 리스너가 제대로 정리되지 않으면 메모리 누적
- Android는 iOS보다 메모리 제약이 심함

##### **C. 이미지 캐시 무한 증가**
[utils/imageCache.ts](../utils/imageCache.ts)

```typescript
// ⚠️ 이미지 캐시가 무제한으로 증가
private cacheRegistry: Map<string, CacheEntry> = new Map();

// 78개 타로 카드 이미지가 반복 로드되면서 캐시 증가
```

**의심 사유**:
- 타로 카드 78장 + 기타 이미지
- 캐시 크기 제한 없음
- Android 저사양 기기에서 메모리 부족

---

### **2. FlatList 메모리 최적화 부족** 🟡

#### **원인**
TimerTab의 FlatList에서 24개 카드를 렌더링하는데, 메모리 최적화가 부족할 수 있음.

#### **현재 설정**
[components/tabs/TimerTab.tsx:400-415](../components/tabs/TimerTab.tsx#L400-L415)

```typescript
<FlatList
  data={hourlyData}
  maxToRenderPerBatch={3}  // ✅ 설정됨
  windowSize={7}           // ✅ 설정됨
  removeClippedSubviews={Platform.OS !== 'web'}  // ✅ Android에서 활성화
  initialNumToRender={5}   // ❓ 누락 가능
  updateCellsBatchingPeriod={100}  // ❓ 누락 가능
/>
```

**문제점**:
- `initialNumToRender` 미설정 (기본값 10)
- `updateCellsBatchingPeriod` 미설정
- `getItemLayout` 미사용 (성능 개선 가능)

---

### **3. 애니메이션 메모리 누수** 🟡

#### **원인**
Animated API 사용 컴포넌트에서 애니메이션이 정리되지 않음.

#### **의심 컴포넌트**
- [components/OptimizedImage.tsx](../components/OptimizedImage.tsx) - 페이드 애니메이션
- [components/SparkleAnimation.tsx](../components/SparkleAnimation.tsx)
- [components/TarotCardAnimations.tsx](../components/TarotCardAnimations.tsx)
- [components/FloatingParticles.tsx](../components/FloatingParticles.tsx)

```typescript
// OptimizedImage.tsx 예시
useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 100,
    useNativeDriver: true,
  }).start();

  // ❌ cleanup 없음! 애니메이션이 계속 메모리에 남음
}, []);
```

**문제점**:
- 애니메이션 객체가 메모리에서 정리되지 않음
- 24개 카드 × 여러 애니메이션 = 메모리 누적

---

### **4. AdMob 광고 메모리 관리** 🟢

#### **원인**
전면광고(Interstitial)가 로드/표시 후 정리되지 않음.

```typescript
// utils/adManager.ts
static async showInterstitial(placement: string): Promise<AdShowResult> {
  const interstitial = InterstitialAd.createForAdRequest(adUnitId);
  await interstitial.load();
  await interstitial.show();

  // ❌ 광고 객체 정리 필요
  // interstitial.removeAllListeners();
}
```

**문제점**:
- 매 시간 광고 표시 (최대 10회/일)
- 광고 객체가 메모리에 남을 가능성

---

### **5. AsyncStorage 과도한 읽기/쓰기** 🟢

#### **원인**
AsyncStorage I/O가 너무 빈번하게 발생.

```typescript
// 매번 저장되는 데이터
- 24시간 카드 데이터 (hourlyCards)
- 카드 메모 (cardMemos)
- 프리미엄 상태 (premiumStatus)
- 알림 설정 (notificationSettings)
- 이미지 캐시 레지스트리 (cacheRegistry)
```

**문제점**:
- 1분마다 타이머 업데이트
- 자정 리셋 시 대량 I/O
- Android에서 I/O 병목 가능성

---

## 🛠️ **해결 방안 (우선순위별)**

### **🔴 Priority 1: 메모리 누수 수정** (즉시)

#### **1-A. 애니메이션 클린업 추가**

OptimizedImage.tsx 수정:
```typescript
useEffect(() => {
  const animation = Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 100,
    useNativeDriver: true,
  });

  animation.start();

  // ✅ cleanup 추가
  return () => {
    animation.stop();
    fadeAnim.setValue(0);
  };
}, []);
```

#### **1-B. 이미지 캐시 크기 제한**

imageCache.ts 수정:
```typescript
private MAX_CACHE_SIZE = 100; // 최대 100개 이미지

async preloadImage(source: any): Promise<boolean> {
  // 캐시 크기 제한
  if (this.cacheRegistry.size >= this.MAX_CACHE_SIZE) {
    // 가장 오래된 항목 제거 (LRU)
    const oldestKey = this.getOldestCacheKey();
    this.cacheRegistry.delete(oldestKey);
  }

  // ... 기존 로직
}
```

#### **1-C. 알림 리스너 검증**

NotificationContext.tsx 검증:
```typescript
useEffect(() => {
  if (!Notifications) return;

  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    setNotification(notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('알림 클릭:', response);
  });

  // ✅ 모든 리스너 정리
  return () => {
    receivedListener.remove();
    responseListener.remove();
  };
}, []); // deps 확인 필요
```

---

### **🟡 Priority 2: FlatList 최적화** (단기)

TimerTab.tsx 수정:
```typescript
<FlatList
  data={hourlyData}
  maxToRenderPerBatch={3}
  windowSize={5}  // 7 → 5로 축소
  removeClippedSubviews={Platform.OS !== 'web'}
  initialNumToRender={5}  // ✅ 추가
  updateCellsBatchingPeriod={100}  // ✅ 추가
  getItemLayout={(data, index) => ({  // ✅ 추가 (성능 향상)
    length: CARD_HEIGHT,
    offset: CARD_HEIGHT * index,
    index,
  })}
/>
```

---

### **🟢 Priority 3: 광고 메모리 관리** (중기)

adManager.ts 수정:
```typescript
private static interstitialAd: InterstitialAd | null = null;

static async showInterstitial(placement: string): Promise<AdShowResult> {
  // 기존 광고 정리
  if (this.interstitialAd) {
    this.interstitialAd.removeAllListeners();
    this.interstitialAd = null;
  }

  this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId);

  // 광고 표시 후 정리
  this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    this.interstitialAd?.removeAllListeners();
    this.interstitialAd = null;
  });

  await this.interstitialAd.load();
  await this.interstitialAd.show();
}
```

---

## 🧪 **테스트 방법**

### **1. 메모리 모니터링 테스트**

```typescript
// App.tsx에 메모리 로깅 추가 (개발 모드)
if (__DEV__) {
  setInterval(() => {
    if (global.performance && global.performance.memory) {
      const memory = global.performance.memory;
      console.log('📊 메모리 사용량:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  }, 30000); // 30초마다
}
```

### **2. 장시간 실행 테스트**

**테스트 시나리오**:
1. 앱 실행
2. 타이머 탭에서 대기 (30분)
3. 다른 탭 전환 (10회)
4. 카드 스크롤 (50회)
5. 메모리 로그 확인

**기대 결과**:
- 메모리 사용량 < 200MB 유지
- 30분 후에도 충돌 없음
- 스크롤 성능 유지 (60fps)

### **3. 광고 반복 테스트**

**테스트 시나리오**:
1. 전면광고 10회 연속 표시
2. 각 광고 후 메모리 로그 확인
3. 충돌 여부 확인

**기대 결과**:
- 광고 10회 후에도 정상 동작
- 메모리 증가 < 50MB

---

## 📊 **우선순위 매트릭스**

| 이슈 | 심각도 | 빈도 | 수정 난이도 | 우선순위 |
|------|--------|------|-------------|---------|
| 애니메이션 메모리 누수 | 높음 | 높음 | 낮음 | 🔴 P0 |
| 이미지 캐시 무한 증가 | 높음 | 중간 | 중간 | 🔴 P0 |
| 알림 리스너 누적 | 중간 | 중간 | 낮음 | 🟡 P1 |
| FlatList 최적화 부족 | 중간 | 높음 | 낮음 | 🟡 P1 |
| 광고 메모리 관리 | 낮음 | 낮음 | 중간 | 🟢 P2 |

---

## 🎯 **긴급 액션 플랜**

### **즉시 (오늘)**
1. ✅ 애니메이션 cleanup 추가 (OptimizedImage.tsx)
2. ✅ 이미지 캐시 크기 제한 추가 (imageCache.ts)
3. ✅ 알림 리스너 검증 (NotificationContext.tsx)
4. ✅ FlatList 최적화 (TimerTab.tsx)

### **단기 (1-2일)**
1. 메모리 모니터링 시스템 추가
2. 장시간 테스트 (30분+)
3. Android Build 41 준비
4. 내부 테스트 트랙 배포

### **중기 (1주)**
1. 광고 메모리 관리 개선
2. AsyncStorage 최적화
3. 프로덕션 배포
4. 사용자 피드백 수집

---

## 🔬 **iOS vs Android 차이점**

### **왜 iOS는 정상이고 Android는 충돌하나?**

| 항목 | iOS | Android | 영향 |
|------|-----|---------|------|
| **메모리 관리** | ARC (자동 참조 카운팅) | GC (가비지 컬렉션) | Android가 더 엄격 |
| **메모리 제한** | 큼 (2-4GB) | 작음 (512MB-2GB) | 저사양 기기 충돌 |
| **Animated API** | 네이티브 최적화 우수 | 네이티브 브릿지 오버헤드 | Android 느림 |
| **FlatList** | UICollectionView (최적화) | RecyclerView (설정 필요) | Android 수동 최적화 |
| **광고 SDK** | 안정적 | 메모리 많이 사용 | Android 부담 |

**결론**: Android는 메모리 관리에 더 민감하므로, 같은 코드라도 메모리 누수 시 충돌 가능성이 높음.

---

## 📝 **로그 수집 가이드**

사용자에게 다음 정보 요청:

### **1. 충돌 시점 정보**
- 앱 실행 후 몇 분만에 충돌?
- 특정 탭에서 충돌? (타이머/스프레드/저널/설정)
- 특정 동작 후 충돌? (스크롤/광고/카드 뽑기)

### **2. 디바이스 정보**
```bash
adb shell getprop ro.build.version.release  # Android 버전
adb shell getprop ro.product.model          # 기기 모델
adb shell dumpsys meminfo com.threebooks.tarottimer  # 메모리 사용량
```

### **3. 크래시 로그**
```bash
adb logcat -d > crash.log  # 충돌 직후 실행
```

---

## ✅ **예상 효과**

### **수정 후 기대 효과**
- ✅ 메모리 사용량: 200MB → 150MB (25% 감소)
- ✅ 장시간 실행: 30분+ 충돌 없음
- ✅ 저사양 기기: 512MB RAM 디바이스도 정상 동작
- ✅ 사용자 만족도: 충돌 이슈 해결로 별점 상승

---

**마지막 업데이트**: 2025-10-21
**작성자**: Claude Code AI Assistant
**상태**: 🔴 긴급 수정 필요
**다음 단계**: 즉시 수정 적용 및 테스트
