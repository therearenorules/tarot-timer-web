# 🔴 TestFlight 크래시 원인 분석 보고서

## 📊 Context 초기화 순서

```typescript
<ErrorBoundary>
  <SafeAreaProvider>
    <AuthProvider>           // 1️⃣ Supabase 의존 (⚠️ 크래시 위험)
      <TarotProvider>        // 2️⃣
        <NotificationProvider> // 3️⃣
          <PremiumProvider>  // 4️⃣ IAP/AdMob 의존 (⚠️ 크래시 위험)
            <App />
          </PremiumProvider>
        </NotificationProvider>
      </TarotProvider>
    </AuthProvider>
  </SafeAreaProvider>
</ErrorBoundary>
```

## 🔴 크래시 원인 #1: AuthContext (Supabase)

### 문제 코드
[contexts/AuthContext.tsx:132](contexts/AuthContext.tsx:132)
```typescript
if (!isSupabaseAvailable()) {
  console.error('🔴 CRITICAL: Supabase 환경변수가 설정되지 않았습니다!');
  // ✅ 이미 수정됨 (Build 56)
}
```

### 상태
- ✅ **해결 완료** (Build 56)
- Fallback 로직 추가됨
- 오프라인 모드 지원

---

## 🔴 크래시 원인 #2: PremiumContext (IAP 초기화)

### 위험 지점 1: IAPManager.initialize()
[contexts/PremiumContext.tsx:122](contexts/PremiumContext.tsx:122)
```typescript
const initializePremiumContext = async () => {
  try {
    // ...
    await IAPManager.initialize(); // ⚠️ 크래시 가능 지점
    // ...
  } catch (error) {
    console.error('❌ PremiumContext 초기화 오류:', error);
    setLastError(error instanceof Error ? error.message : '초기화 오류');
  } finally {
    setIsLoading(false); // ✅ finally로 보호됨
  }
};
```

### 위험 지점 2: LocalStorageManager
[contexts/PremiumContext.tsx:119](contexts/PremiumContext.tsx:119)
```typescript
const trialStatus = await LocalStorageManager.checkTrialStatus();
// ⚠️ LocalStorageManager가 없거나 오류 발생 시?
```

### 위험 지점 3: IAPManager 내부 초기화
[utils/iapManager.ts:83](utils/iapManager.ts:83)
```typescript
const isReady = await RNIap.initConnection();
if (!isReady) {
  console.log('⚠️ IAP 연결 초기화 실패. 시뮬레이션 모드로 전환합니다.');
  this.initialized = true;
  return true; // ✅ 실패해도 true 반환
}
```

**분석**: IAP 초기화는 이미 방어 코드가 있음 ✅

---

## 🔴 크래시 원인 #3: PremiumContext AppState 리스너

### 위험 지점: AppState 이벤트 핸들러
[contexts/PremiumContext.tsx:71-108](contexts/PremiumContext.tsx:71-108)
```typescript
useEffect(() => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return; // ✅ 웹 환경 체크
  }

  let subscription: any = null;
  let isMounted = true; // ✅ 마운트 상태 추적

  try {
    const { AppState } = require('react-native');

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && isMounted) {
        // ⚠️ refreshStatus() 호출 - 크래시 가능 지점
        refreshStatus().catch((error) => {
          if (isMounted) {
            console.warn('⚠️ 포어그라운드 복귀 시 구독 상태 갱신 실패:', error);
          }
        });
      }
    };

    subscription = AppState.addEventListener('change', handleAppStateChange);
  } catch (error) {
    console.warn('⚠️ AppState 리스너 설정 실패:', error);
  }

  return () => {
    isMounted = false; // ✅ cleanup
    if (subscription?.remove) {
      subscription.remove();
    }
  };
}, []);
```

**분석**: 이미 방어 코드가 있음 ✅

---

## 🔴 크래시 원인 #4: 광고 시스템 (AdManager)

### 위험 지점 1: 네이티브 모듈 로드
[utils/adManager.ts:82-95](utils/adManager.ts:82-95)
```typescript
try {
  const adModule = require('react-native-google-mobile-ads');
  mobileAds = adModule.default;
  InterstitialAd = adModule.InterstitialAd;
  RewardedAd = adModule.RewardedAd;
  AdEventType = adModule.AdEventType;
  TestIds = adModule.TestIds;

  console.log('✅ react-native-google-mobile-ads 네이티브 모듈 로드 성공');
  return true;
} catch (error) {
  console.warn('⚠️ react-native-google-mobile-ads 로드 실패 (시뮬레이션 모드):', error);
  return false; // ✅ 실패해도 계속 진행
}
```

