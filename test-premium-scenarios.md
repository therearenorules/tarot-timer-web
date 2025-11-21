# 프리미엄 구독 시스템 테스트 시나리오

## 📋 테스트 범위

### 1. 플랫폼별 동작
- iOS (TestFlight Sandbox)
- Android (베타 테스터 - 무료 프리미엄)
- Web (IAP 비활성화)

### 2. 사용자 상태
- 신규 사용자
- 무료 체험 중인 사용자
- 유료 구독 중인 사용자
- 구독 만료된 사용자
- 구독 복원 시도 사용자

---

## 🧪 테스트 시나리오

### A. 초기화 및 상품 로드 (IAP Initialization)

#### A1. 정상 초기화 시나리오
**Given**: 앱 최초 실행 (iOS)
**When**: PremiumContext.initializePremium() 실행
**Expected**:
```typescript
✅ IAP 연결 성공
✅ fetchProducts({ skus: ['tarot_timer_monthly', 'tarot_timer_yearly'], type: 'subs' }) 성공
✅ 2개 상품 로드 완료
✅ SubscriptionPlans에서 실제 가격 표시 (₩6,600 / ₩49,000)
```

**Validation Points**:
- `IAPManager.initialized === true`
- `IAPManager.products.length === 2`
- `products[0].localizedPrice` 포맷 정상 (₩ 기호 포함)
- `products[1].subscriptionOfferDetails` 존재 (Android)

#### A2. 상품 로드 실패 시나리오
**Given**: 네트워크 오류 또는 App Store Connect 문제
**When**: fetchProducts() 실패
**Expected**:
```typescript
❌ 상품 로드 실패 (1차 시도)
🔄 재시도 1/3... (2초 대기)
🔄 재시도 2/3... (2초 대기)
🔄 재시도 3/3... (2초 대기)
⚠️ 최종 실패 → SubscriptionPlans에서 기본 가격 표시
```

**Validation Points**:
- 재시도 로직 3회 실행 확인
- 기본 가격 표시: `defaultProducts` 사용
- 사용자에게 오류 메시지 표시 안 함 (UX)

#### A3. Web 환경 초기화
**Given**: Platform.OS === 'web'
**When**: initializePremium() 실행
**Expected**:
```typescript
📌 IAP 없이 계속 진행
✅ 무료 체험 상태만 로드
⚠️ 구독 구매 버튼 비활성화
```

---

### B. 구독 구매 플로우 (Purchase Flow)

#### B1. 정상 구매 시나리오 (iOS Sandbox)
**Given**: 사용자가 월간 구독 선택
**When**: purchaseSubscription('tarot_timer_monthly') 실행
**Expected**:
```typescript
1. 💳 구독 구매 시작
2. 🔐 StoreKit 팝업 표시 (Face ID / Touch ID)
3. ✅ 결제 승인
4. 📝 purchaseUpdatedListener 이벤트 수신
5. 🔄 영수증 검증 (ReceiptValidator.validateAndSyncPurchase)
6. 💾 Supabase 동기화
7. ⏳ 1초 딜레이 (Sandbox 전파 대기)
8. 🔄 refreshStatus() 재시도 로직 (최대 2회)
9. ✅ premiumStatus.is_premium = true
10. 🎉 구독 성공 콜백 실행
```

**Validation Points**:
- `purchaseUpdatedListener` 정상 작동
- `receipt` 데이터 존재
- Supabase `purchases` 테이블에 레코드 삽입
- `premiumStatus.subscription_type === 'monthly'`
- `premiumStatus.expiry_date` 정확한 만료일

#### B2. 사용자 취소 시나리오
**Given**: 사용자가 구매 팝업에서 "취소" 선택
**When**: StoreKit 취소
**Expected**:
```typescript
❌ purchaseErrorListener 이벤트 수신
✅ errorCode === 'user-cancelled' 또는 'E_USER_CANCELLED'
⚠️ "구매가 취소되었습니다" 메시지 표시
🔄 isPurchasing = false (로딩 상태 해제)
```

**Validation Points**:
- 타임아웃 에러 발생 안 함
- 사용자에게 적절한 메시지 표시
- 상태가 정상적으로 롤백

#### B3. 이미 구독 중인 사용자가 재구매 시도
**Given**: isPremium === true (현재 구독 활성)
**When**: 동일 상품 재구매 시도
**Expected**:
```typescript
⚠️ "현재 구독 중입니다" 다이얼로그 표시
❌ requestPurchase() 실행 안 함
✅ 사용자 혼란 방지
```

