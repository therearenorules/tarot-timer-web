# Xcode에서 구독 오류 디버깅 가이드

## 🎯 목표
Xcode Console에서 실시간 로그를 확인하여 구독 오류의 정확한 원인 파악

---

## 📱 방법 1: Xcode에서 직접 빌드 및 실행 (권장)

### 1️⃣ 프로젝트 준비
```bash
# 터미널에서 프로젝트 폴더로 이동
cd /Users/[사용자명]/Desktop/tarot-timer-web

# iOS 네이티브 폴더 생성 (없다면)
npx expo prebuild --platform ios --clean

# 의존성 설치
npm install
cd ios && pod install && cd ..
```

### 2️⃣ Xcode에서 프로젝트 열기
```bash
# Xcode에서 워크스페이스 열기
open ios/tarottimer.xcworkspace
```

**중요**: `.xcodeproj`가 아닌 `.xcworkspace`를 열어야 합니다!

### 3️⃣ Xcode 설정
```
1. Xcode 상단 메뉴 → Product → Scheme → Edit Scheme
2. Run (왼쪽) → Info 탭
3. Build Configuration: Debug 선택
4. Run → Options 탭
5. StoreKit Configuration: TarotTimer.storekit 선택 (로컬 테스트용)
```

### 4️⃣ 실제 기기 연결 및 실행
```
1. iPhone을 Mac에 USB 연결
2. Xcode 상단에서 기기 선택 (시뮬레이터 말고 실제 iPhone)
3. ▶️ Run 버튼 클릭 (또는 Cmd + R)
4. 앱이 기기에 빌드되고 실행됨
```

### 5️⃣ Console 로그 확인
```
1. Xcode 하단 Console 영역 확인
2. 또는 View → Debug Area → Show Debug Area (Cmd + Shift + Y)
3. 앱 실행 → 설정 → 프리미엄 구독 클릭
4. Console에 출력되는 모든 로그 확인
```

---

## 📱 방법 2: TestFlight 앱 + Xcode Console 연결 (더 쉬움)

TestFlight 빌드를 그대로 사용하면서 Xcode Console만 보는 방법입니다.

### 1️⃣ iPhone을 Mac에 USB 연결

### 2️⃣ Xcode에서 Devices 창 열기
```
Xcode → Window → Devices and Simulators (Cmd + Shift + 2)
```

### 3️⃣ iPhone 선택 및 Console 열기
```
1. 왼쪽에서 연결된 iPhone 선택
2. 하단 "Open Console" 버튼 클릭
3. 새 Console 창이 열림
```

### 4️⃣ TestFlight 앱 실행 및 로그 확인
```
1. iPhone에서 TestFlight의 Tarot Timer 실행
2. 설정 → 프리미엄 구독 클릭
3. Console 창에서 실시간 로그 확인
```

### 5️⃣ 로그 필터링
```
Console 상단 검색창에 다음 키워드 입력:
- "RNIap" - react-native-iap 관련 로그만 표시
- "구독" - 구독 관련 한글 로그
- "subscription" - 구독 관련 영문 로그
- "ERROR" - 에러 로그만 표시
```

---

## 🔍 예상 로그 패턴

### ✅ 정상 작동 시
```
✅ react-native-iap 모듈 로드 성공
📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
📱 플랫폼: ios
📱 iOS 버전: 17.5
🔧 Bundle ID: com.tarottimer.app
🔧 App ID: 6752687014
🔄 RNIap.initConnection() 호출 중...
✅ IAP 연결 성공
🔄 RNIap.getSubscriptions() 호출 중 (타임아웃: 30초, 최대 3회 재시도)...
✅ getSubscriptions 응답 받음
📦 응답 타입: object
📦 응답 길이: 2
📦 응답 내용: [
  {
    "productId": "tarot_timer_monthly_v2",
    "price": "4.99",
    "currency": "USD",
    ...
  },
  {
    "productId": "tarot_timer_yearly_v2",
    "price": "34.99",
    "currency": "USD",
    ...
  }
]
✅ 구독 상품 로드 완료: 2
```

### ❌ NO_SUBSCRIPTIONS_FOUND 에러 시
```
✅ react-native-iap 모듈 로드 성공
📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
🔄 RNIap.getSubscriptions() 호출 중...
✅ getSubscriptions 응답 받음
📦 응답 길이: 0
❌ 구독 상품을 찾을 수 없습니다.
📌 확인된 SKUs: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
📌 App Store Connect 상태: 승인됨
📌 가능한 원인:
   1. Sandbox 계정으로 로그인되지 않음
   2. App Store Connect 동기화 대기 중 (최대 48시간)
   3. 구독 그룹(V2)이 활성화되지 않음
   4. 네트워크 연결 불안정
```