**분석**: 이미 방어 코드가 있음 ✅

### 위험 지점 2: AdManager 초기화
[App.tsx:17-24](App.tsx:17-24)
```typescript
let BannerAd: any = null;
if (Platform.OS !== 'web') {
  try {
    BannerAd = require('./components/ads/BannerAd').default;
  } catch (error) {
    console.warn('⚠️ BannerAd 로드 실패:', error);
  }
}
```

**분석**: 이미 방어 코드가 있음 ✅

---

## 🎯 **실제 크래시 원인 추정**

### 최우선 의심 지점

#### 1. **LocalStorageManager 누락** ⚠️⚠️⚠️
```typescript
// contexts/PremiumContext.tsx:119
const trialStatus = await LocalStorageManager.checkTrialStatus();
```

**의심 이유**:
- LocalStorageManager 파일이 존재하는지 확인 필요
- checkTrialStatus() 함수가 올바르게 구현되었는지 확인 필요
- AsyncStorage 권한 문제 가능성

#### 2. **ReceiptValidator 누락** ⚠️⚠️
```typescript
// utils/iapManager.ts:23
import ReceiptValidator from './receiptValidator';
```

**의심 이유**:
- receiptValidator 파일이 존재하는지 확인 필요
- import 경로 오류 가능성

#### 3. **환경변수 문제** ⚠️
```typescript
// Supabase 환경변수 (이미 수정됨)
// AdMob App ID 환경변수
```

**의심 이유**:
- app.json에 AdMob ID가 설정되었지만 빌드 시 제대로 전달되는지 확인 필요

---

## 🔍 **검증 필요 항목**

### 1. 파일 존재 여부 확인
- [ ] `utils/localStorage.ts` (LocalStorageManager)
- [ ] `utils/receiptValidator.ts` (ReceiptValidator)
- [ ] `hooks/useSafeState.ts`

### 2. Import 경로 확인
```bash
# contexts/PremiumContext.tsx
import LocalStorageManager from '../utils/localStorage';
import ReceiptValidator from '../utils/receiptValidator';

# contexts/AuthContext.tsx
import { isSupabaseAvailable } from '../lib/supabase';
```

### 3. 환경변수 확인
```json
// app.json
{
  "expo": {
    "extra": {
      "supabaseUrl": "${SUPABASE_URL}",
      "supabaseAnonKey": "${SUPABASE_ANON_KEY}"
    },
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-4284542208210945~6525956491"
      }
    },
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-4284542208210945~5287567450"
      }
    }
  }
}
```

---

## 🛡️ **긴급 방어 코드 추가 필요**

### 1. PremiumContext 안전성 강화
```typescript
const initializePremiumContext = async () => {
  try {
    setIsLoading(true);
    setLastError(null);

    // ✅ CRITICAL FIX: LocalStorageManager 안전 체크
    let trialStatus = defaultPremiumStatus;
    try {
      trialStatus = await LocalStorageManager.checkTrialStatus();
    } catch (error) {
      console.error('❌ LocalStorageManager 오류:', error);
      // 계속 진행 (기본값 사용)
    }

    // ✅ CRITICAL FIX: IAPManager 안전 체크
    let iapStatus = defaultPremiumStatus;
    try {
      await IAPManager.initialize();
      iapStatus = await IAPManager.getCurrentSubscriptionStatus();
    } catch (error) {
      console.error('❌ IAPManager 오류:', error);
      // 계속 진행 (기본값 사용)
    }

    // ... 나머지 로직
  } catch (error) {
    console.error('❌ PremiumContext 초기화 오류:', error);
    setLastError(error instanceof Error ? error.message : '초기화 오류');
    // ✅ CRITICAL FIX: 오류가 발생해도 앱은 계속 실행
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📋 **다음 단계**

1. **파일 존재 여부 확인** (최우선)
   ```bash
   ls utils/localStorage.ts
   ls utils/receiptValidator.ts
   ls hooks/useSafeState.ts
   ```

2. **PremiumContext 방어 코드 추가** (긴급)
   - LocalStorageManager try-catch
   - IAPManager try-catch

3. **로컬 테스트**
   ```bash
   npm start
   # 콘솔에서 오류 확인
   ```

4. **긴급 빌드** (Build 57)
   - 방어 코드 추가 후 즉시 빌드

---

**작성일**: 2025-10-23
**분석자**: Claude Code
**심각도**: 🔴 CRITICAL
**예상 원인**: LocalStorageManager 또는 ReceiptValidator import 오류
