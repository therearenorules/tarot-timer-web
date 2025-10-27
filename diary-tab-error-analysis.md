# 🔍 다이어리 탭 오류 원인 분석 보고서

## 📋 문제 요약
- **증상**: Build 100 프로덕션 빌드에서 다이어리 탭 진입 시 오류 화면 발생
- **환경**: Expo Go (개발)에서는 정상 작동, 프로덕션 빌드에서만 오류 발생

## 🔎 근본 원인 분석

### 1️⃣ **AsyncStorage.getAllKeys() 타이밍 문제**

**위치**: `utils/localStorage.ts:150`
```typescript
private static async getCachedKeys(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys(); // ❌ 프로덕션에서 실패 가능
    this.keysCache = keys;
    return keys;
  } catch (error) {
    console.error('❌ AsyncStorage.getAllKeys() 실패:', error);
    return this.keysCache || []; // 빈 배열 반환
  }
}
```

**문제점**:
- 프로덕션 빌드에서 AsyncStorage가 완전히 초기화되기 전에 `getAllKeys()` 호출
- 오류 발생 시 빈 배열 반환 → 데이터 로드 실패
- 캐시가 없는 첫 실행에서는 무조건 실패

### 2️⃣ **checkUsageLimit() 연쇄 실패**

**위치**: `utils/localStorage.ts:536`
```typescript
static async checkUsageLimit(type: 'daily' | 'spread' | 'journal_entries') {
  try {
    const allKeys = await this.getCachedKeys(); // getCachedKeys() 실패 시
    const dailyTarotKeys = allKeys.filter(key => key.startsWith('daily_tarot_'));
    actualDailyCount = dailyTarotKeys.length; // 0으로 계산됨
  } catch (error) {
    console.error('DailyTarot 카운트 실패:', error);
  }
}
```

**문제점**:
- getCachedKeys() 실패 → 빈 배열 반환
- dailyTarotKeys.length = 0 (실제로는 데이터가 있어도)
- 사용자에게 "저장된 데이터 없음" 표시

### 3️⃣ **TarotDaily 컴포넌트 초기화 실패**

**위치**: `components/TarotDaily.tsx:341-342`
```typescript
const updateTotalCounts = useCallback(async () => {
  try {
    const dailyLimit = await LocalStorageManager.checkUsageLimit('daily'); // 실패
    const spreadLimit = await LocalStorageManager.checkUsageLimit('spread'); // 실패
    
    setTotalDailyCount(dailyLimit.currentCount); // 0으로 설정
    setTotalSpreadCount(spreadLimit.currentCount); // 0으로 설정
  } catch (error) {
    console.error('❌ 전체 기록 개수 업데이트 실패:', error);
    // 오류 발생 시 0으로 설정 → 빈 화면 표시
  }
}, []);
```

## 🎯 핵심 문제

**프로덕션 빌드 환경**:
1. 앱 시작 → AsyncStorage 초기화 시작 (비동기)
2. 다이어리 탭 진입 → useEffect 실행
3. updateTotalCounts() 호출 → LocalStorageManager.checkUsageLimit() 호출
4. getCachedKeys() 호출 → **AsyncStorage.getAllKeys() 타이밍 오류**
5. 빈 배열 반환 → 카운트 0 → 오류 화면 표시

**왜 Expo Go에서는 문제없나?**
- Expo Go는 Metro dev server 사용 → 핫 리로드 지원
- AsyncStorage가 이미 초기화된 상태에서 탭 전환
- 프로덕션 빌드는 정적 번들 → 앱 시작 시 모든 모듈 동시 로드

## ✅ 해결책

### 방법 1: **AsyncStorage 초기화 대기 (권장)**

`utils/localStorage.ts`에 초기화 가드 추가:

```typescript
private static isInitialized: boolean = false;
private static initPromise: Promise<void> | null = null;

private static async ensureInitialized(): Promise<void> {
  if (this.isInitialized) return;
  
  if (this.initPromise) {
    return this.initPromise;
  }
  
  this.initPromise = (async () => {
    try {
      // AsyncStorage 초기화 테스트
      await AsyncStorage.getItem('__init_test__');
      this.isInitialized = true;
      console.log('✅ AsyncStorage 초기화 완료');
    } catch (error) {
      console.error('❌ AsyncStorage 초기화 실패:', error);
      throw error;
    }
  })();
  
  return this.initPromise;
}

private static async getCachedKeys(): Promise<string[]> {
  // 초기화 대기
  await this.ensureInitialized();
  
  const now = Date.now();
  if (this.keysCache && (now - this.keysCacheTimestamp < this.CACHE_DURATION)) {
    return this.keysCache;
  }
  
  try {
    const keys = await AsyncStorage.getAllKeys();
    this.keysCache = keys;
    this.keysCacheTimestamp = now;
    return keys;
  } catch (error) {
    console.error('❌ AsyncStorage.getAllKeys() 실패:', error);
    return this.keysCache || [];
  }
}
```

### 방법 2: **Retry 로직 추가**

```typescript
private static async getAllKeysWithRetry(maxRetries = 3, delay = 500): Promise<string[]> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.warn(`AsyncStorage.getAllKeys() 시도 ${i + 1}/${maxRetries} 실패:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('AsyncStorage.getAllKeys() 최대 재시도 횟수 초과');
}
```

### 방법 3: **TarotDaily 컴포넌트에서 재시도**

```typescript
const updateTotalCounts = useCallback(async (retryCount = 0) => {
  try {
    const dailyLimit = await LocalStorageManager.checkUsageLimit('daily');
    const spreadLimit = await LocalStorageManager.checkUsageLimit('spread');
    
    setTotalDailyCount(dailyLimit.currentCount);
    setTotalSpreadCount(spreadLimit.currentCount);
  } catch (error) {
    console.error(`❌ 전체 기록 개수 업데이트 실패 (시도 ${retryCount + 1}/3):`, error);
    
    if (retryCount < 2) {
      // 500ms 대기 후 재시도
      setTimeout(() => updateTotalCounts(retryCount + 1), 500);
    } else {
      // 최종 실패 시 기본값 설정
      setTotalDailyCount(0);
      setTotalSpreadCount(0);
    }
  }
}, []);
```

## 🚀 권장 수정 순서

1. ✅ **localStorage.ts - ensureInitialized() 추가**
2. ✅ **getCachedKeys()에 초기화 대기 로직 추가**
3. ✅ **TarotDaily.tsx - 오류 처리 개선 (fallback UI)**
4. 🧪 **로컬 테스트 (Expo Go + 시뮬레이터)**
5. 🏗️ **Build 101 생성 및 TestFlight 배포**
6. ✅ **실제 기기에서 검증**

## 📊 예상 결과

수정 후:
- AsyncStorage 초기화 대기 → getAllKeys() 안정적 호출
- 데이터 로드 성공 → 정상적인 다이어리 탭 표시
- 프로덕션 빌드에서도 Expo Go와 동일하게 작동