### ❌ TIMEOUT_ERROR 에러 시
```
✅ react-native-iap 모듈 로드 성공
📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
🔄 RNIap.getSubscriptions() 호출 중...
⏳ 재시도 1/3: 2000ms 대기 중...
⏳ 재시도 2/3: 4000ms 대기 중...
⏳ 재시도 3/3: 8000ms 대기 중...
❌ getSubscriptions 호출 최종 실패 (3회 재시도 후): REQUEST_TIMEOUT
```

### ❌ NETWORK_ERROR 에러 시
```
✅ react-native-iap 모듈 로드 성공
📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
🔄 RNIap.getSubscriptions() 호출 중...
❌ getSubscriptions 호출 최종 실패: Network request failed
📌 에러 타입: Error
📌 에러 메시지: Network request failed
📌 에러 코드: ENETUNREACH
```

---

## 🔧 Console에서 확인해야 할 핵심 정보

### 1️⃣ 첫 번째 확인: react-native-iap 로드 성공 여부
```
찾을 로그: "✅ react-native-iap 모듈 로드 성공"

만약 이 로그가 안 보이면:
→ react-native-iap 설치 문제
→ 해결: npm install react-native-iap && cd ios && pod install
```

### 2️⃣ 두 번째 확인: Product IDs 정확성
```
찾을 로그: "📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']"

만약 다른 Product IDs가 보이면:
→ 코드에서 잘못된 Product ID 사용 중
→ 해결: utils/iapManager.ts의 SUBSCRIPTION_SKUS 확인
```

### 3️⃣ 세 번째 확인: Bundle ID 일치 여부
```
찾을 로그: "🔧 Bundle ID: com.tarottimer.app"

만약 다른 Bundle ID가 보이면:
→ app.json과 App Store Connect 불일치
→ 해결: app.json의 ios.bundleIdentifier 확인
```

### 4️⃣ 네 번째 확인: getSubscriptions() 응답
```
찾을 로그: "📦 응답 길이: 2" 또는 "📦 응답 길이: 0"

응답 길이: 0 이면:
→ Apple 서버에서 Product IDs를 찾을 수 없음
→ Sandbox 계정 또는 App Store Connect 설정 문제
```

### 5️⃣ 다섯 번째 확인: 재시도 메커니즘 작동 여부
```
찾을 로그: "⏳ 재시도 1/3", "⏳ 재시도 2/3", "⏳ 재시도 3/3"

재시도가 보이면:
→ 네트워크 지연 또는 Apple 서버 응답 느림
→ 정상적인 동작 (최종 성공 여부 확인)
```

---

## 📋 로그 수집 방법

### 방법 1: Console 텍스트 복사
```
1. Xcode Console에서 로그 전체 선택 (Cmd + A)
2. 복사 (Cmd + C)
3. 텍스트 파일에 붙여넣기
```

### 방법 2: Console 로그 파일 저장
```
1. Console 창에서 우클릭
2. "Save Console Output..." 선택
3. subscription-console-log.txt로 저장
```

---

## 🎯 다음 단계

### Xcode Console 로그를 확인한 후:

1. **로그 전체 복사해서 공유**
   - 특히 "❌" 또는 "ERROR" 포함된 줄
   - "📦 응답 길이" 부분
   - "재시도" 관련 로그

2. **다음 정보 확인**
   - [ ] react-native-iap 로드 성공?
   - [ ] Product IDs 정확함?
   - [ ] Bundle ID 일치?
   - [ ] getSubscriptions() 응답 길이는?
   - [ ] 어떤 에러 메시지 출력?

3. **로그 기반 해결책 제시**
   - 로그 내용에 따라 정확한 수정 방안 제공
   - 코드 수정 또는 설정 변경 안내

---

## 💡 추가 팁

### StoreKit Configuration 로컬 테스트
Xcode에서 로컬 StoreKit 테스트를 사용하면 **App Store Connect 없이** 테스트 가능:

```
1. Xcode → Product → Scheme → Edit Scheme
2. Run → Options
3. StoreKit Configuration: TarotTimer.storekit 선택
4. 앱 실행
5. 구독 화면에서 "Xcode" 표시와 함께 테스트 구독 가능
```

이 방법으로 **코드 자체에 문제가 있는지** 먼저 확인 가능합니다.

---

## 🚨 긴급 확인사항

Xcode Console에서 다음 에러가 보이면:

### 1. "Sandbox 계정 미로그인" 에러
```
Error: No valid Sandbox account
→ iOS 설정 → App Store → SANDBOX ACCOUNT 로그인
```

### 2. "Product ID not found" 에러
```
Error: Product identifiers not found: tarot_timer_monthly_v2
→ App Store Connect "Cleared for Sale" 체크 확인
```

### 3. "Bundle ID mismatch" 에러
```
Error: Bundle identifier does not match
→ app.json과 Xcode Project Settings의 Bundle ID 일치 확인
```

---

Console 로그를 확인하면 **정확한 원인**을 파악할 수 있습니다!
로그 내용을 공유해주시면 즉시 해결책을 제시하겠습니다.
