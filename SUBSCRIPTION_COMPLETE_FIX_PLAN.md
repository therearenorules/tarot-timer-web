# 구독 시스템 완전 수정 계획

**작성일**: 2025-10-31
**목표**: 실제 App Store/Play Store에서 결제까지 100% 정상 작동
**우선순위**: 🔴 최고 (매출 직결)

---

## 🎯 최종 목표

### 성공 기준
```
✅ TestFlight에서 Apple 결제 화면 정상 표시
✅ Sandbox 환경에서 실제 구매 완료
✅ 구매 후 프리미엄 상태 활성화
✅ 앱 재시작 후 프리미엄 상태 유지
✅ 구매 복원 정상 작동
✅ 영수증 검증 정상 작동
✅ 구독 갱신 자동 처리
✅ 프로덕션에서 실제 결제 정상 작동
```

---

## 📋 3단계 수정 계획

---

## 🔧 1단계: IAP 초기화 로직 완전 재작성 (코드 수정)

### A. iapManager.ts - initialize() 메서드 수정

**현재 문제**:
```typescript
// ❌ 실패를 성공으로 처리
if (!RNIap) {
  console.log('⚠️ 시뮬레이션 모드로 전환합니다.');
  this.initialized = true;
  return true; // ❌ 문제!
}
```

**수정 방안**:
```typescript
/**
 * IAP 초기화
 * ✅ 완전 재작성: 실패 시 명확히 false 반환
 */
static async initialize(): Promise<boolean> {
  try {
    // 🌐 웹 환경에서만 시뮬레이션 허용
    if (Platform.OS === 'web') {
      console.log('🌐 웹 환경: IAP 기능 비활성화 (정상)');
      this.initialized = true;
      return true;
    }

    // 📱 모바일 환경에서는 반드시 RNIap 모듈 필요
    if (!RNIap) {
      console.error('❌ CRITICAL: react-native-iap 모듈을 로드할 수 없습니다.');
      console.error('📌 원인: 네이티브 모듈이 빌드에 포함되지 않음');
      console.error('📌 해결: npx expo prebuild --clean 후 재빌드 필요');
      throw new Error('IAP_MODULE_NOT_LOADED');
    }

    // ✅ RNIap API 메서드 존재 확인
    if (typeof RNIap.initConnection !== 'function') {
      console.error('❌ CRITICAL: react-native-iap API를 사용할 수 없습니다.');
      console.error('📌 원인: Expo Go 또는 개발 빌드 사용 중');
      console.error('📌 해결: Production 빌드 필요');
      throw new Error('IAP_API_NOT_AVAILABLE');
    }

    console.log('💳 IAP 매니저 초기화 시작...');

    // RNIap 초기화
    const isReady = await RNIap.initConnection();
    if (!isReady) {
      console.error('❌ IAP 연결 초기화 실패');
      throw new Error('IAP_CONNECTION_FAILED');
    }

    console.log('✅ IAP 연결 초기화 성공');

    // 구독 상품 로드 (필수)
    const products = await this.loadProducts();
    if (products.length === 0) {
      console.error('❌ 구독 상품을 로드할 수 없습니다.');
      console.error('📌 App Store Connect에서 상품 설정 확인 필요');
      throw new Error('NO_PRODUCTS_AVAILABLE');
    }

    console.log(`✅ 구독 상품 ${products.length}개 로드 완료`);

    // 구매 복원 시도 (선택적 - 실패해도 계속 진행)
    try {
      await this.restorePurchases();
    } catch (error) {
      console.warn('⚠️ 구매 복원 실패 (무시하고 계속):', error);
    }

    // 주기적 갱신 모니터링 시작
    this.startPeriodicRenewalCheck();

    this.initialized = true;
    console.log('✅ IAP 매니저 초기화 완료');
    return true;

  } catch (error: any) {
    console.error('❌ IAP 초기화 실패:', error);
    this.initialized = false;
    return false; // ✅ 명확히 실패 반환
  }
}
```

