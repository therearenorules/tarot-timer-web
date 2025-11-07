# Apple Developer Support - IAP Subscription Issue Report

---

## Email Template (English)

**Subject:** TestFlight In-App Purchase Subscription Products Not Loading - App ID 6752687014

---

Dear Apple Developer Support Team,

I am writing to request assistance with an In-App Purchase (IAP) subscription issue affecting my app in TestFlight. Despite following all setup procedures, subscription products cannot be loaded in TestFlight builds.

### App Information

- **App Name:** Tarot Timer - Learn Card Meanings
- **Bundle ID:** com.tarottimer.app
- **Apple ID:** 6752687014
- **Current Build:** 114 (Version 1.1.2)
- **Platform:** iOS
- **TestFlight Status:** Approved and Available for Testing

### Subscription Products Configuration

**Subscription Group:** Tarot Timer Premium (ID: 21809126)

**Products:**
1. **Monthly Premium**
   - Product ID: `tarot_timer_monthly`
   - Internal ID: 6738248438
   - Price: $4.99 USD (₩6,600 KRW)
   - Status: Approved in App Store Connect

2. **Yearly Premium**
   - Product ID: `tarot_timer_yearly`
   - Internal ID: 6738248622
   - Price: $34.99 USD (₩45,000 KRW)
   - Status: Approved in App Store Connect

### Issue Description

**Problem:** When users attempt to view or purchase subscriptions in TestFlight build 114, the app displays an error message: "Unable to load subscription products."

**User Experience:**
1. User opens the app (TestFlight build 114)
2. Navigates to Premium Subscription screen
3. App attempts to load subscription products from App Store
4. Error popup appears: "구독 상품을 불러올 수 없습니다" (Unable to load subscription products)
5. No subscription options are displayed

**Timeline:**
- Subscription products created and configured: October 30, 2025
- Products approved in App Store Connect: October 31, 2025
- Build 114 uploaded to TestFlight: November 6, 2025
- Build 114 approved for TestFlight: November 6, 2025
- Issue persists as of: November 7, 2025 (24+ hours after approval)

### Technical Implementation Details

**Framework:** react-native-iap v14.4.23
**Build System:** Expo EAS Build with expo-build-properties

**Code Implementation:**
```typescript
// Product ID definitions
const SUBSCRIPTION_SKUS = {
  monthly: 'tarot_timer_monthly',
  yearly: 'tarot_timer_yearly'
};

// Loading products from App Store
const subscriptions = await RNIap.getSubscriptions({
  skus: ['tarot_timer_monthly', 'tarot_timer_yearly']
});

// Result: subscriptions array is empty []
```

**Expected Behavior:** `RNIap.getSubscriptions()` should return an array with 2 subscription products from App Store Connect.

**Actual Behavior:** `RNIap.getSubscriptions()` returns an empty array `[]`, causing the error message to display.

### Troubleshooting Steps Already Taken

1. ✅ Verified Product IDs match exactly in code and App Store Connect
2. ✅ Confirmed subscription products are "Approved" in App Store Connect
3. ✅ Verified bundle identifier matches: `com.tarottimer.app`
4. ✅ Confirmed expo-build-properties is included in build configuration
5. ✅ Verified IAP native modules are properly linked in build
6. ✅ Created and tested with Sandbox Tester accounts
7. ✅ Waited 24+ hours for potential App Store Connect synchronization
8. ✅ Reviewed and confirmed pricing and availability settings for Korea (KOR) and USA regions

### Questions for Apple Support

1. **Subscription Group Status:** Are there any pending requirements or missing metadata for subscription group "Tarot Timer Premium" (ID: 21809126)?

2. **Product Availability in TestFlight:** Are the subscription products (tarot_timer_monthly, tarot_timer_yearly) properly synchronized and available for TestFlight testing?

3. **Synchronization Status:** Is there a synchronization delay between App Store Connect approval and TestFlight availability? If so, what is the expected timeframe?

4. **Required Metadata:** Are there any missing required fields (screenshots, review notes, localizations) preventing the products from appearing in TestFlight?

5. **Agreements:** Is the Paid Applications Agreement properly active and configured for IAP testing in TestFlight?

6. **Diagnostic Logs:** Are there any server-side logs or diagnostics available from Apple's systems that could help identify why `getSubscriptions()` returns an empty array?

### Additional Information

