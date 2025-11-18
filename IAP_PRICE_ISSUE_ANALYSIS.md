# 실제 iOS 앱에서 프리미엄 가격이 표시되지 않는 원인 분석

## 🔍 **문제 상황**
- TestFlight 또는 실기기에서 프리미엄 구독 화면 진입 시 가격이 표시되지 않음
- 로딩만 되거나 "구독 상품 준비 중" 에러 메시지 표시

---

## 📊 **5가지 가능한 원인**

### ❌ **원인 1: App Store Connect 상품 설정 문제** (가장 흔함)

#### 확인 방법:
```
1. App Store Connect 접속
2. 앱 → 기능 → 앱 내 구입
3. 다음 확인:
   ✓ tarot_timer_monthly_v2 → "사용 가능" 상태?
   ✓ tarot_timer_yearly_v2 → "사용 가능" 상태?
   ✓ 가격 설정되어 있음?
   ✓ "Cleared for Sale" 체크되어 있음?
```

#### 해결책:
```
- 상태가 "준비 중" → 최대 48시간 대기 필요
- "Cleared for Sale" 체크 해제됨 → 체크 후 저장
- 가격 미설정 → 가격 설정 후 저장
```

---

### ❌ **원인 2: Sandbox 계정 미로그인** (두 번째로 흔함)

#### 확인 방법:
```
iPhone 설정 → App Store → SANDBOX ACCOUNT 섹션 확인
```

#### 증상:
- TestFlight 앱에서 구독 화면이 로딩만 됨
- Xcode Console에 "No active account" 에러

#### 해결책:
```
1. iPhone 설정 → App Store
2. 맨 아래 "SANDBOX ACCOUNT" 섹션으로 스크롤
3. "Sign In" 클릭
4. Sandbox 테스트 계정으로 로그인
   (App Store Connect에서 생성한 테스트 계정)

⚠️ 주의: 일반 Apple ID가 아닌 Sandbox 테스트 계정 사용!
```

---

### ❌ **원인 3: Product ID 불일치**

#### 확인 방법:
Xcode Console 로그에서 확인:
```
📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
```

#### 예상 문제:
```typescript
// utils/iapManager.ts의 SUBSCRIPTION_SKUS가 App Store Connect와 다름

// 현재 코드:
export const SUBSCRIPTION_SKUS = {
  monthly: 'tarot_timer_monthly_v2',  // ← 이게 맞나?
  yearly: 'tarot_timer_yearly_v2'     // ← 이게 맞나?
}
```

#### 해결책:
```
1. App Store Connect → 앱 → 기능 → 앱 내 구입
2. 각 상품의 "제품 ID" 정확히 복사
3. utils/iapManager.ts의 SUBSCRIPTION_SKUS와 100% 일치 확인
```

---

### ❌ **원인 4: Bundle ID 불일치**

#### 확인 방법:
```bash
# app.json 확인
cat app.json | grep bundleIdentifier

# 출력 예상: "bundleIdentifier": "com.tarottimer.app"
```

App Store Connect에서도 확인:
```
앱 → 일반 → 번들 ID → "com.tarottimer.app"인지 확인
```

#### 해결책:
```
불일치 시:
1. app.json 수정
2. npx expo prebuild --clean
3. 재빌드 및 재배포
```

---

### ❌ **원인 5: react-native-iap v14.x API 호환성**

#### 확인 방법:
Xcode Console 로그:
```
❌ 구독 상품 API를 사용할 수 없습니다.
또는
❌ getProducts is not a function
```

#### 원인:
`react-native-iap` v14.x에서 API 변경:
- ❌ `getSubscriptions()` → 더 이상 사용 안 됨
- ✅ `getProducts()` → 새로운 API

#### 현재 코드 상태:
```typescript
// utils/iapManager.ts:209 - ✅ 이미 수정됨
() => RNIap.getProducts({ skus })
```

✅ **이미 올바른 API 사용 중이므로 이 문제는 아님**

---

## 🎯 **즉시 확인해야 할 사항**

### 1️⃣ App Store Connect에서 확인
```
[ ] tarot_timer_monthly_v2 상태: "사용 가능"?
[ ] tarot_timer_yearly_v2 상태: "사용 가능"?
[ ] 두 상품 모두 "Cleared for Sale" 체크?
[ ] 가격 설정되어 있음?
```

### 2️⃣ iPhone에서 확인
```
[ ] Sandbox 계정 로그인되어 있음?
[ ] 네트워크 연결 정상?
```