**핵심 변경사항**:
1. ✅ 웹 환경만 시뮬레이션 허용
2. ✅ 모바일에서 RNIap 없으면 명확히 실패 처리
3. ✅ 각 단계별 명확한 오류 메시지
4. ✅ 구독 상품 로드 필수 확인
5. ✅ 실패 시 false 반환

---

### B. iapManager.ts - loadProducts() 메서드 수정

**현재 문제**:
```typescript
// ❌ 실패 시 시뮬레이션 데이터 반환
if (!isMobile || !RNIap) {
  this.products = [하드코딩된_데이터];
  return this.products;
}
```

**수정 방안**:
```typescript
/**
 * 구독 상품 정보 로드
 * ✅ 완전 재작성: 실제 상품만 로드
 */
static async loadProducts(): Promise<SubscriptionProduct[]> {
  try {
    // 웹 환경에서는 빈 배열 반환
    if (Platform.OS === 'web') {
      console.log('🌐 웹 환경: 구독 상품 로드 불가');
      this.products = [];
      return [];
    }

    // RNIap 모듈 필수 확인
    if (!RNIap || typeof RNIap.getSubscriptions !== 'function') {
      console.error('❌ 구독 상품 API를 사용할 수 없습니다.');
      throw new Error('SUBSCRIPTIONS_API_NOT_AVAILABLE');
    }

    const skus = Object.values(SUBSCRIPTION_SKUS);
    console.log('📦 구독 상품 로드 시도:', skus);

    // 실제 App Store/Play Store에서 상품 정보 가져오기
    const subscriptions = await RNIap.getSubscriptions({ skus });

    if (!subscriptions || subscriptions.length === 0) {
      console.error('❌ 구독 상품을 찾을 수 없습니다.');
      console.error('📌 App Store Connect/Play Console에서 상품 ID 확인 필요:');
      console.error('   - tarot_timer_monthly');
      console.error('   - tarot_timer_yearly');
      throw new Error('NO_SUBSCRIPTIONS_FOUND');
    }

    // 상품 데이터 매핑
    this.products = subscriptions.map(sub => ({
      productId: sub.productId,
      title: sub.title || sub.productId,
      description: sub.description || '',
      price: sub.price,
      localizedPrice: sub.localizedPrice,
      currency: sub.currency,
      type: sub.productId.includes('yearly') ? 'yearly' : 'monthly'
    }));

    console.log('✅ 구독 상품 로드 완료:', this.products);
    return this.products;

  } catch (error) {
    console.error('❌ 구독 상품 로드 오류:', error);
    this.products = [];
    throw error; // ✅ 오류를 상위로 전파
  }
}
```

**핵심 변경사항**:
1. ✅ 시뮬레이션 데이터 완전 제거
2. ✅ 실제 App Store/Play Store에서만 로드
3. ✅ 상품 없으면 명확히 오류 발생
4. ✅ 오류를 상위로 전파하여 초기화 실패 처리

---

### C. iapManager.ts - purchaseSubscription() 메서드 수정

**현재 문제**:
```typescript
// ❌ 시뮬레이션 구매 허용
if (!isMobile || !RNIap) {
  return await this.simulateWebPurchase(productId);
}
```

