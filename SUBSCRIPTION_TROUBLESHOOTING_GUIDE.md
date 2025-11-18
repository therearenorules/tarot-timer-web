# 구독 오류 발생 시 체계적 진단 가이드

## 🎯 Build 126 배포 후 오류 발생 시 따라야 할 순서

---

## 📋 1단계: 로그 수집 및 분석

### iOS Console 로그 확인 (TestFlight)

TestFlight 앱 실행 후 다음 로그를 전부 복사해서 제공해주세요:

```
필수 로그 항목:
1. 앱 시작 시 초기화 로그
   🚀 iapManager.ts 모듈 초기화 시작
   📱 Platform.OS: ios
   📦 RNIapModule import 완료

2. IAP 초기화 로그
   💳 IAP 매니저 초기화 시작...
   ✅ IAP 연결 초기화 성공 OR ❌ IAP 초기화 실패

3. Event Listener 등록 로그
   🎧 Purchase Event Listeners 등록 중...
   ✅ Purchase Event Listeners 등록 완료

4. 상품 로드 로그
   📦 구독 상품 로드 시도: [...]
   🔄 RNIap.fetchProducts() 호출 중
   ✅ fetchProducts 응답 받음 OR ❌ fetchProducts 호출 최종 실패

5. 오류 메시지 (있는 경우)
   ❌ 로 시작하는 모든 라인
```

### 로그를 제공하는 방법

```
Mac에서:
1. 디바이스를 Mac에 연결
2. Console.app 실행
3. 디바이스 선택
4. "tarot" 또는 "iap" 검색
5. 관련 로그 전체 복사

또는:
iOS 설정 → 프라이버시 및 보안 → 분석 및 개선 → 분석 데이터
→ 최신 크래시 로그 확인
```

---

## 🔍 2단계: 오류 유형별 진단

### 시나리오 A: 초기화 로그 자체가 없음

**증상:**
```
❌ 🚀 iapManager.ts 모듈 초기화 시작 로그가 없음
```

**원인:** 앱 번들링 문제 또는 JavaScript 로드 실패

**해결책:**
1. EAS Build 로그 확인
   ```bash
   eas build:list
   # 최신 빌드 ID 확인 후
   eas build:view [BUILD_ID]
   ```

2. Prebuild 로그에서 react-native-iap 확인
   ```
   검색어: "react-native-iap"
   검색어: "NitroIap"
   검색어: "StoreKit"
   ```

3. 문제 발견 시 → **3단계 긴급 대응** 참조

---

### 시나리오 B: fetchProducts가 빈 배열 반환

**증상:**
```
✅ fetchProducts 응답 받음
📦 응답 길이: 0
❌ 구독 상품을 찾을 수 없습니다.
```

**원인:** App Store Connect 설정 문제

**해결책:**

#### Step 1: App Store Connect 확인
```
https://appstoreconnect.apple.com

1. 앱 → In-App Purchases
2. 다음 Product IDs 검색:
   - tarot_timer_monthly_v2
   - tarot_timer_yearly_v2

3. 각 상품의 상태 확인:
   [ ] Ready to Submit (아직 제출 안함)
   [ ] Waiting for Review (검토 대기)
   [ ] Approved (승인됨)
   [ ] Rejected (거절됨)
   [ ] Missing Metadata (메타데이터 누락)
```

#### Step 2: 상태별 조치

**A) "Ready to Submit" 상태인 경우:**
- Submit for Review 버튼 클릭
- 승인까지 1-2일 소요
- 승인 후 48시간 동기화 대기

**B) "Missing Metadata" 상태인 경우:**
- Localization 추가 필요
- Screenshot 추가 필요
- Review Notes 작성 필요

**C) Product IDs가 아예 없는 경우:**
- V2 상품을 생성해야 함
- 또는 V1 Product IDs로 코드 되돌리기

---

### 시나리오 C: fetchProducts가 타임아웃

**증상:**
```
🔄 RNIap.fetchProducts() 호출 중
⏳ 재시도 1/3: 2000ms 대기 중...
⏳ 재시도 2/3: 4000ms 대기 중...
⏳ 재시도 3/3: 8000ms 대기 중...
❌ fetchProducts 호출 최종 실패 (3회 재시도 후)
```

**원인:** 네트워크 문제 또는 Apple 서버 장애

**해결책:**

1. **네트워크 확인**
   - Wi-Fi 끄고 LTE로 시도
   - VPN 사용 중이면 끄기
   - 방화벽/프록시 설정 확인

2. **Apple System Status 확인**
   ```
   https://www.apple.com/support/systemstatus/

   확인 항목:
   - App Store
   - In-App Purchase
   - TestFlight
   ```

3. **30분 후 재시도**

---

### 시나리오 D: 구매 버튼 클릭 시 오류

**증상:**
```
💳 구매 요청 전송 중...
✅ 구매 요청 전송 완료 (이벤트 대기 중...)
❌ purchaseErrorListener 호출됨
📌 에러 코드: E_USER_CANCELLED
```

**원인:** 사용자 취소 또는 결제 시트 오류

**해결 방법:**

#### E_USER_CANCELLED (정상)
- 사용자가 취소한 것 → 문제 없음

