# 구독 상품 및 배너 광고 시스템 검증 보고서

**검증 날짜**: 2025-10-21
**검증 대상**: 타로 타이머 웹앱 v1.0.4 (iOS Build 37, Android Build 40)
**검증자**: Claude AI Code Reviewer

---

## 목차
1. [구독 상품 시스템 분석](#1-구독-상품-시스템-분석)
2. [배너 광고 시스템 분석](#2-배너-광고-시스템-분석)
3. [통합 검증](#3-통합-검증)
4. [최종 평가](#4-최종-평가)
5. [권장사항](#5-권장사항)

---

## 1. 구독 상품 시스템 분석

### 1.1 RevenueCat 연동 상태

**현재 상태**: ❌ **RevenueCat 미사용**

프로젝트는 `react-native-iap`를 직접 사용하고 있으며, RevenueCat은 연동되어 있지 않습니다.

**관련 파일**:
- `/utils/iapManager.ts` (lines 8-22)

```typescript
// 웹 환경에서는 react-native-iap을 조건부로 import
let RNIap: any = null;
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

if (isMobile) {
  try {
    RNIap = require('react-native-iap');
    console.log('✅ react-native-iap 모듈 로드 성공');
  } catch (error) {
    console.warn('⚠️ react-native-iap not available:', error);
  }
}
```

**SDK 버전**: `react-native-iap` (버전 정보 미확인)

**초기화 로직**: ✅ 정상
- 웹/모바일 환경 분리 처리 완료
- 시뮬레이션 모드 지원 (웹 환경)
- 안전한 fallback 메커니즘 구현

---

### 1.2 구독 상품 설정

#### iOS 상품 ID
```typescript
ios: 'tarot_timer_monthly',
ios: 'tarot_timer_yearly',
```

**상태**: ✅ **설정 완료**

#### Android 상품 ID
```typescript
android: 'tarot_timer_monthly',
android: 'tarot_timer_yearly',
```

**상태**: ✅ **설정 완료**

#### 무료 체험 기간
- **기간**: 7일 무료 체험
- **구현 위치**: `/utils/localStorage.ts` - `checkTrialStatus()` 메서드
- **로직**: 설치 날짜 기반 자동 계산

**상태**: ✅ **정상 구현**

#### 가격 정보
- **월간 구독**: ₩6,600 (시뮬레이션 데이터)
- **연간 구독**: ₩46,000 (42% 할인, 시뮬레이션 데이터)

**실제 가격은 App Store Connect / Google Play Console에서 설정된 값이 적용됩니다.**

---

### 1.3 구독 상태 관리

#### 상태 확인 로직

**관련 파일**: `/contexts/PremiumContext.tsx`

✅ **핵심 기능 구현 완료**:

1. **초기화 시 상태 확인** (lines 92-125)
   - 7일 무료 체험 상태 확인
   - IAP 시스템 초기화
   - 유료 구독 우선순위 처리

2. **프리미엄 상태 판단 로직** (lines 309-322)
   ```typescript
   const isPremium = premiumStatus?.is_premium || false;

   const isSubscriptionActive = (): boolean => {
     if (!premiumStatus?.is_premium) return false;
     if (!premiumStatus?.expiry_date) return false;

     const expiryDate = new Date(premiumStatus.expiry_date);
     return new Date() < expiryDate;
   };
   ```

3. **만료일 계산** (lines 324-338)
   ```typescript
   const daysUntilExpiry = (): number | null => {
     if (!premiumStatus?.expiry_date) return null;

     const expiryDate = new Date(premiumStatus.expiry_date);
     const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

     return diffDays > 0 ? diffDays : 0;
   };
   ```

#### 복원 기능

**관련 파일**: `/utils/iapManager.ts` (lines 246-279)

✅ **구현 완료**:
- `restorePurchases()` 메서드 구현
- 영수증 검증 포함
- 플랫폼별 처리 (iOS/Android/Web)

#### 취소/만료 처리

**관련 파일**: `/utils/iapManager.ts` (lines 415-531)

✅ **고급 기능 구현 완료**:

1. **자동 갱신 처리** (lines 415-466)
   - 만료일 7일 전부터 갱신 확인
   - 만료 시 자동 상태 업데이트
   - 주기적 모니터링 (24시간마다)

2. **갱신 실패 처리** (lines 536-559)
   - 7일 유예 기간 제공
   - 우아한 degradation

3. **프리미엄 상태 비활성화** (lines 502-531)
   - 안전한 상태 초기화
   - 이벤트 발생으로 UI 동기화

---

### 1.4 오류 처리

✅ **포괄적인 오류 처리 구현**

#### 1. 네트워크 오류 처리
**관련 파일**: `/utils/iapManager.ts` (lines 596-621)

```typescript
static async retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T>
```

- 지수 백오프 재시도 (최대 3회)
- 네트워크 타임아웃 처리

#### 2. 사용자 취소 처리
```typescript
if (error.code === 'E_USER_CANCELLED') {
  return {
    success: false,
    error: '사용자가 구매를 취소했습니다.'
  };
}
```

#### 3. 중복 결제 방지
**관련 파일**: `/utils/iapManager.ts` (lines 626-642)

```typescript
private static activePurchases = new Set<string>();

static async purchaseWithDuplicateProtection(productId: string): Promise<PurchaseResult> {
  if (this.activePurchases.has(productId)) {
    return {
      success: false,
      error: '이미 해당 상품의 결제가 진행 중입니다.'
    };
  }
  // ...
}
```

#### 4. 결제 롤백 처리
**관련 파일**: `/utils/iapManager.ts` (lines 647-666)

```typescript
static async rollbackFailedPurchase(productId: string, transactionId?: string): Promise<void>
```

#### 5. 환불 처리
**관련 파일**: `/utils/iapManager.ts` (lines 671-695)

```typescript
static async handleRefund(transactionId: string): Promise<void>
```

---

### 1.5 플랫폼별 차이점

#### iOS
- **구독 상품 ID**: `tarot_timer_monthly`, `tarot_timer_yearly`
- **결제 SDK**: react-native-iap
- **영수증 검증**: App Store 영수증 검증 (구현 중)
- **복원 기능**: ✅ 구현 완료

#### Android
- **구독 상품 ID**: `tarot_timer_monthly`, `tarot_timer_yearly`
- **결제 SDK**: react-native-iap
- **영수증 검증**: Google Play 영수증 검증 (구현 중)
- **복원 기능**: ✅ 구현 완료
- **offerToken**: 기본 offer 토큰 사용

#### Web
- **시뮬레이션 모드**: ✅ 완전 지원
- **목업 데이터**: 월간/연간 상품 시뮬레이션
- **테스트 환경**: 웹 환경에서 전체 플로우 테스트 가능

---

### 1.6 발견된 문제점

#### ⚠️ 주의 필요

1. **영수증 검증 미완성**
   - **위치**: `/utils/receiptValidator.ts`
   - **상태**: 기본 구조는 구현되어 있으나, 실제 App Store/Google Play 서버 검증은 미구현
   - **영향**: 부정 사용 가능성 존재
   - **우선순위**: 🔴 높음

2. **App Store Shared Secret 하드코딩**
   - **위치**: `/utils/receiptValidator.ts` (line 49)
   ```typescript
   private static readonly APP_STORE_SHARED_SECRET =
     process.env.EXPO_PUBLIC_APP_STORE_SHARED_SECRET || 'your-shared-secret';
   ```
   - **문제**: 환경 변수 미설정 시 더미 값 사용
   - **권장**: 실제 값 환경 변수로 설정 필요
   - **우선순위**: 🔴 높음

3. **실제 상품 가격 정보 누락**
   - **위치**: `/utils/iapManager.ts` (lines 119-139)
   - **상태**: 웹 시뮬레이션용 더미 가격만 존재
   - **해결**: App Store Connect / Google Play Console에서 설정된 값이 자동으로 로드됨
   - **우선순위**: 🟡 중간 (실제 배포 시 자동 해결)

---

## 2. 배너 광고 시스템 분석

### 2.1 AdMob 설정

#### iOS 배너 ID
- **테스트 ID**: `ca-app-pub-3940256099942544/2934735716`
- **프로덕션 ID**: `ca-app-pub-4284542208210945/1544899037`

**상태**: ✅ **설정 완료** (2025-10-17 생성)

#### Android 배너 ID
- **테스트 ID**: `ca-app-pub-3940256099942544/6300978111`
- **프로덕션 ID**: `ca-app-pub-4284542208210945/8535519650`

**상태**: ✅ **설정 완료** (2025-10-16 생성)

#### 테스트 모드 확인

**관련 파일**: `/utils/adConfig.ts` (lines 10-29)

```typescript
const isDevelopment = (() => {
  // 1. 명시적 프로덕션 환경 변수 확인 (최우선)
  if (Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_ENV === 'production') {
    return false;
  }

  // 2. EAS 빌드 프로필 확인
  if (Constants.executionEnvironment === 'standalone') {
    return false; // 스탠드얼론 빌드는 프로덕션
  }

  // 3. __DEV__ 플래그 (개발 환경에서만 true)
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return true;
  }

  // 4. 기본값: 프로덕션 (안전한 선택)
  return false;
})();
```

**상태**: ✅ **안전한 환경 감지 구현**

---

### 2.2 배너 광고 표시 로직

#### 프리미엄 체크

**관련 파일**: `/components/ads/BannerAd.tsx` (lines 45-53)

```typescript
const { isPremium, premiumStatus, isLoading: premiumLoading } = usePremium();

// ✅ 버그 수정: 로딩 중일 때는 광고 표시하지 않음 (무료 체험 확인 대기)
const shouldShowAd = !premiumLoading && !isPremium && !premiumStatus.ad_free;
```

**로직 검증**:
- ✅ **Race condition 방지**: `isLoading` 체크로 프리미엄 상태 확인 전 광고 표시 방지
- ✅ **이중 체크**: `isPremium` + `ad_free` 플래그로 이중 검증
- ✅ **무료 체험 중 광고 숨김**: 7일 무료 체험 기간 동안 광고 미표시

#### 표시 위치

**관련 파일**: `/components/ads/BannerAd.tsx` (lines 132-161)

```typescript
return (
  <View style={[styles.container, { paddingBottom: insets.bottom }]}>
    <RNBannerAd
      unitId={adUnitId}
      size={BannerAdSize.BANNER}
      // ...
    />
  </View>
);
```

**위치**: 화면 하단 (SafeArea 적용)

**크기**: 320x50 (표준 배너)

**상태**: ✅ **정상 구현**

---

### 2.3 사용 위치 분석

#### 1. TimerTab (메인 화면)
**관련 파일**: `/components/tabs/TimerTab.tsx`

**배너 광고 사용**: ❌ **미사용**

```typescript
// 검색 결과: BannerAd 컴포넌트 import 없음
// 전면 광고만 사용 (InterstitialAd)
```

**전면 광고**: ✅ 사용 (세션 완료 시)
```typescript
<InterstitialAd
  placement="session_complete"
  trigger="session_complete"
  // ...
/>
```

#### 2. JournalTab (저널 탭)
**관련 파일**: `/components/tabs/JournalTab.tsx`

**배너 광고 사용**: ❌ **미사용**

```typescript
const JournalTab: React.FC = () => {
  return <TarotDaily />;
};
```

`JournalTab`은 `TarotDaily` 컴포넌트를 렌더링하는 래퍼입니다.
`TarotDaily` 컴포넌트에서도 `BannerAd` import가 확인되지 않았습니다.

#### 3. SettingsTab (설정 탭)
**관련 파일**: `/components/tabs/SettingsTab.tsx`

**배너 광고 사용**: ❌ **미사용**

설정 탭에서는 배너 광고를 표시하지 않습니다.

---

### 2.4 오류 처리

**관련 파일**: `/components/ads/BannerAd.tsx` (lines 86-94)

```typescript
try {
  // AdManager 초기화 확인
  await AdManager.initialize();

  // 웹 환경에서는 시뮬레이션 모드
  if (Platform.OS === 'web') {
    setIsVisible(true);
    setIsLoaded(true);
    onAdLoaded?.();
    return;
  }

  // 배너 광고 표시 설정
  setIsVisible(true);
  console.log('📱 배너 광고 초기화 완료');

} catch (err) {
  const errorMessage = err instanceof Error ? err.message : '배너 광고 로드 실패';
  console.error('❌ 배너 광고 초기화 오류:', errorMessage);
  setError(errorMessage);
  onAdFailedToLoad?.(errorMessage);
}
```

**로드 실패 처리** (lines 146-152):
```typescript
onAdFailedToLoad={(loadError) => {
  const errorMsg = loadError?.message || '알 수 없는 오류';
  console.error('❌ 배너 광고 로드 실패:', errorMsg);
  setError(errorMsg);
  AdManager.trackAdEvent('banner_failed', placement, { error: errorMsg });
  onAdFailedToLoad?.(errorMsg);
}}
```

**상태**: ✅ **안전한 오류 처리**
- 광고 로드 실패 시 앱 크래시 방지
- 오류 로깅 및 추적
- 사용자 경험 보호 (광고 실패해도 앱 정상 동작)

---

### 2.5 발견된 문제점

#### 🔴 중요 문제

1. **iOS 배너 광고 비활성화 상태**
   - **위치**: `/components/ads/BannerAd.tsx` (lines 113-117)
   ```typescript
   // 🔴 긴급 수정: iOS에서 광고 비활성화 (Build 33)
   if (Platform.OS === 'ios') {
     console.log('🍎 iOS: 배너 광고 비활성화됨 (Build 33 긴급 수정)');
     return null;
   }
   ```
   - **영향**: iOS에서 배너 광고 전혀 표시되지 않음
   - **원인**: Build 33 긴급 수정으로 비활성화
   - **권장**: iOS 광고 활성화 검토 필요
   - **우선순위**: 🔴 높음

2. **배너 광고 미사용**
   - **현황**: 모든 탭에서 배너 광고 미사용
   - **영향**: 배너 광고 수익 발생하지 않음
   - **원인**: 의도적으로 배너 광고를 탭에 추가하지 않음
   - **권장**:
     - TimerTab 하단에 배너 광고 추가 검토
     - JournalTab(TarotDaily) 하단에 배너 광고 추가 검토
   - **우선순위**: 🟡 중간 (비즈니스 요구사항에 따라)

#### ⚠️ 주의 필요

3. **광고 새로고침 로직 없음**
   - **위치**: `/components/ads/BannerAd.tsx`
   - **현황**: 배너 광고 자동 새로고침 미구현
   - **영향**: 수익 최적화 기회 손실
   - **권장**: 60초마다 배너 새로고침 고려
   - **우선순위**: 🟢 낮음

---

### 2.6 플랫폼별 배너 광고 차이

#### iOS
- **상태**: ❌ **비활성화** (Build 33 이후)
- **배너 ID**: 설정 완료
- **영향**: 광고 수익 없음

#### Android
- **상태**: ✅ **활성화** (단, 탭에서 미사용)
- **배너 ID**: `ca-app-pub-4284542208210945/8535519650`
- **최적화**: 안전한 환경 감지 로직 구현
- **SafeArea**: Android SafeArea 지원 완료

#### Web
- **상태**: ✅ **시뮬레이션 모드**
- **표시**: 시뮬레이션 배너 (실제 광고 없음)
- **목적**: 개발 및 디자인 검증

---

## 3. 통합 검증

### 3.1 구독-광고 연동

**관련 파일**:
- `/contexts/PremiumContext.tsx`
- `/components/ads/BannerAd.tsx`

#### 연동 메커니즘

```typescript
// BannerAd.tsx
const { isPremium, premiumStatus, isLoading: premiumLoading } = usePremium();

// 프리미엄 사용자는 광고 표시하지 않음
const shouldShowAd = !premiumLoading && !isPremium && !premiumStatus.ad_free;
```

**상태**: ✅ **정상 연동**

#### 광고 매니저 프리미엄 체크

```typescript
// AdManager.ts (lines 186-207)
static setPremiumStatus(isPremium: boolean): void {
  this.isPremiumUser = isPremium;
  console.log(`💎 프리미엄 상태 변경: ${isPremium ? '활성화' : '비활성화'}`);
}

static shouldShowBanner(): boolean {
  if (this.isPremiumUser) {
    return false;
  }
  return true;
}
```

**상태**: ✅ **정상 구현**

---

### 3.2 시나리오별 동작 검증

#### 시나리오 1: 일반 사용자 (무료 버전)
- **프리미엄 상태**: `is_premium: false`
- **7일 체험**: 미사용 또는 만료
- **예상 동작**:
  - ✅ 배너 광고 표시 (단, iOS는 비활성화 상태)
  - ✅ 전면 광고 표시 (세션 완료 시)
  - ✅ 무제한 저장 제한 (최대 30개)

**검증 결과**: ✅ **정상** (단, 배너 광고 미사용 중)

#### 시나리오 2: 7일 무료 체험 중
- **프리미엄 상태**: `is_premium: true`, `subscription_type: 'trial'`
- **체험 기간**: 7일 이내
- **예상 동작**:
  - ✅ 배너 광고 숨김
  - ✅ 전면 광고 숨김
  - ✅ 무제한 저장 가능
  - ✅ 프리미엄 스프레드 사용 가능

**검증 결과**: ✅ **정상**

**검증 로직**:
```typescript
// PremiumContext.tsx (lines 106-115)
if (iapStatus.is_premium && iapStatus.subscription_type !== 'trial') {
  // 유료 구독자
  setPremiumStatus(iapStatus);
  console.log('✅ 유료 구독 활성화');
} else {
  // 무료 체험 또는 무료 사용자
  setPremiumStatus(trialStatus);
  console.log(trialStatus.is_premium ? '🎁 무료 체험 활성화' : '📱 무료 버전');
}
```

#### 시나리오 3: 프리미엄 구독자 (유료)
- **프리미엄 상태**: `is_premium: true`, `subscription_type: 'monthly' | 'yearly'`
- **구독 상태**: 활성 (만료일 미도래)
- **예상 동작**:
  - ✅ 배너 광고 완전 숨김
  - ✅ 전면 광고 완전 숨김
  - ✅ 무제한 저장 가능
  - ✅ 프리미엄 스프레드 사용 가능
  - ✅ 구독 관리 UI 표시

**검증 결과**: ✅ **정상**

**검증 로직**:
```typescript
// BannerAd.tsx
const shouldShowAd = !premiumLoading && !isPremium && !premiumStatus.ad_free;

// AdManager.ts
if (this.isPremiumUser) {
  console.log('💎 프리미엄 사용자: 전면광고 건너뛰기');
  return { success: true, revenue: 0 };
}
```

---

### 3.3 Race Condition 이슈

#### 문제점
초기 로딩 시 프리미엄 상태가 확인되기 전에 광고가 표시될 수 있는 Race Condition 이슈

#### 해결 방법
**관련 파일**: `/components/ads/BannerAd.tsx` (line 53)

```typescript
// ✅ 버그 수정: 로딩 중일 때는 광고 표시하지 않음 (무료 체험 확인 대기)
const shouldShowAd = !premiumLoading && !isPremium && !premiumStatus.ad_free;
```

**상태**: ✅ **해결됨**

`isLoading` 체크를 통해 프리미엄 상태 확인이 완료될 때까지 광고를 표시하지 않도록 구현

---

### 3.4 메모리 누수 가능성

#### 검증 대상
1. **이벤트 리스너 정리**
2. **타이머 정리**
3. **광고 인스턴스 정리**

#### 검증 결과

**1. PremiumContext 이벤트 리스너**: ✅ **정상**
```typescript
// PremiumContext.tsx (lines 64-66, 151-168)
useEffect(() => {
  initializePremiumContext();
  setupEventListeners();

  return () => {
    removeEventListeners();
  };
}, []);
```

**2. 주기적 갱신 체크**: ✅ **정상**
```typescript
// iapManager.ts (lines 582-588)
static stopPeriodicRenewalCheck(): void {
  if (this.renewalCheckInterval) {
    clearInterval(this.renewalCheckInterval);
    this.renewalCheckInterval = null;
    console.log('✅ 주기적 구독 갱신 모니터링이 중지되었습니다.');
  }
}
```

**3. AdManager 정리**: ✅ **정상**
```typescript
// adManager.ts (lines 552-561)
static dispose(): void {
  try {
    this.interstitialAd = null;
    this.rewardedAd = null;
    this.initialized = false;
    console.log('🧹 AdManager 정리 완료');
  } catch (error) {
    console.error('❌ AdManager 정리 오류:', error);
  }
}
```

**상태**: ✅ **메모리 누수 방지 구현 완료**

---

## 4. 최종 평가

### 4.1 구독 시스템

**평가**: ⚠️ **주의 필요**

**이유**:
- ✅ 기본 구조 및 로직은 우수하게 구현됨
- ✅ 7일 무료 체험 시스템 완벽 구현
- ✅ 자동 갱신 및 만료 처리 완벽 구현
- ✅ 중복 결제 방지, 롤백, 환불 처리 구현
- ⚠️ **영수증 검증 시스템 미완성** (보안 취약점)
- ⚠️ **App Store Shared Secret 환경 변수 미설정**
- ⚠️ **실제 서버 검증 미구현** (부정 사용 가능성)

**점수**: 75/100

---

### 4.2 배너 광고 시스템

**평가**: ⚠️ **주의 필요**

**이유**:
- ✅ AdMob 설정 완료 (iOS/Android)
- ✅ 프리미엄 상태 연동 완벽
- ✅ Race condition 방지 구현
- ✅ 오류 처리 우수
- ❌ **iOS 배너 광고 비활성화 상태**
- ❌ **모든 탭에서 배너 광고 미사용**
- 🟡 광고 새로고침 로직 없음

**점수**: 60/100

---

## 5. 권장사항

### 5.1 긴급 수정 필요 (🔴 높음)

#### 1. 영수증 검증 시스템 완성
**파일**: `/utils/receiptValidator.ts`

**현재 상태**: 기본 구조만 구현, 실제 서버 검증 미구현

**권장 작업**:
```typescript
// Apple App Store 검증 API 구현
async validateAppleReceipt(receiptData: string): Promise<ReceiptValidationResult> {
  const endpoint = isProduction
    ? 'https://buy.itunes.apple.com/verifyReceipt'
    : 'https://sandbox.itunes.apple.com/verifyReceipt';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': APP_STORE_SHARED_SECRET
    })
  });

  const result = await response.json();
  return this.parseAppleReceiptResponse(result);
}

// Google Play 검증 API 구현
async validateGoogleReceipt(receiptData: GooglePlayReceiptData): Promise<ReceiptValidationResult> {
  // Google Play Developer API 사용
  // ...
}
```

**우선순위**: 🔴 출시 전 필수

---

#### 2. App Store Shared Secret 환경 변수 설정

**현재 문제**:
```typescript
private static readonly APP_STORE_SHARED_SECRET =
  process.env.EXPO_PUBLIC_APP_STORE_SHARED_SECRET || 'your-shared-secret';
```

**권장 작업**:
1. App Store Connect에서 Shared Secret 생성
2. `.env` 파일에 추가:
   ```bash
   EXPO_PUBLIC_APP_STORE_SHARED_SECRET=실제_공유_비밀키
   ```
3. 환경 변수 미설정 시 에러 발생하도록 수정:
   ```typescript
   private static readonly APP_STORE_SHARED_SECRET = (() => {
     const secret = process.env.EXPO_PUBLIC_APP_STORE_SHARED_SECRET;
     if (!secret || secret === 'your-shared-secret') {
       throw new Error('App Store Shared Secret이 설정되지 않았습니다.');
     }
     return secret;
   })();
   ```

**우선순위**: 🔴 출시 전 필수

---

#### 3. iOS 배너 광고 활성화 검토

**현재 상태**: Build 33 긴급 수정으로 iOS 배너 광고 전면 비활성화

**권장 작업**:
1. iOS 광고 비활성화 원인 파악
2. 문제 해결 후 다음 코드 제거:
   ```typescript
   // 🔴 제거 필요
   if (Platform.OS === 'ios') {
     console.log('🍎 iOS: 배너 광고 비활성화됨 (Build 33 긴급 수정)');
     return null;
   }
   ```
3. iOS 배너 광고 테스트 및 검증

**우선순위**: 🔴 높음 (수익 영향)

---

### 5.2 개선 권장 (🟡 중간)

#### 4. 배너 광고 탭에 추가

**현재 상태**: 모든 탭에서 배너 광고 미사용

**권장 작업**:

**TimerTab 하단에 배너 추가**:
```typescript
// TimerTab.tsx
import BannerAd from '../ads/BannerAd';

return (
  <KeyboardAvoidingView style={styles.container}>
    <ScrollView>
      {/* 기존 컨텐츠 */}
    </ScrollView>

    {/* 배너 광고 추가 */}
    <BannerAd
      placement="main_screen"
      onAdLoaded={() => console.log('✅ TimerTab 배너 로드')}
      onAdFailedToLoad={(error) => console.log('❌ TimerTab 배너 실패:', error)}
    />
  </KeyboardAvoidingView>
);
```

**JournalTab(TarotDaily) 하단에 배너 추가**:
```typescript
// TarotDaily.tsx
import BannerAd from './ads/BannerAd';

return (
  <View style={styles.container}>
    <ScrollView>
      {/* 기존 컨텐츠 */}
    </ScrollView>

    {/* 배너 광고 추가 */}
    <BannerAd
      placement="journal_entry"
      onAdLoaded={() => console.log('✅ JournalTab 배너 로드')}
      onAdFailedToLoad={(error) => console.log('❌ JournalTab 배너 실패:', error)}
    />
  </View>
);
```

**예상 효과**:
- 배너 광고 노출 증가
- 광고 수익 발생

**우선순위**: 🟡 중간 (비즈니스 요구사항에 따라)

---

#### 5. 배너 광고 자동 새로고침

**현재 상태**: 배너 광고 새로고침 로직 없음

**권장 작업**:
```typescript
// BannerAd.tsx
useEffect(() => {
  if (!shouldShowAd) return;

  // 60초마다 광고 새로고침 (AdMob 권장)
  const refreshInterval = setInterval(() => {
    console.log('🔄 배너 광고 새로고침');
    // 광고 재로드 로직
  }, AD_CONFIG.intervals.banner_refresh); // 60000ms

  return () => clearInterval(refreshInterval);
}, [shouldShowAd]);
```

**예상 효과**:
- 광고 수익 최적화
- eCPM 향상

**우선순위**: 🟡 중간

---

### 5.3 최적화 제안 (🟢 낮음)

#### 6. 구독 상태 캐싱

**현재 상태**: 매번 검증 수행

**권장 작업**:
```typescript
// iapManager.ts
private static subscriptionCache: {
  status: PremiumStatus;
  timestamp: number;
} | null = null;

static async getCurrentSubscriptionStatus(): Promise<PremiumStatus> {
  // 5분 이내 캐시가 있으면 재사용
  if (this.subscriptionCache &&
      Date.now() - this.subscriptionCache.timestamp < 300000) {
    return this.subscriptionCache.status;
  }

  const currentStatus = await LocalStorageManager.getPremiumStatus();

  // 주기적 영수증 검증 수행
  if (currentStatus.is_premium) {
    await ReceiptValidator.periodicValidation();
    const updatedStatus = await LocalStorageManager.getPremiumStatus();

    this.subscriptionCache = {
      status: updatedStatus,
      timestamp: Date.now()
    };

    return updatedStatus;
  }

  return currentStatus;
}
```

**예상 효과**:
- 불필요한 네트워크 요청 감소
- 배터리 수명 개선
- 앱 반응 속도 향상

**우선순위**: 🟢 낮음

---

#### 7. 광고 A/B 테스트

**현재 상태**: A/B 테스트 설정만 존재 (비활성화)

**권장 작업**:
```typescript
// adConfig.ts
export const AB_TEST_CONFIG = {
  enabled: true, // ✅ 활성화
  variants: {
    banner_position: ['top', 'bottom'],
    interstitial_timing: ['immediate', 'delayed'],
    reward_amount: ['1_session', '2_sessions']
  }
};

// A/B 테스트 로직 구현
const selectedVariant = selectABTestVariant('banner_position');
```

**예상 효과**:
- 광고 수익 최적화
- 사용자 경험 개선
- 데이터 기반 의사결정

**우선순위**: 🟢 낮음

---

## 6. 종합 요약

### ✅ 정상 작동 항목 (18개)
1. ✅ 7일 무료 체험 시스템
2. ✅ 구독 상품 ID 설정 (iOS/Android)
3. ✅ 구독 상태 확인 로직
4. ✅ 구독 복원 기능
5. ✅ 자동 갱신 처리
6. ✅ 갱신 실패 유예 기간
7. ✅ 프리미엄 상태 비활성화
8. ✅ 네트워크 오류 재시도
9. ✅ 중복 결제 방지
10. ✅ 결제 롤백 처리
11. ✅ 환불 처리
12. ✅ AdMob 설정 (Android)
13. ✅ 프리미엄 연동 로직
14. ✅ Race condition 방지
15. ✅ 광고 오류 처리
16. ✅ 메모리 누수 방지
17. ✅ 안전한 환경 감지
18. ✅ 웹 시뮬레이션 모드

### ⚠️ 주의 필요 항목 (7개)
1. ⚠️ 영수증 검증 미완성 (🔴 높음)
2. ⚠️ App Store Shared Secret 미설정 (🔴 높음)
3. ⚠️ iOS 배너 광고 비활성화 (🔴 높음)
4. ⚠️ 배너 광고 미사용 (🟡 중간)
5. ⚠️ 광고 새로고침 로직 없음 (🟢 낮음)
6. ⚠️ 구독 상태 캐싱 없음 (🟢 낮음)
7. ⚠️ A/B 테스트 비활성화 (🟢 낮음)

### 최종 점수
- **구독 시스템**: 75/100 (⚠️ 주의 필요)
- **배너 광고 시스템**: 60/100 (⚠️ 주의 필요)
- **전체 평가**: 67.5/100 (⚠️ 출시 전 개선 필요)

---

**검증 완료일**: 2025-10-21
**다음 검증 권장일**: iOS 광고 활성화 및 영수증 검증 완성 후

---

**주요 권장 사항 요약**:
1. 🔴 **영수증 검증 시스템 완성** (출시 전 필수)
2. 🔴 **App Store Shared Secret 환경 변수 설정** (출시 전 필수)
3. 🔴 **iOS 배너 광고 활성화** (수익 영향)
4. 🟡 **배너 광고 탭에 추가** (수익 증대)
5. 🟡 **배너 광고 새로고침 구현** (수익 최적화)
6. 🟢 **구독 상태 캐싱** (성능 개선)
7. 🟢 **A/B 테스트 활성화** (데이터 기반 최적화)