**수정 방안**:
```typescript
/**
 * 구독 구매 처리
 * ✅ 완전 재작성: 실제 구매만 처리
 */
static async purchaseSubscription(productId: string): Promise<PurchaseResult> {
  try {
    // 초기화 확인
    if (!this.initialized) {
      throw new Error('IAP_NOT_INITIALIZED');
    }

    // 웹 환경에서는 구매 불가
    if (Platform.OS === 'web') {
      return {
        success: false,
        error: '웹 환경에서는 구독을 구매할 수 없습니다.\n앱을 다운로드해주세요.'
      };
    }

    // RNIap 모듈 필수 확인
    if (!RNIap || typeof RNIap.requestSubscription !== 'function') {
      console.error('❌ CRITICAL: 구매 API를 사용할 수 없습니다.');
      throw new Error('PURCHASE_API_NOT_AVAILABLE');
    }

    console.log('💳 구독 구매 시작:', productId);

    // 중복 구매 방지
    if (this.activePurchases.has(productId)) {
      return {
        success: false,
        error: '이미 해당 상품의 결제가 진행 중입니다.'
      };
    }

    this.activePurchases.add(productId);

    try {
      // ✅ 실제 Apple/Google 결제 처리
      const purchase = await RNIap.requestSubscription({
        sku: productId,
        ...(Platform.OS === 'android' && {
          subscriptionOffers: [
            {
              sku: productId,
              offerToken: 'default_offer_token'
            }
          ]
        })
      });

      console.log('✅ 구매 완료:', purchase);

      if (purchase && purchase.transactionId) {
        // 영수증 검증 및 프리미엄 상태 업데이트
        const receiptData = purchase.transactionReceipt ||
                            JSON.stringify(purchase);

        await this.processPurchaseSuccess(
          productId,
          purchase.transactionId,
          receiptData
        );

        // 구매 확인 (중요!)
        await RNIap.finishTransaction({
          purchase,
          isConsumable: false
        });

        console.log('✅ 구매 처리 완료');

        return {
          success: true,
          productId,
          transactionId: purchase.transactionId,
          purchaseDate: purchase.transactionDate?.toString()
        };
      }

      throw new Error('INVALID_PURCHASE_RESPONSE');

    } finally {
      this.activePurchases.delete(productId);
    }

  } catch (error: any) {
    console.error('❌ 구매 오류:', error);

    // 사용자 취소
    if (error.code === 'E_USER_CANCELLED') {
      return {
        success: false,
        error: '구매를 취소했습니다.'
      };
    }

    // 네트워크 오류
    if (error.code === 'E_NETWORK_ERROR') {
      return {
        success: false,
        error: '네트워크 연결을 확인하고 다시 시도해주세요.'
      };
    }

    // 기타 오류
    let errorMessage = '구매 처리 중 오류가 발생했습니다.';

    if (error.message === 'IAP_NOT_INITIALIZED') {
      errorMessage = '구독 시스템이 초기화되지 않았습니다.\n앱을 재시작해주세요.';
    } else if (error.message === 'PURCHASE_API_NOT_AVAILABLE') {
      errorMessage = '앱 내 구매 기능을 사용할 수 없습니다.\n앱을 최신 버전으로 업데이트해주세요.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}
```

**핵심 변경사항**:
1. ✅ 시뮬레이션 구매 완전 제거
2. ✅ 웹 환경에서는 명확히 오류 반환
3. ✅ 중복 구매 방지
4. ✅ 영수증 검증 필수 수행
5. ✅ finishTransaction 호출 (중요!)

---

### D. PremiumSubscription.tsx - 오류 처리 강화

