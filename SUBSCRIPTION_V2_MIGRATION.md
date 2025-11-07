# 구독 시스템 V2 마이그레이션 가이드

**작성일**: 2025-10-31
**변경 사유**: 프로덕션 구독 로딩 문제 해결을 위한 새 구독 그룹 생성
**영향 범위**: iOS + Android 구독 시스템 전체

---

## 📋 변경 사항 요약

### 이전 (V1) → 새로운 (V2)

| 항목 | V1 (이전) | V2 (신규) |
|------|----------|----------|
| **Subscription Group** | Tarot Timer Premium | Tarot Timer Premium V2 |
| **Group ID** | 21809126 | 21820675 |
| **월간 구독 Product ID** | tarot_timer_monthly | tarot_timer_monthly_v2 |
| **월간 구독 Apple ID** | 6738248438 | 6754749911 |
| **연간 구독 Product ID** | tarot_timer_yearly | tarot_timer_yearly_v2 |
| **연간 구독 Apple ID** | 6738248622 | 6755033513 |

---

## 🔄 코드 변경 사항

### 1. utils/iapManager.ts

#### Before:
```typescript
export const SUBSCRIPTION_SKUS = {
  monthly: Platform.select({
    ios: 'tarot_timer_monthly',
    android: 'tarot_timer_monthly',
    default: 'tarot_timer_monthly'
  }),
  yearly: Platform.select({
    ios: 'tarot_timer_yearly',
    android: 'tarot_timer_yearly',
    default: 'tarot_timer_yearly'
  })
} as const;
```

#### After:
```typescript
// Subscription Group: Tarot Timer Premium V2 (ID: 21820675)
export const SUBSCRIPTION_SKUS = {
  monthly: Platform.select({
    ios: 'tarot_timer_monthly_v2', // Apple ID: 6754749911
    android: 'tarot_timer_monthly_v2',
    default: 'tarot_timer_monthly_v2'
  }),
  yearly: Platform.select({
    ios: 'tarot_timer_yearly_v2', // Apple ID: 6755033513
    android: 'tarot_timer_yearly_v2',
    default: 'tarot_timer_yearly_v2'
  })
} as const;
```

---

### 2. TarotTimer.storekit (Xcode StoreKit Configuration)

#### Before:
```json
{
  "subscriptionGroups": [
    {
      "id": "21809126",
      "name": "Tarot Timer Premium",
      "subscriptions": [
        {
          "internalID": "6738248438",
          "productID": "tarot_timer_monthly",
          "subscriptionGroupID": "21809126"
        },
        {
          "internalID": "6738248622",
          "productID": "tarot_timer_yearly",
          "subscriptionGroupID": "21809126"
        }
      ]
    }
  ]
}
```

#### After:
```json
{
  "subscriptionGroups": [
    {
      "id": "21820675",
      "name": "Tarot Timer Premium V2",
      "subscriptions": [
        {
          "internalID": "6754749911",
          "productID": "tarot_timer_monthly_v2",
          "subscriptionGroupID": "21820675"
        },
        {
          "internalID": "6755033513",
          "productID": "tarot_timer_yearly_v2",
          "subscriptionGroupID": "21820675"
        }
      ]
    }
  ]
}
```

---

### 3. utils/receiptValidator.ts

#### Before:
```typescript
productId: currentStatus.subscription_type === 'yearly'
  ? 'tarot_timer_yearly'
  : 'tarot_timer_monthly',
```

#### After:
```typescript
productId: currentStatus.subscription_type === 'yearly'
  ? 'tarot_timer_yearly_v2'
  : 'tarot_timer_monthly_v2',
```

---

### 4. components/PremiumTest.tsx

#### Before:
```typescript
const mockReceipt = JSON.stringify({
  transactionId: 'test-transaction-123',
  productId: 'tarot_timer_monthly',
  purchaseDate: Date.now()
});
```