- **Device Used for Testing:** iPhone (iOS 17+) via TestFlight
- **Network Connectivity:** Confirmed stable internet connection
- **Sandbox Account:** Multiple sandbox tester accounts created and tested
- **App Store Connect Login:** Confirmed no sandbox account login prompts appear during testing
- **Previous Builds:** This is the first build with IAP implementation

### Request

Could you please:
1. Verify the subscription products are properly configured and available for TestFlight
2. Check if there are any synchronization issues between App Store Connect and TestFlight
3. Identify any missing metadata or configuration requirements
4. Provide guidance on resolving this issue so TestFlight users can test subscription functionality

### Supporting Documentation

- App Store Connect Screenshots: Available upon request
- Device Console Logs: Available upon request
- StoreKit Configuration File: Included in project

I appreciate your assistance in resolving this issue. Please let me know if you need any additional information or screenshots.

Thank you for your support.

Best regards,
[Your Name]
[Your Email]
[Your Developer Account]

---

## 한국어 버전

**제목:** TestFlight 인앱 결제 구독 상품 로드 실패 - 앱 ID 6752687014

---

안녕하세요, Apple 개발자 지원팀

TestFlight에서 인앱 결제(IAP) 구독 기능에 문제가 발생하여 지원을 요청드립니다. 모든 설정 절차를 완료했음에도 불구하고, TestFlight 빌드에서 구독 상품을 불러올 수 없는 상황입니다.

### 앱 정보

- **앱 이름:** Tarot Timer - Learn Card Meanings
- **Bundle ID:** com.tarottimer.app
- **Apple ID:** 6752687014
- **현재 빌드:** 114 (버전 1.1.2)
- **플랫폼:** iOS
- **TestFlight 상태:** 승인 완료 및 테스트 가능

### 구독 상품 설정

**구독 그룹:** Tarot Timer Premium (ID: 21809126)

**상품:**
1. **Monthly Premium**
   - Product ID: `tarot_timer_monthly`
   - Internal ID: 6738248438
   - 가격: $4.99 USD (₩6,600 KRW)
   - 상태: App Store Connect에서 승인됨

2. **Yearly Premium**
   - Product ID: `tarot_timer_yearly`
   - Internal ID: 6738248622
   - 가격: $34.99 USD (₩45,000 KRW)
   - 상태: App Store Connect에서 승인됨

### 문제 설명

**문제:** 사용자가 TestFlight 빌드 114에서 구독을 확인하거나 구매하려고 할 때, "구독 상품을 불러올 수 없습니다"라는 오류 메시지가 표시됩니다.

**사용자 경험:**
1. 사용자가 앱 실행 (TestFlight 빌드 114)
2. 프리미엄 구독 화면으로 이동
3. 앱이 App Store에서 구독 상품 정보 로드 시도
4. 오류 팝업 표시: "구독 상품을 불러올 수 없습니다"
5. 구독 옵션이 전혀 표시되지 않음

**타임라인:**
- 구독 상품 생성 및 설정: 2025년 10월 30일
- App Store Connect에서 상품 승인: 2025년 10월 31일
- 빌드 114 TestFlight 업로드: 2025년 11월 6일
- 빌드 114 TestFlight 승인: 2025년 11월 6일
- 문제 지속 시점: 2025년 11월 7일 (승인 후 24시간 이상 경과)

### 기술적 구현 세부사항

**프레임워크:** react-native-iap v14.4.23
**빌드 시스템:** Expo EAS Build with expo-build-properties

**코드 구현:**
```typescript
// Product ID 정의
const SUBSCRIPTION_SKUS = {
  monthly: 'tarot_timer_monthly',
  yearly: 'tarot_timer_yearly'
};

// App Store에서 상품 로드
const subscriptions = await RNIap.getSubscriptions({
  skus: ['tarot_timer_monthly', 'tarot_timer_yearly']
});

// 결과: subscriptions 배열이 비어있음 []
```

**예상 동작:** `RNIap.getSubscriptions()`가 App Store Connect의 2개 구독 상품을 포함한 배열을 반환해야 함.

**실제 동작:** `RNIap.getSubscriptions()`가 빈 배열 `[]`을 반환하여 오류 메시지가 표시됨.

### 이미 수행한 문제 해결 단계