**수정 방안**:
```typescript
const initializeIAP = async () => {
  try {
    setLoading(true);

    // IAP 초기화
    const initialized = await IAPManager.initialize();

    if (!initialized) {
      // ✅ 초기화 실패 시 명확한 안내
      Alert.alert(
        '구독 기능을 사용할 수 없습니다',
        '앱 내 구매 기능을 초기화할 수 없습니다.\n\n가능한 원인:\n• 앱 버전이 오래되었습니다\n• 네트워크 연결 문제\n• 앱스토어 서비스 장애\n\n해결 방법:\n1. 앱을 최신 버전으로 업데이트\n2. 네트워크 연결 확인\n3. 앱 재시작\n4. 문제가 지속되면 고객센터 문의',
        [
          {
            text: '앱 재시작',
            onPress: () => {
              // 앱 재시작 유도
              if (Platform.OS === 'ios') {
                // iOS는 자동 재시작 불가, 사용자에게 안내
                Alert.alert('안내', '홈 버튼을 눌러 앱을 종료한 후 다시 실행해주세요.');
              } else {
                // Android는 RNRestart 사용 (필요 시)
                Alert.alert('안내', '앱을 종료한 후 다시 실행해주세요.');
              }
            }
          },
          { text: '닫기', style: 'cancel' }
        ]
      );
      return;
    }

    // 구독 상품 로드
    const availableProducts = await IAPManager.loadProducts();

    if (availableProducts.length === 0) {
      Alert.alert(
        '구독 상품을 불러올 수 없습니다',
        '앱스토어에서 구독 상품 정보를 가져올 수 없습니다.\n\n잠시 후 다시 시도해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    setProducts(availableProducts);

    // 현재 구독 상태 확인
    const currentStatus = await IAPManager.getCurrentSubscriptionStatus();
    setPremiumStatus(currentStatus);

    console.log('✅ IAP 초기화 완료');

  } catch (error: any) {
    console.error('❌ IAP 초기화 오류:', error);

    let errorMessage = 'IAP 시스템 초기화 중 오류가 발생했습니다.';

    if (error.message === 'IAP_MODULE_NOT_LOADED') {
      errorMessage = '앱 내 구매 모듈을 로드할 수 없습니다.\n앱을 재설치하거나 최신 버전으로 업데이트해주세요.';
    } else if (error.message === 'IAP_API_NOT_AVAILABLE') {
      errorMessage = '현재 사용 중인 앱 버전에서는 구독 기능을 사용할 수 없습니다.\n정식 버전을 다운로드해주세요.';
    } else if (error.message === 'NO_PRODUCTS_AVAILABLE') {
      errorMessage = '구독 상품을 찾을 수 없습니다.\n잠시 후 다시 시도해주세요.';
    }

    Alert.alert('초기화 오류', errorMessage);
  } finally {
    setLoading(false);
  }
};
```

---

## 🔧 2단계: 빌드 설정 확인 및 수정

### A. Expo Prebuild 실행 (필수)

**목적**: 네이티브 모듈을 프로젝트에 포함

```bash
# 기존 네이티브 폴더 삭제
rm -rf ios android

# Prebuild 실행
npx expo prebuild --clean

# 결과 확인
ls -la ios/
ls -la android/
```

**확인 사항**:
- [ ] `ios/` 폴더 생성됨
- [ ] `android/` 폴더 생성됨
- [ ] `ios/Pods/` 폴더에 RNIap 포함 확인
- [ ] `android/app/build.gradle`에 RNIap 포함 확인

---

### B. iOS Capabilities 확인 (Xcode)

**수동 확인 필요**:

```bash
# iOS 프로젝트 열기
cd ios
open *.xcworkspace
```

**Xcode에서 확인**:
1. Target 선택 → Signing & Capabilities
2. "In-App Purchase" Capability 추가되어 있는지 확인
3. 없으면 수동 추가: "+ Capability" → "In-App Purchase"

---

### C. app.json 최종 확인

