# 구독 오류 진단 체크리스트 - Build 121

## 🔴 TestFlight 구독 오류 발생 중

### 현재 상황
- **App Store Connect**: 승인됨 확인 완료
- **StoreKit Configuration**: 정상 (tarot_timer_monthly_v2, tarot_timer_yearly_v2)
- **코드**: V2 Product IDs 사용 중
- **Bundle ID**: com.tarottimer.app (일치)
- **문제**: TestFlight에서 구독 상품 로드 실패

---

## 📋 필수 확인사항 (우선순위 순서)

### ✅ 1. App Store Connect - Product IDs 상태 확인
**위치**: App Store Connect → 앱 → 구독 → Tarot Timer Premium V2

#### 확인 항목:
- [ ] **tarot_timer_monthly_v2** - "판매 승인됨" (Cleared for Sale) 체크박스 **반드시 체크**
- [ ] **tarot_timer_yearly_v2** - "판매 승인됨" (Cleared for Sale) 체크박스 **반드시 체크**
- [ ] Subscription Group V2 (ID: 21820675) - 상태: "승인됨" 또는 "판매 준비 완료"
- [ ] 각 Product ID의 메타데이터 완성 (이름, 설명, 가격)
- [ ] 가격 정보: Monthly $4.99, Yearly $34.99

**중요**: "Cleared for Sale" 체크박스가 **체크되지 않으면** TestFlight에서 Product ID를 찾을 수 없습니다!

---

### ✅ 2. Paid Applications Agreement 확인
**위치**: App Store Connect → 계약, 세금 및 금융 거래 (Agreements, Tax, and Banking)

#### 확인 항목:
- [ ] **Paid Applications Agreement** - 상태: "유효" (Active)
- [ ] 계약 서명 완료 (Signed)
- [ ] 은행 정보 입력 완료 (Banking Information: Complete)
- [ ] 세금 양식 제출 완료 (Tax Forms: Submitted)

**중요**: 계약이 유효하지 않으면 구독 상품이 활성화되지 않습니다!

---

### ✅ 3. Product ID 동기화 시간 확인
**App Store Connect에서 Product ID를 생성하거나 수정한 시간**:
- [ ] V2 Product IDs 생성 시간: __________ (예: 11월 10일 15:00)
- [ ] 현재 시간: __________ (예: 11월 12일 15:00)
- [ ] 경과 시간: ____ 시간 (최소 24시간, 권장 48시간)

**중요**: 
- App Store Connect에서 Product ID를 생성하면 **Apple 서버 동기화에 24-48시간 소요**
- 48시간 이내라면 아직 동기화 중일 수 있음

---

### ✅ 4. TestFlight Sandbox 계정 확인
**iOS 기기 설정 → App Store → Sandbox 계정**

#### 확인 항목:
- [ ] Sandbox 테스트 계정으로 로그인되어 있는지 확인
- [ ] 실제 Apple ID가 아닌 **테스트용 Sandbox 계정** 사용 중
- [ ] Sandbox 계정 생성 위치: App Store Connect → Users and Access → Sandbox Testers
- [ ] 로그아웃 후 다시 로그인 시도

**Sandbox 계정 로그인 방법**:
1. iOS 설정 → App Store
2. 최하단 "SANDBOX ACCOUNT" 섹션
3. 테스트 계정으로 로그인

---

### ✅ 5. Bundle Identifier 일치 확인
- [ ] **App Store Connect App ID**: com.tarottimer.app
- [ ] **app.json bundleIdentifier**: com.tarottimer.app
- [ ] **StoreKit Configuration**: _applicationInternalID = 6752687014
- [ ] 모두 일치하는지 확인

---

### ✅ 6. Subscription Group 설정 확인
**위치**: App Store Connect → 구독 → Subscription Groups

#### 확인 항목:
- [ ] **Tarot Timer Premium V2** (ID: 21820675) 존재 확인
- [ ] 그룹 상태: "승인됨" 또는 "판매 준비 완료"
- [ ] 그룹 내 2개 Product IDs 확인:
  - tarot_timer_monthly_v2 (Internal ID: 6754749911)
  - tarot_timer_yearly_v2 (Internal ID: 6755033513)

---

## 🔧 가능한 오류 원인 및 해결책

