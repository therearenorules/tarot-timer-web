# App Store Connect 구독 상품 상태 체크리스트

## 🔍 반드시 확인해야 할 사항

### 1. V1 vs V2 Product IDs 상태

#### V1 Product IDs (구버전 - 예전에 동작했던 것)
```
Product ID: tarot_timer_monthly
상태: [    ] Ready to Submit / [    ] Approved / [    ] Deleted
Apple ID: ____________

Product ID: tarot_timer_yearly
상태: [    ] Ready to Submit / [    ] Approved / [    ] Deleted
Apple ID: ____________
```

#### V2 Product IDs (현재 사용 중)
```
Product ID: tarot_timer_monthly_v2
상태: [    ] Ready to Submit / [    ] Approved / [    ] Deleted / [    ] 존재하지 않음
Apple ID: 6754749911 (코드에 명시됨)

Product ID: tarot_timer_yearly_v2
상태: [    ] Ready to Submit / [    ] Approved / [    ] Deleted / [    ] 존재하지 않음
Apple ID: 6755033513 (코드에 명시됨)
```

### 2. 구독 그룹 상태

#### Subscription Group V1 (구버전)
```
그룹 이름: ____________________
그룹 ID: ____________________
상태: [    ] Active / [    ] Deleted
포함된 상품: [    ] tarot_timer_monthly, tarot_timer_yearly
```

#### Subscription Group V2 (현재 사용)
```
그룹 이름: Tarot Timer Premium V2
그룹 ID: 21820675 (코드에 명시됨)
상태: [    ] Active / [    ] Deleted / [    ] 존재하지 않음
포함된 상품: [    ] tarot_timer_monthly_v2, tarot_timer_yearly_v2
```

### 3. 유료 앱 계약 (Paid Applications Agreement)

```
[    ] 계약 상태: Active
[    ] 은행 계좌 등록 완료
[    ] 세금 정보 등록 완료
[    ] 연락처 정보 등록 완료
```

### 4. 앱 정보

```
Bundle ID: com.tarottimer.app (확인 필요)
App ID: 6752687014 (확인 필요)
Team ID: 763D2L2X4L (확인 필요)
```

---

## ❓ 진단 질문

### Q1. 예전에 가격이 표시되었을 때 어떤 빌드였나요?
- Build 번호: ____________
- 대략적인 시기: ____________

### Q2. V2 Product IDs를 언제 생성했나요?
- [ ] 최근에 생성 (1-2주 이내)
- [ ] 오래 전에 생성 (1개월 이상)
- [ ] 확실하지 않음

### Q3. V2 Product IDs가 "승인됨(Approved)" 상태인가요?
- [ ] 예
- [ ] 아니오
- [ ] 확인 필요

### Q4. V1 Product IDs는 아직 존재하나요?
- [ ] 예, 아직 있음
- [ ] 아니오, 삭제됨
- [ ] 확인 필요

---

## 🎯 해결 방안

### 방안 A: V2 Product IDs가 없거나 미승인 상태인 경우

**조치:** V1 Product IDs로 되돌리기

```typescript
// utils/iapManager.ts 수정
export const SUBSCRIPTION_SKUS = {
  monthly: Platform.select({
    ios: 'tarot_timer_monthly', // V1으로 되돌림
    android: 'tarot_timer_monthly',
    default: 'tarot_timer_monthly'
  }),
  yearly: Platform.select({
    ios: 'tarot_timer_yearly', // V1으로 되돌림
    android: 'tarot_timer_yearly',
    default: 'tarot_timer_yearly'
  })
};
```

### 방안 B: V2 Product IDs가 존재하지만 승인 대기 중

**조치:** App Store Connect에서 V2 상품 승인 후 48시간 대기

1. App Store Connect → 앱 → In-App Purchases
2. tarot_timer_monthly_v2 → "Submit for Review"
3. tarot_timer_yearly_v2 → "Submit for Review"
4. 승인 후 48시간 동기화 대기

### 방안 C: V2 Product IDs가 정상이지만 Config Plugin 누락으로 인한 문제

**조치:** Build 126에서 해결됨
- Config Plugin 추가 완료 ✅
- Event Listeners 구현 완료 ✅

---

## 📝 체크리스트 작성 후 다음 단계

위 체크리스트를 작성한 후:

1. **V1 Product IDs가 정상 동작했다면** → V1으로 되돌리는 것이 가장 빠른 해결책
2. **V2 Product IDs를 반드시 사용해야 한다면** → App Store Connect에서 승인 상태 확인 필요
3. **Config Plugin 문제였다면** → Build 126에서 해결됨