#### E_UNKNOWN
```
가능한 원인:
1. Sandbox 계정 미로그인
2. 결제 수단 미등록
3. Apple ID 국가 설정 문제
```

**조치:**
```
iOS 설정 → 맨 위 Apple ID → 미디어 및 구입 항목 → 로그아웃
→ Sandbox 계정으로 로그인

Sandbox 계정 생성:
https://appstoreconnect.apple.com
→ Users and Access → Sandbox Testers → +
```

---

### 시나리오 E: Purchase Event Listener가 호출 안됨

**증상:**
```
💳 구매 요청 전송 중...
✅ 구매 요청 전송 완료 (이벤트 대기 중...)
(30초 후)
❌ 구매 오류: PURCHASE_TIMEOUT
```

**원인:** Event Listener 등록 실패 또는 네이티브 모듈 문제

**해결책:**

1. **로그 확인**
   ```
   필수 확인:
   🎧 Purchase Event Listeners 등록 중... ✅
   ✅ Purchase Event Listeners 등록 완료 ✅
   ```

2. **없으면 Config Plugin 재확인**
   ```bash
   # app.json 확인
   cat app.json | grep "react-native-iap"

   # 있어야 함:
   "react-native-iap",
   ```

3. **EAS Build 재실행**
   ```bash
   # Clean Build
   eas build --platform ios --profile production-ios --clear-cache
   ```

---

## 🚨 3단계: 긴급 대응 (Config Plugin 문제)

만약 Config Plugin이 제대로 적용되지 않았다면:

### 방법 1: V1 Product IDs로 긴급 롤백

```typescript
// utils/iapManager.ts
export const SUBSCRIPTION_SKUS = {
  monthly: Platform.select({
    ios: 'tarot_timer_monthly', // V2 → V1
    android: 'tarot_timer_monthly',
    default: 'tarot_timer_monthly'
  }),
  yearly: Platform.select({
    ios: 'tarot_timer_yearly', // V2 → V1
    android: 'tarot_timer_yearly',
    default: 'tarot_timer_yearly'
  })
};
```

**조건:** V1 Product IDs가 App Store Connect에 아직 있어야 함

---

### 방법 2: Manual Linking (최후의 수단)

```bash
# 1. 로컬에서 prebuild 실행
npx expo prebuild --platform ios --clean

# 2. ios/Podfile 확인
cat ios/Podfile | grep -A 5 "NitroIap"

# 3. 수동으로 pod install
cd ios && pod install

# 4. Xcode로 확인
open ios/*.xcworkspace

# 5. Build Phases → Link Binary With Libraries 확인
# StoreKit.framework가 있는지 확인
```

---

## 📊 4단계: 상세 디버깅

### 추가 로깅 활성화

```typescript
// utils/iapManager.ts 맨 위에 추가

// 🔍 극도로 상세한 로깅 활성화
const VERBOSE_LOGGING = true;

// fetchProducts 호출 전
if (VERBOSE_LOGGING) {
  console.log('🔍 RNIap 객체:', RNIap);
  console.log('🔍 fetchProducts 함수:', RNIap?.fetchProducts);
  console.log('🔍 모든 메서드:', Object.keys(RNIap || {}));
}
```

---

## 🎯 5단계: 최종 체크리스트

Build 126 배포 후 다음을 순차적으로 확인:

```
[ ] 1. 앱 실행 시 초기화 로그 보임
      🚀 iapManager.ts 모듈 초기화 시작

[ ] 2. RNIapModule 로드 성공
      📦 RNIapModule.fetchProducts 타입: function

[ ] 3. IAP 연결 초기화 성공
      ✅ IAP 연결 초기화 성공

[ ] 4. Event Listeners 등록 성공
      ✅ Purchase Event Listeners 등록 완료

[ ] 5. 상품 로드 성공
      ✅ 구독 상품 2개 로드 완료

[ ] 6. 가격 표시됨
      화면에 ₩9,900 / ₩99,000 표시

[ ] 7. 구매 버튼 동작
      클릭 시 Apple 결제 시트 표시
```

**하나라도 실패하면 해당 단계의 로그를 제공해주세요!**

---

## 💡 추가 도구

### EAS Build 로그 상세 확인

```bash
# 최신 빌드 상세 로그
eas build:view --platform ios

# 특정 빌드 로그
eas build:view [BUILD_ID]

# Prebuild 단계 확인
# "Installing pods" 섹션에서:
# - NitroIap 설치 여부
# - StoreKit.framework 링크 여부
```

### TestFlight 디버깅

```
TestFlight 앱에서:
1. 앱 → 정보 (i 아이콘)
2. Build 번호 확인 (126인지)
3. "이전 빌드로 전환" 옵션 확인
```

---

## 📞 문의 시 제공해야 할 정보

문제가 계속되면 다음 정보와 함께 문의:

1. **Build 번호:** 126
2. **iOS Console 전체 로그** (위 1단계 참조)
3. **어느 단계에서 실패했는지** (위 5단계 체크리스트)
4. **EAS Build 로그 URL:** `eas build:view` 출력
5. **App Store Connect 스크린샷:**
   - In-App Purchases 목록
   - V2 Product IDs 상태

이 정보를 제공하면 정확한 원인을 빠르게 파악할 수 있습니다!