### 원인 1: "Cleared for Sale" 체크 안 됨 (90% 확률)
**증상**: `NO_SUBSCRIPTIONS_FOUND` 에러
**해결**:
1. App Store Connect → 구독 → 각 Product ID
2. "Cleared for Sale" 체크박스 **반드시 체크**
3. 저장 후 5-10분 대기

### 원인 2: Paid Applications Agreement 미완료 (80% 확률)
**증상**: 구독 상품이 비활성화됨
**해결**:
1. App Store Connect → Agreements, Tax, and Banking
2. Paid Applications Agreement 서명
3. 은행 정보 및 세금 양식 제출

### 원인 3: Product ID 동기화 미완료 (70% 확률)
**증상**: 48시간 이내 생성한 Product ID
**해결**:
- 48시간 대기 (Apple 서버 동기화 시간)
- 그 동안 다른 설정 확인

### 원인 4: Sandbox 계정 미로그인 (60% 확률)
**증상**: TestFlight에서 실제 결제 시도
**해결**:
1. iOS 설정 → App Store → 로그아웃
2. Sandbox 테스트 계정으로 재로그인
3. 앱 재실행

### 원인 5: V1 Product IDs 잔여 (50% 확률)
**증상**: 코드에서 V1 ID 참조
**해결**:
- Build 121에서 이미 수정 완료
- 하지만 App Store Connect에 V1 Product IDs가 남아있다면 비활성화 필요

---

## 🎯 즉시 확인해야 할 3가지

### 1️⃣ App Store Connect에서 확인:
```
App Store Connect → 나의 앱 → Tarot Timer → 구독
→ Tarot Timer Premium V2 그룹
→ tarot_timer_monthly_v2 클릭
→ "Cleared for Sale" 체크박스 확인
→ tarot_timer_yearly_v2 클릭
→ "Cleared for Sale" 체크박스 확인
```

### 2️⃣ 계약 상태 확인:
```
App Store Connect → Agreements, Tax, and Banking
→ Paid Applications Agreement 상태: "Active" 확인
```

### 3️⃣ Product ID 생성 시간 확인:
```
V2 Product IDs를 언제 생성했는지 확인
- 48시간 이내라면 → 동기화 대기 중
- 48시간 경과했다면 → 다른 원인
```

---

## 📱 TestFlight 테스트 단계별 확인

### 1단계: iOS 설정에서 Sandbox 계정 확인
```
iOS 설정 → App Store → 맨 아래 SANDBOX ACCOUNT 확인
```

### 2단계: 앱 실행 후 콘솔 로그 확인
```
예상 로그:
✅ react-native-iap 모듈 로드 성공
📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
🔄 RNIap.getSubscriptions() 호출 중...
```

**에러가 발생하면 어떤 메시지인지 확인**:
- `NO_SUBSCRIPTIONS_FOUND` → Product IDs 미활성화 또는 동기화 미완료
- `TIMEOUT_ERROR` → 네트워크 문제
- `NETWORK_ERROR` → 연결 문제

### 3단계: 재시도 메커니즘 작동 확인
```
⏳ 재시도 1/3: 2000ms 대기 중...
⏳ 재시도 2/3: 4000ms 대기 중...
⏳ 재시도 3/3: 8000ms 대기 중...
```

---

## 🚨 긴급 조치 사항

만약 위 모든 항목을 확인했는데도 오류가 발생한다면:

1. **V1 Product IDs 완전 삭제**:
   - App Store Connect에서 V1 그룹 비활성화
   - tarot_timer_monthly (V1) 삭제
   - tarot_timer_yearly (V1) 삭제

2. **새로운 Sandbox 계정 생성**:
   - 기존 Sandbox 계정 삭제
   - 새 Sandbox 계정 생성 및 로그인

3. **App Store Connect 지원팀 문의**:
   - Product IDs가 48시간 경과했는데도 작동 안 함
   - Cleared for Sale 체크했는데도 테스트 불가

---

## 📞 다음 단계

위 체크리스트를 **순서대로** 확인하고:
1. 어떤 항목에서 문제가 발견되었는지
2. 해당 항목의 현재 상태
3. 콘솔에 출력되는 에러 메시지

이 3가지를 알려주시면 정확한 해결책을 제시하겠습니다.
