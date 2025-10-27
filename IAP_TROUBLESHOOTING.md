# IAP 구독 구매 실패 문제 해결 가이드

## 🐛 **문제 상황**
TestFlight 앱에서 "구독 시작" 버튼을 누르면 **구매 실패** 알림이 표시됨.

---

## 🔍 **진단 결과**

### **1. Product ID 확인**

**현재 설정된 Product ID:**
```typescript
// utils/iapManager.ts
export const SUBSCRIPTION_SKUS = {
  monthly: 'tarot_timer_monthly',
  yearly: 'tarot_timer_yearly'
}
```

### **2. Bundle Identifier**
```json
// app.json
"bundleIdentifier": "com.tarottimer.app"
```

---

## ✅ **확인해야 할 사항 (우선순위 순)**

### **Priority 1: App Store Connect 설정 확인** ⭐ **가장 중요**

#### **A. 인앱 구매 상품 생성 확인**
1. **App Store Connect** → https://appstoreconnect.apple.com
2. **My Apps** → **Tarot Timer** 선택
3. **Features** → **In-App Purchases** 또는 **Subscriptions**
4. 다음 Product ID가 생성되어 있는지 확인:
   - ✅ `tarot_timer_monthly` (월간 구독)
   - ✅ `tarot_timer_yearly` (연간 구독)

#### **B. 상품 상태 확인**
- **Status**: 반드시 **"Ready to Submit"** 또는 **"Approved"** 상태여야 함
- **Missing Metadata**가 있으면 구매 불가
- **Pricing**: 가격이 설정되어 있어야 함

#### **C. Subscription Group 설정 (구독 상품인 경우)**
- Subscription Group이 생성되어 있어야 함
- 구독 상품이 그룹에 추가되어 있어야 함

---

### **Priority 2: TestFlight 환경 설정**

#### **A. Sandbox 테스터 계정 확인**
1. **App Store Connect** → **Users and Access** → **Sandbox Testers**
2. Sandbox Tester 계정 생성 (새 Apple ID 필요)
3. **iPhone 설정** → **App Store** → **Sandbox Account**
4. Sandbox 계정으로 로그인

⚠️ **주의**: 일반 Apple ID로는 Sandbox 구매를 테스트할 수 없습니다!

#### **B. TestFlight 빌드에 IAP 설정**
1. App Store Connect → TestFlight → Build 선택
2. **Build Metadata** 섹션에서 **Export Compliance** 설정
3. IAP가 활성화되어 있는지 확인

---

### **Priority 3: Paid Applications Agreement 확인**

#### **중요!**
App Store Connect에서 **Agreements, Tax, and Banking** 섹션:
- ✅ **Paid Applications Agreement** 서명 필수
- ✅ 은행 계좌 정보 입력 완료
- ✅ 세금 정보 입력 완료

→ 이것이 완료되지 않으면 IAP가 작동하지 않습니다!

---

## 🔧 **해결 방법**

### **Step 1: App Store Connect 인앱 구매 상품 생성**

1. **App Store Connect** 접속
2. **My Apps** → **Tarot Timer** → **Features** → **Subscriptions**
3. **Create Subscription**:
   - **Reference Name**: `Tarot Timer Monthly` / `Tarot Timer Yearly`
   - **Product ID**: `tarot_timer_monthly` / `tarot_timer_yearly`
   - **Subscription Group**: 새로 생성 또는 기존 그룹 선택
4. **Subscription Pricing**:
   - 월간: $4.99 (또는 원하는 가격)
   - 연간: $49.99 (또는 원하는 가격)
5. **Localizations** (한국어/영어):
   - Display Name: "월간 프리미엄" / "연간 프리미엄"
   - Description: 프리미엄 기능 설명
6. **Review Information**:
   - Screenshot 업로드 (프리미엄 기능 스크린샷)

---

### **Step 2: Sandbox Tester 계정 생성 및 설정**

1. **App Store Connect** → **Users and Access** → **Sandbox Testers**
2. **+** 버튼 클릭
3. 새 Apple ID 생성 (예: `test@example.com`)
4. **iPhone**에서:
   - **설정** → **App Store** → **Sandbox Account**
   - 생성한 Sandbox Tester 계정으로 로그인

---

### **Step 3: 앱 코드 확인**

#### **Product ID 일치 확인**
```bash
# 코드에서 사용하는 Product ID 확인
grep -r "tarot_timer_monthly" .
grep -r "tarot_timer_yearly" .
```

#### **Bundle Identifier 일치 확인**
```bash
# app.json의 Bundle ID가 App Store Connect와 일치하는지 확인
cat app.json | grep bundleIdentifier
```

**App Store Connect**: com.tarottimer.app ✅ (일치)

---

## 🐞 **디버깅 방법**

### **1. Xcode Console 로그 확인**

TestFlight 앱 실행 시 Xcode Console에서 IAP 관련 로그 확인:

```
// 정상 로그:
💳 IAP 매니저 초기화 시작...
✅ 구독 상품 로드 완료: 2
💳 구독 구매 시작: tarot_timer_monthly

// 실패 로그 예시:
❌ 구매 오류: [에러 메시지]
```