**현재 설정 검증**:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.tarottimer.app",  // ✅ App Store Connect와 일치
      "buildNumber": "107"
    },
    "android": {
      "package": "com.tarottimer.app",  // ✅ Play Console과 일치
      "versionCode": 102,
      "permissions": [
        "com.android.vending.BILLING"  // ✅ IAP 권한 있음
      ]
    },
    "extra": {
      "APPLE_SHARED_SECRET": "${APPLE_SHARED_SECRET}"  // ✅ 설정됨
    }
  }
}
```

**확인 완료**: ✅ 설정 이상 없음

---

## 🔧 3단계: 테스트 시나리오 (빌드 후)

### A. Sandbox 환경 설정

**사전 준비**:
1. App Store Connect → 사용자 및 액세스 → Sandbox
2. Sandbox Tester 계정 생성
3. iOS 기기 설정 → App Store → Sandbox 계정 로그인

---

### B. TestFlight 테스트 시나리오

**시나리오 1: 초기화 테스트**
```
1. TestFlight에서 앱 다운로드
2. 앱 실행
3. 프리미엄 구독 화면 열기
4. 로딩 완료 대기
5. ✅ 확인: 구독 상품 2개 표시 (실제 가격)
6. ✅ 확인: "₩6,600" "₩46,000" (App Store에서 가져온 가격)
```

**예상 결과**:
- ✅ 시뮬레이션 데이터 아닌 실제 가격 표시
- ✅ 오류 메시지 없음

**실패 시**:
- ❌ 하드코딩된 가격 표시 → 상품 로드 실패
- ❌ 오류 메시지 → IAP 초기화 실패

---

**시나리오 2: 구매 테스트 (가장 중요!)**
```
1. 월간 구독 (₩6,600) 선택
2. "구독하기" 버튼 클릭
3. ✅✅✅ Apple 결제 화면 표시 확인 ← 핵심!
4. Sandbox 계정 로그인
5. "구독 확인" 클릭
6. ✅ 확인: "구매 완료" 메시지
7. ✅ 확인: 프리미엄 상태 활성화
```

**예상 결과**:
- ✅ Apple 결제 화면 정상 표시
- ✅ Sandbox 환경에서 구매 완료
- ✅ 프리미엄 배지 표시
- ✅ 광고 제거됨

**실패 시**:
- ❌ Apple 화면 안 뜸 → RNIap 모듈 미포함
- ❌ 오류 메시지 → 코드 수정 필요

---

**시나리오 3: 앱 재시작 테스트**
```
1. 구매 완료 상태에서
2. 앱 완전 종료 (멀티태스킹에서 제거)
3. 앱 재실행
4. ✅ 확인: 프리미엄 상태 유지
5. ✅ 확인: 광고 표시 안 됨
```

**예상 결과**:
- ✅ 프리미엄 상태 유지됨
- ✅ 구매 복원 자동 실행됨

---

**시나리오 4: 구매 복원 테스트**
```
1. 앱 삭제
2. 앱 재설치
3. 앱 실행
4. 프리미엄 구독 화면 열기
5. "구매 복원" 버튼 클릭
6. ✅ 확인: "복원 완료" 메시지
7. ✅ 확인: 프리미엄 상태 활성화
```

**예상 결과**:
- ✅ 이전 구매 복원됨
- ✅ 프리미엄 기능 정상 작동

---

### C. 프로덕션 환경 테스트 (최종)

**App Store 정식 출시 후**:
```
1. 실제 Apple ID로 로그인
2. 실제 결제 수단 등록
3. 구독 구매 (실제 돈 결제)
4. ✅ 확인: Apple 영수증 이메일 수신
5. ✅ 확인: App Store → 구독 목록에 표시
6. ✅ 확인: 프리미엄 기능 정상 작동
```

---

## 📋 체크리스트

### 코드 수정
- [ ] iapManager.ts - initialize() 재작성
- [ ] iapManager.ts - loadProducts() 재작성
- [ ] iapManager.ts - purchaseSubscription() 재작성
- [ ] iapManager.ts - restorePurchases() 수정 (오늘 완료 ✅)
- [ ] PremiumSubscription.tsx - 오류 처리 강화
- [ ] TypeScript 컴파일 오류 확인

### 빌드 준비
- [ ] npx expo prebuild --clean 실행
- [ ] iOS Capabilities 확인 (Xcode)
- [ ] app.json 설정 최종 확인
- [ ] EAS Secrets 확인 (APPLE_SHARED_SECRET)

### Git 관리
- [ ] 변경사항 커밋
- [ ] 커밋 메시지 작성
- [ ] GitHub 푸시

### App Store Connect
- [ ] 구독 상품 2개 승인 확인 (완료 ✅)
- [ ] Sandbox Tester 계정 생성
- [ ] APPLE_SHARED_SECRET 확인 (완료 ✅)

### 빌드 및 배포
- [ ] iOS 빌드: eas build --platform ios --profile production-ios
- [ ] TestFlight 업로드 확인
- [ ] 내부 테스터 초대

### TestFlight 테스트
- [ ] 시나리오 1: 초기화 테스트
- [ ] 시나리오 2: 구매 테스트 (Apple 화면 확인!)
- [ ] 시나리오 3: 앱 재시작 테스트
- [ ] 시나리오 4: 구매 복원 테스트

### 프로덕션 배포
- [ ] TestFlight 테스트 통과
- [ ] App Store 심사 제출
- [ ] 실제 환경에서 최종 테스트

---

## ⚠️ 중요 알림

### 빌드 후 반드시 확인할 것

**🔴 최우선 확인사항**:
```
TestFlight 다운로드 후
→ 프리미엄 구독 화면 열기
→ "구독하기" 클릭
→ ✅✅✅ Apple 결제 화면이 뜨는가? ← 이게 전부!
```

**만약 Apple 화면이 안 뜨면**:
1. `react-native-iap` 모듈이 빌드에 포함 안 된 것
2. `npx expo prebuild --clean` 재실행
3. 재빌드 필요

**만약 Apple 화면이 뜨면**:
1. ✅ IAP 모듈 정상 작동
2. ✅ 나머지는 코드 문제
3. ✅ 수정된 코드로 해결 가능

---

## 🚀 작업 순서

### 1일차: 코드 수정 (오늘)
```
1. iapManager.ts 완전 재작성
2. PremiumSubscription.tsx 수정
3. TypeScript 컴파일 확인
4. Git 커밋
```

### 2일차: 빌드 및 TestFlight 배포
```
1. npx expo prebuild --clean
2. iOS Capabilities 확인
3. eas build --platform ios
4. TestFlight 업로드 확인
```

### 3일차: TestFlight 테스트
```
1. Sandbox 계정 설정
2. 테스트 시나리오 1-4 실행
3. 문제 발견 시 수정
4. 재테스트
```

### 4일차: 프로덕션 배포
```
1. TestFlight 테스트 통과 확인
2. App Store 심사 제출
3. 승인 대기
4. 정식 출시
```

---

## 📊 예상 소요 시간

| 단계 | 소요 시간 | 우선순위 |
|------|-----------|----------|
| 코드 수정 | 2-3시간 | 🔴 최고 |
| 빌드 준비 | 1시간 | 🔴 최고 |
| iOS 빌드 | 15-20분 | 🔴 최고 |
| TestFlight 테스트 | 1-2시간 | 🔴 최고 |
| 버그 수정 | 1-3시간 | 🟡 높음 |
| 재빌드 | 15-20분 | 🟡 높음 |
| 최종 테스트 | 1시간 | 🟡 높음 |

**총 예상 시간**: 1-2일 (빌드 시간 포함)

---

## ✅ 성공 기준 (재확인)

### 필수 성공 기준
1. ✅ Apple 결제 화면 정상 표시
2. ✅ Sandbox 환경에서 구매 완료
3. ✅ 프리미엄 상태 활성화 및 유지
4. ✅ 구매 복원 정상 작동
5. ✅ 프로덕션에서 실제 결제 작동

### 완벽성 기준
6. ✅ 영수증 검증 정상 작동
7. ✅ 자동 갱신 처리
8. ✅ 네트워크 오류 처리
9. ✅ 사용자 취소 처리
10. ✅ 환불 처리

---

**작성자**: Claude Code
**최종 목표**: 실제 App Store에서 100% 정상 작동하는 구독 시스템
**다음 단계**: 코드 수정 시작 (사용자 승인 대기)