1. ✅ Product ID가 코드와 App Store Connect에서 정확히 일치하는지 확인
2. ✅ 구독 상품이 App Store Connect에서 "승인됨" 상태인지 확인
3. ✅ Bundle identifier 일치 확인: `com.tarottimer.app`
4. ✅ expo-build-properties가 빌드 설정에 포함되어 있는지 확인
5. ✅ IAP 네이티브 모듈이 빌드에 제대로 링크되어 있는지 확인
6. ✅ Sandbox Tester 계정 생성 및 테스트
7. ✅ App Store Connect 동기화를 위해 24시간 이상 대기
8. ✅ 한국(KOR) 및 미국(USA) 지역의 가격 및 가용성 설정 확인

### Apple 지원팀에 드리는 질문

1. **구독 그룹 상태:** 구독 그룹 "Tarot Timer Premium" (ID: 21809126)에 대해 보류 중인 요구사항이나 누락된 메타데이터가 있나요?

2. **TestFlight에서의 상품 가용성:** 구독 상품 (tarot_timer_monthly, tarot_timer_yearly)이 제대로 동기화되어 TestFlight 테스트에서 사용 가능한 상태인가요?

3. **동기화 상태:** App Store Connect 승인과 TestFlight 가용성 사이에 동기화 지연이 있나요? 있다면 예상 소요 시간은 얼마나 되나요?

4. **필수 메타데이터:** TestFlight에서 상품이 표시되지 않는 원인이 되는 누락된 필수 필드(스크린샷, 검토 노트, 현지화)가 있나요?

5. **계약:** Paid Applications Agreement가 IAP TestFlight 테스트를 위해 제대로 활성화되고 설정되어 있나요?

6. **진단 로그:** `getSubscriptions()`가 빈 배열을 반환하는 이유를 파악하는 데 도움이 될 수 있는 Apple 시스템의 서버 측 로그나 진단 정보가 있나요?

### 추가 정보

- **테스트에 사용된 기기:** iPhone (iOS 17+) TestFlight 통해
- **네트워크 연결:** 안정적인 인터넷 연결 확인됨
- **Sandbox 계정:** 여러 sandbox tester 계정 생성 및 테스트됨
- **App Store Connect 로그인:** 테스트 중 sandbox 계정 로그인 프롬프트가 나타나지 않음 확인
- **이전 빌드:** IAP 구현이 포함된 첫 번째 빌드입니다

### 요청 사항

다음 사항을 확인해 주시면 감사하겠습니다:
1. 구독 상품이 제대로 설정되어 TestFlight에서 사용 가능한지 확인
2. App Store Connect와 TestFlight 간 동기화 문제 확인
3. 누락된 메타데이터 또는 설정 요구사항 식별
4. TestFlight 사용자가 구독 기능을 테스트할 수 있도록 이 문제 해결 방법 안내

### 지원 문서

- App Store Connect 스크린샷: 요청 시 제공 가능
- 기기 콘솔 로그: 요청 시 제공 가능
- StoreKit 설정 파일: 프로젝트에 포함됨

이 문제 해결에 도움을 주셔서 감사합니다. 추가 정보나 스크린샷이 필요하시면 알려주세요.

감사합니다.

[귀하의 이름]
[이메일 주소]
[개발자 계정]

---

## 첨부 권장 자료

### 1. App Store Connect 스크린샷 (캡처 필요)
- 구독 그룹 상태 화면
- 각 구독 상품의 상태 화면
- 가격 및 가용성 설정 화면
- Agreements, Tax, and Banking 상태 화면

### 2. 기기 콘솔 로그 (Xcode에서 수집)
```
Window → Devices and Simulators → [Your Device]
→ Open Console → Filter: "IAP" 또는 "subscription"
→ 구독 화면 진입 시 로그 캡처
```

### 3. 프로젝트 정보 파일
- app.json (Bundle ID, 버전 정보)
- TarotTimer.storekit (구독 설정)

---

## 제출 방법

**Option 1: Apple Developer Support Website**
https://developer.apple.com/contact/

**Option 2: App Store Connect 내에서**
App Store Connect → Help → Contact Us → App Store Connect

**Option 3: 개발자 포럼**
https://developer.apple.com/forums/

---

## 예상 응답 시간
- **일반 문의:** 2-3 영업일
- **기술적 문제:** 1-2 영업일
- **긴급:** DTS (Developer Technical Support) 티켓 사용 시 24시간 이내

---

**작성일:** 2025-11-07
**빌드 버전:** 114
**문서 버전:** 1.0