**Validation Points**:
- `checkExistingSubscription()` 정상 작동
- 중복 구매 방지

#### B4. 네트워크 오류로 영수증 검증 실패
**Given**: 구매 성공했지만 Supabase 통신 실패
**When**: validateAndSyncPurchase() 타임아웃
**Expected**:
```typescript
✅ 구매 자체는 성공 (Apple 서버에 기록)
❌ Supabase 동기화 실패
⚠️ 다음 앱 실행 시 자동 복원 (periodicValidation)
```

**Validation Points**:
- 로컬 영수증 저장 확인
- 다음 실행 시 복원 가능

---

### C. 구독 복원 플로우 (Restore Purchases)

#### C1. 정상 복원 시나리오
**Given**: 이전에 구매한 사용자가 앱 재설치
**When**: restorePurchases() 실행
**Expected**:
```typescript
🔄 구매 복원 시작
📱 getAvailablePurchases() 호출
✅ 이전 구매 내역 발견
🔄 영수증 검증 및 Supabase 동기화
✅ premiumStatus.is_premium = true
🎉 "구독이 복원되었습니다" 메시지
```

**Validation Points**:
- `availablePurchases.length > 0`
- 만료일 정확히 복원
- 구독 타입 정확히 복원

#### C2. 복원할 구매 내역 없음
**Given**: 구매한 적 없는 사용자
**When**: restorePurchases() 실행
**Expected**:
```typescript
🔄 구매 복원 시작
📱 getAvailablePurchases() 호출
⚠️ availablePurchases.length === 0
❌ "복원할 구매 내역이 없습니다" 메시지
```

---

### D. 상태 동기화 (State Synchronization)

#### D1. IAP + Supabase 양방향 동기화
**Given**: 다른 기기에서 구독 구매
**When**: refreshStatus() 실행
**Expected**:
```typescript
1. 📱 IAPManager.checkSubscriptionStatus() - 로컬 영수증 확인
2. 🔄 ReceiptValidator.periodicValidation() - Supabase 서버 상태 확인
3. ✅ 둘 중 하나라도 프리미엄이면 활성화
4. 💾 우선순위: IAP > Supabase
```

**Validation Points**:
- 5초 타임아웃 정상 작동
- 상태 우선순위 정확

#### D2. Supabase 동기화 타임아웃
**Given**: 네트워크 느림 (5초 이상)
**When**: periodicValidation() 실행
**Expected**:
```typescript
⏱️ Supabase 동기화 타임아웃 - 건너뜀
✅ IAP 상태만으로 계속 진행
⚠️ 다음 갱신 시 재시도
```

---

### E. 플랫폼별 특수 케이스

#### E1. Android 베타 테스터
**Given**: Platform.OS === 'android'
**When**: 앱 실행
**Expected**:
```typescript
✅ isPremium = true (무조건)
✅ canAccessFeature('unlimited_storage') = true
✅ 모든 프리미엄 기능 접근 가능
⚠️ 구독 구매 UI 숨김 (불필요)
```

#### E2. iOS Sandbox 환경
**Given**: TestFlight 빌드
**When**: 구매 후 영수증 검증
**Expected**:
```typescript
✅ Sandbox 영수증 정상 처리
✅ environment === 'Sandbox'
⚠️ 만료 시간: 실제 1개월 → Sandbox 5분 (테스트용)
```

#### E3. Web 환경 구독 시도
**Given**: Platform.OS === 'web'
**When**: 구독 버튼 클릭
**Expected**:
```typescript
⚠️ "모바일 앱에서만 구독 가능" 메시지
❌ IAP 함수 호출 안 함
```

---

### F. 엣지 케이스 (Edge Cases)

#### F1. 구독 만료 직전 사용자
**Given**: expiry_date - now === 1일
**When**: daysUntilExpiry() 호출
**Expected**:
```typescript
✅ daysUntilExpiry() === 1
⚠️ "구독이 1일 후 만료됩니다" 알림 표시
✅ 갱신 유도 UI
```

#### F2. 앱 실행 중 구독 만료
**Given**: 앱 실행 중 expiry_date 지남
**When**: 시간 경과
**Expected**:
```typescript
⚠️ 백그라운드 타이머로 주기적 체크 필요 (현재 미구현)
❌ 즉시 반영 안 될 수 있음
🔄 다음 refreshStatus() 호출 시 반영
```

