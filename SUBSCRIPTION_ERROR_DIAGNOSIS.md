# 구독 오류 진단 보고서

**작성일**: 2025-10-31
**앱 버전**: 1.1.1 (iOS: 107, Android: 102)
**보고 증상**: 구독 구매 실패 + 잘못된 복원 완료 메시지

---

## 🚨 발견된 문제

### 1. 구독 구매 실패
**증상**:
```
"구독 처리 중 오류가 발생했습니다. 다시 시도해주세요."
```

**스크린샷 분석**:
- 사용자가 연간 구독(₩46,000) 선택
- 구매 시도 후 즉시 오류 발생
- 실제 Apple/Google 결제 화면 표시 안 됨

### 2. 잘못된 복원 완료 메시지
**증상**:
```
"복원 완료"
"이전 구매가 성공적으로 복원되었습니다!"
```

**실제 상황**:
- 구매 내역이 전혀 없는 상태
- `restorePurchases()` 메서드가 항상 `true` 반환

---

## 🔍 근본 원인 분석

### A. IAP 초기화 문제

**문제점**: `react-native-iap` 모듈이 제대로 초기화되지 않음

**원인**:
1. **Expo 앱 환경**: Expo Go 또는 Expo 개발 빌드에서 실행 시 네이티브 모듈 부족
2. **빌드 타입**: TestFlight 빌드가 아닌 Expo 관리형 빌드로 업로드되었을 가능성
3. **네이티브 설정 누락**: `expo-build-properties` 또는 config plugin 설정 부족

**증거** (iapManager.ts:83-87):
```typescript
// ✅ CRITICAL FIX: RNIap 메서드 존재 확인
if (typeof RNIap.initConnection !== 'function') {
  console.log('⚠️ react-native-iap API 사용 불가. 시뮬레이션 모드로 전환합니다.');
  this.initialized = true;
  return true; // ❌ 오류 상황인데 성공으로 처리
}
```

### B. 시뮬레이션 모드 오작동

**문제점**: 웹 환경이 아닌데도 시뮬레이션 모드로 작동

**원인**:
- `Platform.OS === 'ios'`인데도 `RNIap` 모듈이 제대로 로드 안 됨
- 코드가 실패를 성공으로 처리하여 사용자에게 잘못된 메시지 표시

**증거** (iapManager.ts:207-215):
```typescript
// 웹 환경 또는 RNIap 모듈이 없는 경우 시뮬레이션
if (!isMobile || !RNIap) {
  console.log('🌐 시뮬레이션 모드: 구매 시뮬레이션');
  const result = await this.simulateWebPurchase(productId);
  if (result.success) {
    await this.processPurchaseSuccess(productId, 'web_simulation_' + Date.now());
  }
  return result; // ❌ 실제 iOS/Android에서도 시뮬레이션 실행
}
```

### C. 복원 로직 오류

**문제점**: 구매 내역이 없어도 "복원 완료" 메시지 표시

**원인**: `restorePurchases()` 메서드의 잘못된 반환 로직

**증거** (iapManager.ts:286-319):
```typescript
static async restorePurchases(): Promise<boolean> {
  try {
    if (!isMobile || !RNIap || typeof RNIap.getAvailablePurchases !== 'function') {
      console.log('🌐 시뮬레이션 모드: 구매 복원 시뮬레이션');
      return true; // ❌ 문제 1: 아무것도 복원 안 했는데 true 반환
    }

    const purchases = await RNIap.getAvailablePurchases();

    for (const purchase of purchases) {
      // ... 복원 로직
    }

    console.log('✅ 구매 복원 완료');
    return true; // ❌ 문제 2: purchases 배열이 비어있어도 true 반환
  }
}
```

### D. App Store Connect 설정 누락 가능성

**체크 필요 항목**:
1. ✅ 구독 상품 등록: `tarot_timer_monthly`, `tarot_timer_yearly`
2. ❓ 구독 상품 상태: "Ready to Submit" or "Approved"?
3. ❓ 앱 Capabilities: In-App Purchase 활성화 여부
4. ❓ Sandbox Tester: 테스트 계정 설정 여부
5. ❓ 번들 ID 일치: `com.tarottimer.app` 일치 여부

### E. 빌드 환경 문제

**의심 사항**:
1. **EAS Build 설정**: `eas.json`에 IAP 관련 플러그인 설정 누락
2. **네이티브 설정**: `app.json` plugins에 `react-native-iap` config plugin 없음
3. **Expo 버전**: Expo SDK 54 + react-native-iap@14.3.2 호환성 문제

**현재 설정**:
```json
// app.json - plugins 섹션
"plugins": [
  "expo-notifications",
  "react-native-google-mobile-ads",
  "expo-font"
  // ❌ react-native-iap config plugin 없음!
]
```

---

## 🛠️ 수정 방안

### 즉시 수정 (긴급)

#### 1. `restorePurchases()` 로직 수정
**목적**: 실제 복원된 항목 수를 반환하여 정확한 메시지 표시

```typescript
static async restorePurchases(): Promise<boolean> {
  try {
    if (!isMobile || !RNIap || typeof RNIap.getAvailablePurchases !== 'function') {
      console.log('🌐 시뮬레이션 모드: 구매 복원 불가');
      return false; // ✅ 수정: 시뮬레이션에서는 false 반환
    }

    const purchases = await RNIap.getAvailablePurchases();
    let restoredCount = 0;

    for (const purchase of purchases) {
      if (Object.values(SUBSCRIPTION_SKUS).includes(purchase.productId)) {
        await this.processPurchaseSuccess(purchase.productId, purchase.transactionId);
        restoredCount++;
      }
    }

    console.log(`✅ 구매 복원 완료: ${restoredCount}개`);
    return restoredCount > 0; // ✅ 수정: 실제 복원된 항목이 있을 때만 true
  }
}
```