**Xcode Console 확인 방법:**
1. Xcode → **Window** → **Devices and Simulators**
2. iPhone 선택
3. **Open Console** 버튼 클릭
4. 검색 필터: `IAP` 또는 `구매`

---

### **2. react-native-iap 에러 코드**

| 에러 코드 | 의미 | 해결 방법 |
|----------|------|----------|
| `E_USER_CANCELLED` | 사용자가 구매 취소 | 정상 동작 |
| `E_NETWORK_ERROR` | 네트워크 오류 | 인터넷 연결 확인 |
| `E_UNKNOWN` | 알 수 없는 오류 | Product ID 확인 |
| `E_ITEM_UNAVAILABLE` | 상품을 찾을 수 없음 | App Store Connect에서 Product ID 확인 |
| `E_ALREADY_OWNED` | 이미 구독 중 | 구매 복원 시도 |

---

### **3. 자세한 디버깅 로그 활성화**

코드에 이미 로그가 구현되어 있지만, 더 자세한 로그를 원하면:

```typescript
// utils/iapManager.ts
// Line 224에서 requestSubscription 호출 전:
console.log('🔍 DEBUG: Product ID:', productId);
console.log('🔍 DEBUG: Platform:', Platform.OS);
console.log('🔍 DEBUG: RNIap available:', !!RNIap);
```

---

## 📋 **체크리스트**

구매 실패 문제 해결을 위한 단계별 체크리스트:

### **App Store Connect 설정**
- [ ] **Paid Applications Agreement 서명 완료**
- [ ] **은행 계좌 정보 입력 완료**
- [ ] **세금 정보 입력 완료**
- [ ] **Subscription Group 생성**
- [ ] **Product ID 생성**: `tarot_timer_monthly`, `tarot_timer_yearly`
- [ ] **상품 상태**: Ready to Submit 또는 Approved
- [ ] **가격 설정 완료**
- [ ] **Localizations 설정 완료** (한국어/영어)
- [ ] **Review Information 업로드** (스크린샷)

### **TestFlight 설정**
- [ ] **Sandbox Tester 계정 생성**
- [ ] **iPhone에 Sandbox 계정 로그인**
- [ ] **TestFlight 빌드 IAP 활성화**

### **앱 코드 설정**
- [ ] **Bundle Identifier 일치**: `com.tarottimer.app`
- [ ] **Product ID 일치**: `tarot_timer_monthly`, `tarot_timer_yearly`
- [ ] **react-native-iap 설치 확인**: `npm list react-native-iap`

### **디버깅**
- [ ] **Xcode Console에서 IAP 로그 확인**
- [ ] **에러 메시지 확인**
- [ ] **네트워크 연결 확인**

---

## 🎯 **가장 가능성 높은 원인**

TestFlight 환경에서 IAP 구매 실패의 **가장 흔한 원인 Top 4**:

### **1. ⚠️ BUILD 102: react-native-iap API 사용 불가 에러** (현재 확인됨)
**증상**:
```
❌ 구매 오류: react-native-iap API 사용 불가
```

**원인**:
- Build 102가 react-native-iap 네이티브 링크가 완료되기 전에 빌드됨
- 또는 EAS Build 캐시 문제로 네이티브 모듈이 제대로 포함되지 않음

**해결**:
```bash
# Build 103 생성 (네이티브 모듈 재링크)
npx pod-install ios  # 로컬에서 먼저 확인
npm run build:prod:ios
```

**확인 사항**:
- ✅ `ios/Podfile.lock`에 `NitroIap` 포함 확인됨
- ✅ `android/` 폴더 존재 확인됨
- ✅ 코드는 정상 구현됨

→ **새 빌드 생성 필요!**

---

### **2. App Store Connect에 Product ID가 생성되지 않음** (90%)
→ App Store Connect → Subscriptions에서 `tarot_timer_monthly`, `tarot_timer_yearly` 생성 필요

### **3. Sandbox Tester 계정 미설정** (5%)
→ Sandbox Tester 계정 생성 후 iPhone 설정에서 로그인 필요

### **4. Paid Applications Agreement 미서명** (5%)
→ App Store Connect → Agreements, Tax, and Banking 섹션 완료 필요

---

## 💡 **다음 단계**

1. **즉시 확인**: App Store Connect → Subscriptions에 Product ID가 있는지 확인
2. **없다면**: 위 "Step 1: 인앱 구매 상품 생성" 가이드 따라 생성
3. **있다면**: Sandbox Tester 계정 설정 확인
4. **모두 완료했다면**: Xcode Console 로그로 정확한 에러 메시지 확인

---

## 📞 **추가 지원**

여전히 문제가 해결되지 않으면:
1. **Xcode Console 로그** 전체 복사
2. **App Store Connect Subscription 스크린샷** 제공
3. Claude Code에게 공유

---

**마지막 업데이트**: 2025-10-27
**작성자**: Claude Code AI Assistant