#### F3. 동시 구매 요청 (Race Condition)
**Given**: purchaseSubscription() 실행 중
**When**: 사용자가 다시 구매 버튼 클릭
**Expected**:
```typescript
✅ isLoading === true로 버튼 비활성화
❌ 중복 requestPurchase() 호출 방지
```

#### F4. 영수증 검증 중 앱 종료
**Given**: 구매 완료 후 검증 진행 중
**When**: 사용자가 앱 강제 종료
**Expected**:
```typescript
✅ 다음 실행 시 purchaseUpdatedListener 재실행
✅ finishTransaction 미완료 상태로 남아 있음
🔄 자동 재처리
```

---

## 🔍 검증 포인트 체크리스트

### API 호환성
- [ ] `fetchProducts({ skus, type: 'subs' })` 정상 작동
- [ ] `requestPurchase()` 이벤트 기반 처리 정상
- [ ] `getAvailablePurchases()` 복원 정상
- [ ] `finishTransaction()` 정상 완료

### 오류 처리
- [ ] 네트워크 오류 시 재시도 로직
- [ ] 사용자 취소 감지 (user-cancelled)
- [ ] 타임아웃 처리 (5초)
- [ ] Supabase 동기화 실패 시 로컬 상태 유지

### 상태 관리
- [ ] isPremium 정확한 계산
- [ ] expiry_date 정확한 저장/복원
- [ ] subscription_type 정확한 저장
- [ ] 플랫폼별 조건부 로직 정상

### 사용자 경험
- [ ] 로딩 상태 표시
- [ ] 오류 메시지 명확
- [ ] 구매 성공 피드백
- [ ] 중복 구매 방지

---

## 🚀 실제 테스트 방법

### 1. iOS Sandbox 테스트
```bash
# TestFlight Build 150 사용
1. TestFlight 앱에서 실행
2. 설정 > 프리미엄 구독
3. 월간 구독 선택
4. Sandbox 계정으로 로그인 (설정 > App Store > Sandbox Account)
5. 결제 진행
6. 콘솔 로그 확인
```

### 2. Android 베타 테스트
```bash
# Google Play Console 내부 테스트
1. 내부 테스트 트랙 빌드 설치
2. isPremium === true 확인
3. 모든 프리미엄 기능 접근 확인
```

### 3. 복원 테스트
```bash
1. 앱 삭제
2. 재설치
3. "구독 복원" 버튼 클릭
4. 상태 복원 확인
```

### 4. 상태 동기화 테스트
```bash
1. 기기 A에서 구독 구매
2. 기기 B에서 같은 계정으로 로그인
3. refreshStatus() 실행
4. 동기화 확인
```

---

## 📊 예상 결과 매트릭스

| 시나리오 | iOS | Android | Web | 예상 결과 |
|---------|-----|---------|-----|----------|
| 상품 로드 | ✅ | ✅ | ⚠️ | iOS/Android 성공, Web 건너뜀 |
| 구매 실행 | ✅ | ✅ | ❌ | iOS/Android 성공, Web 불가 |
| 사용자 취소 | ✅ | ✅ | - | 정상 처리 |
| 복원 | ✅ | ✅ | ⚠️ | iOS/Android 성공 |
| Supabase 동기화 | ✅ | ✅ | ✅ | 모든 플랫폼 성공 |
| 베타 무료 프리미엄 | ❌ | ✅ | ❌ | Android만 활성 |

---

## 🐛 알려진 이슈 및 해결 방법

### Issue #1: "undefined is not a function" (상품 로드)
- **원인**: v13.x `getSubscriptions` 사용
- **해결**: v14.x `fetchProducts({ skus, type: 'subs' })` 사용
- **커밋**: 713e7e9

### Issue #2: 사용자 취소 시 TIMEOUT_ERROR
- **원인**: v14.x 오류 코드 'user-cancelled' 미감지
- **해결**: 양쪽 코드 모두 체크
- **커밋**: a321cc5

### Issue #3: Supabase 동기화 "periodicValidation of undefined"
- **원인**: 기본 import vs named export 불일치
- **해결**: `import { ReceiptValidator }`로 수정
- **커밋**: a321cc5

---

**마지막 업데이트**: 2025-11-21
**테스트 빌드**: iOS Build 150, Android Build 104