#### 2. 초기화 실패 시 명확한 오류 메시지

```typescript
static async initialize(): Promise<boolean> {
  try {
    if (!isMobile || !RNIap || typeof RNIap.initConnection !== 'function') {
      throw new Error('IAP_NOT_AVAILABLE'); // ✅ 오류로 처리
    }
    // ... 초기화 로직
  } catch (error) {
    if (error.message === 'IAP_NOT_AVAILABLE') {
      console.error('❌ 앱 내 구매 기능을 사용할 수 없습니다. 앱을 업데이트해주세요.');
    }
    return false; // ✅ 명확한 실패 반환
  }
}
```

#### 3. UI 오류 메시지 개선

```typescript
// PremiumSubscription.tsx - handleRestorePurchases 수정
const handleRestorePurchases = async () => {
  try {
    setLoading(true);
    const restored = await IAPManager.restorePurchases();

    if (restored) {
      Alert.alert('복원 완료', '이전 구매가 성공적으로 복원되었습니다!');
      await initializeIAP();
    } else {
      Alert.alert(
        '복원 실패',
        '복원할 구매 내역이 없습니다.\n\n이미 구독 중이라면 앱 스토어에서 확인해주세요.'
      );
    }
  }
}
```

### 중기 수정 (앱 업데이트 필요)

#### 1. `eas.json` 설정 추가
```json
{
  "build": {
    "production-ios": {
      "ios": {
        "buildConfiguration": "Release",
        "config": {
          "usesNonExemptEncryption": false
        }
      },
      "env": {
        "APP_VARIANT": "production"
      }
    }
  }
}
```

#### 2. `app.json` 플러그인 추가
```json
{
  "plugins": [
    "expo-notifications",
    "react-native-google-mobile-ads",
    "expo-font",
    [
      "@config-plugins/react-native-iap",
      {
        "ignorePurchases": false
      }
    ]
  ]
}
```

**주의**: 플러그인 추가 후 반드시 재빌드 필요
```bash
npx expo prebuild --clean
eas build --platform ios --profile production-ios
```

#### 3. Xcode Capabilities 확인 (iOS)

**수동 확인 필요**:
1. Xcode 프로젝트 열기
2. Target → Signing & Capabilities
3. "+ Capability" 클릭
4. "In-App Purchase" 추가

#### 4. App Store Connect 설정 확인

**체크리스트**:
- [ ] 구독 상품 2개 등록 완료
- [ ] 상품 상태: "Ready to Submit" 또는 "Approved"
- [ ] Sandbox Tester 계정 생성
- [ ] 앱 번들 ID 일치 확인

---

## 🧪 테스트 계획

### 1. 로컬 디버깅
```typescript
// App.tsx 최상단에 추가
useEffect(() => {
  const debugIAP = async () => {
    console.log('=== IAP 디버그 시작 ===');
    console.log('Platform:', Platform.OS);

    try {
      const RNIap = require('react-native-iap');
      console.log('✅ RNIap 모듈 로드 성공');
      console.log('initConnection:', typeof RNIap.initConnection);
      console.log('getSubscriptions:', typeof RNIap.getSubscriptions);
      console.log('requestSubscription:', typeof RNIap.requestSubscription);
    } catch (error) {
      console.error('❌ RNIap 모듈 로드 실패:', error);
    }
  };

  debugIAP();
}, []);
```

### 2. TestFlight 테스트
- Sandbox Tester 계정으로 로그인
- 구독 구매 시도
- 콘솔 로그 확인 (Xcode Console)

### 3. 검증 포인트
1. ✅ IAP 초기화 성공 여부
2. ✅ 구독 상품 로드 성공 여부
3. ✅ Apple 결제 화면 표시 여부
4. ✅ 구매 완료 후 프리미엄 상태 업데이트

---

## 📊 예상 원인 우선순위

| 순위 | 원인 | 확률 | 해결 난이도 |
|------|------|------|-------------|
| 1 | Expo 빌드에서 네이티브 모듈 미포함 | 90% | 중 (재빌드 필요) |
| 2 | App Store Connect 구독 상품 미승인 | 70% | 낮 (설정 확인) |
| 3 | Sandbox Tester 미설정 | 60% | 낮 (계정 생성) |
| 4 | react-native-iap 호환성 문제 | 30% | 높 (버전 다운그레이드) |
| 5 | Xcode Capabilities 설정 누락 | 20% | 중 (수동 설정) |

---

## ✅ 다음 단계

### 즉시 실행
1. ✅ `iapManager.ts` 수정 (복원 로직, 오류 처리)
2. ✅ `PremiumSubscription.tsx` UI 메시지 개선
3. 📋 로컬 디버깅 코드 추가
4. 🧪 개발 환경에서 로그 확인

### 앱 업데이트 준비
1. `app.json` 플러그인 설정 추가
2. `eas.json` 빌드 설정 최적화
3. App Store Connect 설정 재확인
4. Sandbox Tester 계정 설정

### 재빌드 및 배포
1. `npx expo prebuild --clean`
2. `eas build --platform ios --profile production-ios`
3. TestFlight 업로드
4. Sandbox 환경에서 테스트

---

**작성자**: Claude Code
**우선순위**: 🔴 긴급 (사용자 구매 불가 상태)
**예상 해결 시간**: 2-4시간 (코드 수정) + 1일 (재빌드 및 TestFlight 업로드)