### 3️⃣ Xcode Console에서 확인
```
iPhone을 Mac에 USB 연결 후:
1. Xcode → Window → Devices and Simulators (Cmd+Shift+2)
2. iPhone 선택 → "Open Console"
3. TestFlight 앱에서 프리미엄 화면 진입
4. Console 로그 확인:
   - "✅ getProducts 응답 받음"
   - "📦 응답 길이: 2" (← 이게 0이면 문제!)
```

---

## 🔧 **실시간 디버깅 방법**

### Xcode Console에서 확인할 핵심 로그:

#### ✅ 정상 작동 시:
```
📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
🔄 RNIap.getProducts() 호출 중...
✅ getProducts 응답 받음
📦 응답 타입: object
📦 응답 길이: 2  ← 중요!
📦 응답 내용: [
  {
    "productId": "tarot_timer_monthly_v2",
    "price": "9900",
    "localizedPrice": "₩9,900",  ← 가격 있음!
    ...
  },
  {
    "productId": "tarot_timer_yearly_v2",
    "price": "99000",
    "localizedPrice": "₩99,000",  ← 가격 있음!
    ...
  }
]
✅ 구독 상품 로드 완료
```

#### ❌ 문제 발생 시 (응답 길이 0):
```
📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
🔄 RNIap.getProducts() 호출 중...
✅ getProducts 응답 받음
📦 응답 길이: 0  ← 문제!
❌ 구독 상품을 찾을 수 없습니다.
📌 가능한 원인:
   1. Sandbox 계정으로 로그인되지 않음
   2. App Store Connect 동기화 대기 중
   3. 구독 그룹(V2)이 활성화되지 않음
```

---

## 💡 **해결 절차**

### Step 1: App Store Connect 확인
```
1. https://appstoreconnect.apple.com 접속
2. 타로 타이머 앱 선택
3. 기능 → 앱 내 구입
4. 두 상품 모두 "사용 가능" + "Cleared for Sale" 확인
```

### Step 2: Sandbox 계정 확인
```
1. iPhone 설정 → App Store
2. 맨 아래 "SANDBOX ACCOUNT" 섹션
3. Sandbox 테스트 계정으로 로그인
```

### Step 3: Xcode Console 로그 확인
```
1. iPhone을 Mac에 USB 연결
2. Xcode → Window → Devices and Simulators
3. iPhone 선택 → Open Console
4. TestFlight 앱 실행 → 프리미엄 화면 진입
5. "📦 응답 길이: X" 확인
   - X = 2 → ✅ 정상
   - X = 0 → ❌ 문제 있음
```

### Step 4: 로그 분석 및 해결
```
응답 길이 0인 경우:
→ Sandbox 계정 재로그인
→ App Store Connect 상품 설정 재확인
→ 최대 48시간 대기 필요할 수 있음
```

---

## 🚨 **가장 가능성 높은 원인**

### 1순위: Sandbox 계정 미로그인 (80% 확률)
```
해결: iPhone 설정 → App Store → SANDBOX ACCOUNT → 로그인
```

### 2순위: App Store Connect 동기화 대기 중 (15% 확률)
```
해결: 최대 48시간 대기
상품을 막 생성했거나 수정한 경우 Apple 서버 동기화 시간 필요
```

### 3순위: Product ID 오타 (5% 확률)
```
해결: App Store Connect의 제품 ID와 코드의 SUBSCRIPTION_SKUS 100% 일치 확인
```

---

## 📋 **Xcode Console 로그 수집 방법**

### 방법 1: TestFlight + Xcode Console
```
1. iPhone을 Mac에 USB 연결
2. Xcode → Window → Devices and Simulators (Cmd+Shift+2)
3. 왼쪽에서 iPhone 선택
4. 하단 "Open Console" 버튼 클릭
5. 검색창에 "RNIap" 입력 (필터링)
6. TestFlight 앱에서 프리미엄 화면 진입
7. Console 로그 전체 복사 (Cmd+A, Cmd+C)
```

### 방법 2: Xcode에서 직접 빌드
```
1. npx expo prebuild --platform ios --clean
2. open ios/tarottimer.xcworkspace
3. 실기기 선택 후 Run (Cmd+R)
4. Xcode 하단 Console 확인
```

---

## 🎯 **다음 단계**

Xcode Console 로그를 확인 후 다음 정보를 공유해주세요:

```
1. "📦 응답 길이: X" ← X가 몇인가?
2. "❌" 또는 "ERROR" 포함된 로그 전체
3. Sandbox 계정 로그인 상태
4. App Store Connect 상품 상태 (사용 가능? 준비 중?)
```

그러면 **정확한 원인**을 바로 파악하고 해결책을 제시할 수 있습니다!