#### After:
```typescript
const mockReceipt = JSON.stringify({
  transactionId: 'test-transaction-123',
  productId: 'tarot_timer_monthly_v2',
  purchaseDate: Date.now()
});
```

---

## ⚠️ 중요 사항

### 1. 기존 구독자 영향
- **V1 구독자**: 기존 Product ID로 계속 구독 유지
- **신규 구독자**: V2 Product ID로만 구독 가능
- **마이그레이션 불필요**: 두 버전 공존 가능

### 2. App Store Connect 설정

#### 필수 확인 사항:
- [ ] V2 Subscription Group 생성 완료
- [ ] V2 구독 상품 2개 생성 완료
  - [ ] `tarot_timer_monthly_v2` (Apple ID: 6754749911)
  - [ ] `tarot_timer_yearly_v2` (Apple ID: 6755033513)
- [ ] 모든 구독 상품 "Cleared for Sale" 체크
- [ ] 메타데이터 완료 (설명, 가격, 스크린샷)
- [ ] 계약 서명 완료 (Paid Apps Agreement)

### 3. Google Play Console 설정

#### Android 구독 설정:
- [ ] V2 구독 상품 생성
  - [ ] `tarot_timer_monthly_v2`
  - [ ] `tarot_timer_yearly_v2`
- [ ] 가격 설정 (iOS와 동일)
- [ ] 구독 혜택 설명 작성

---

## 🧪 테스트 계획

### TestFlight 테스트
1. **V2 구독 구매 테스트**
   - [ ] 월간 구독 구매
   - [ ] 연간 구독 구매
   - [ ] 구매 복원

2. **V1 → V2 공존 테스트**
   - [ ] V1 구독자는 계속 프리미엄 유지
   - [ ] 신규 사용자는 V2로만 구매 가능

3. **영수증 검증 테스트**
   - [ ] V2 영수증 검증 정상 작동
   - [ ] 주기적 재검증 정상 작동

### 프로덕션 배포 전 체크리스트
- [ ] App Store Connect 설정 완료
- [ ] Google Play Console 설정 완료
- [ ] TestFlight 전체 테스트 통과
- [ ] 24-48시간 대기 (Apple 서버 전파)
- [ ] 실제 계정으로 프로덕션 구매 테스트

---

## 📊 롤백 계획

만약 V2에서 문제 발생 시:

### 긴급 롤백 절차
1. `utils/iapManager.ts` 원복
2. `TarotTimer.storekit` 원복
3. 긴급 빌드 및 배포
4. V1 구독은 계속 작동 (영향 없음)

### 롤백 코드
```typescript
// 롤백 시 적용할 코드
export const SUBSCRIPTION_SKUS = {
  monthly: Platform.select({
    ios: 'tarot_timer_monthly', // V1 원복
    android: 'tarot_timer_monthly',
    default: 'tarot_timer_monthly'
  }),
  yearly: Platform.select({
    ios: 'tarot_timer_yearly', // V1 원복
    android: 'tarot_timer_yearly',
    default: 'tarot_timer_yearly'
  })
} as const;
```

---

## 📈 성공 지표

### V2 마이그레이션 성공 기준
- ✅ TestFlight에서 V2 구독 정상 구매
- ✅ 프로덕션에서 V2 구독 정상 구매
- ✅ 영수증 검증 성공률 ≥ 99%
- ✅ V1 구독자 영향 없음
- ✅ 구독 로딩 실패 오류 해결

---

## 📚 관련 문서
- [IOS_SUBSCRIPTION_PRODUCTION_ISSUE_ANALYSIS.md](./IOS_SUBSCRIPTION_PRODUCTION_ISSUE_ANALYSIS.md)
- [analysis/01-development-progress-report.md](./analysis/01-development-progress-report.md)

---

**문서 버전**: v1.0.0
**최종 업데이트**: 2025-10-31
**작성자**: Claude Code
**상태**: ✅ 코드 변경 완료 - App Store Connect 설정 대기
