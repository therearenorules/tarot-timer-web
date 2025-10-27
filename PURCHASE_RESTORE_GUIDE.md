# 구매 복원 기능 가이드

## 📱 **"구매 복원" 버튼이란?**

"구매 복원" 버튼은 **이미 구매한 구독을 다른 기기나 재설치 후에 다시 활성화**하는 기능입니다.

---

## 🎯 **언제 사용하나요?**

### **사용해야 하는 경우:**

1. **앱을 삭제하고 다시 설치한 경우**
   - 앱 재설치 시 구독 정보가 사라짐
   - "구매 복원"으로 기존 구독 되찾기

2. **새 iPhone으로 기기 변경한 경우**
   - **같은 Apple ID**를 사용하는 경우만 가능
   - 새 기기에서 "구매 복원" 클릭

3. **프리미엄 상태가 사라진 경우**
   - 구독은 활성화되어 있는데 앱에서 무료 버전으로 표시될 때
   - 동기화 오류 해결

4. **앱 업데이트 후 구독 상태가 초기화된 경우**
   - 업데이트 후 프리미엄 기능이 잠긴 경우

### **사용하지 않는 경우:**

❌ **새로 구독하려는 경우**
→ "구독 시작" 버튼 사용

❌ **구독이 만료된 경우**
→ "구매 복원"은 만료된 구독을 연장하지 않습니다. 새로 구독 필요.

❌ **다른 Apple ID로 구매한 경우**
→ 구매 복원은 **같은 Apple ID**에서만 작동합니다.

---

## 🔄 **"구매 복원" 동작 방식**

### **정상 작동 시나리오:**

#### **시나리오 1: 구독이 있는 경우** ✅
```
1. 사용자가 "구매 복원" 버튼 클릭
2. Apple App Store에 구매 내역 조회 요청
3. App Store가 이 Apple ID로 구매한 구독 반환
   - tarot_timer_monthly (활성화 상태)
   또는
   - tarot_timer_yearly (활성화 상태)
4. 앱이 구독 정보를 AsyncStorage에 저장
5. ✅ 알림 표시:
   제목: "복원 완료"
   내용: "이전 구매가 성공적으로 복원되었습니다!"
6. 프리미엄 기능 즉시 활성화
7. 구독 화면 자동 닫힘
```

**사용자가 보는 것:**
- ✅ 성공 알림 (초록색 체크)
- 설정 탭에서 "프리미엄 활성화됨" 표시
- 모든 프리미엄 기능 사용 가능

---

#### **시나리오 2: 구독이 없는 경우** ⚠️
```
1. 사용자가 "구매 복원" 버튼 클릭
2. Apple App Store에 구매 내역 조회 요청
3. App Store가 빈 배열 반환 (구매 내역 없음)
4. ⚠️ 알림 표시:
   제목: "구매 내역 없음"
   내용: "복원할 구매 내역을 찾을 수 없습니다."
5. 화면 그대로 유지 (닫히지 않음)
```

**사용자가 보는 것:**
- ⚠️ 정보 알림 (노란색 아이콘)
- "이 Apple ID로 구매한 구독이 없습니다"라는 의미
- 구독 화면에 그대로 남아서 새로 구독 가능

---

#### **시나리오 3: 구독이 만료된 경우** ⚠️
```
1. 사용자가 "구매 복원" 버튼 클릭
2. Apple App Store에 구매 내역 조회 요청
3. App Store가 만료된 구독 반환 (expired)
4. 앱이 만료된 구독을 무시
5. ⚠️ 알림 표시:
   제목: "구매 내역 없음"
   내용: "복원할 구매 내역을 찾을 수 없습니다."
```

**사용자가 보는 것:**
- 만료된 구독은 복원되지 않음
- 새로 구독해야 함

---

#### **시나리오 4: 네트워크 오류** ❌
```
1. 사용자가 "구매 복원" 버튼 클릭
2. Apple App Store에 구매 내역 조회 요청
3. 네트워크 오류 발생 (인터넷 연결 없음)
4. ❌ 알림 표시:
   제목: "복원 실패"
   내용: "구매 복원 중 오류가 발생했습니다."
```

**사용자가 보는 것:**
- ❌ 에러 알림 (빨간색 X)
- 인터넷 연결 확인 필요

---

## 🔍 **코드 동작 상세 분석**

### **1. 사용자 버튼 클릭**
```typescript
// components/subscription/SubscriptionPlans.tsx:374
<TouchableOpacity onPress={handleRestorePurchases}>
  <Text>구매 복원</Text>
</TouchableOpacity>
```

### **2. 구매 복원 시작**
```typescript
// components/subscription/SubscriptionPlans.tsx:132-137
const handleRestorePurchases = async () => {
  setLoading(true);  // 로딩 스피너 표시
  console.log('🔄 구매 복원 시작...');

  const success = await restorePurchases();  // PremiumContext 호출
```

### **3. IAPManager 구매 복원 로직**
```typescript
// utils/iapManager.ts:286-319
static async restorePurchases(): Promise<boolean> {
  // 1. Apple App Store API 호출
  const purchases = await RNIap.getAvailablePurchases();

  // 2. 구독 상품만 필터링
  for (const purchase of purchases) {
    if (Object.values(SUBSCRIPTION_SKUS).includes(purchase.productId)) {
      // tarot_timer_monthly 또는 tarot_timer_yearly

      // 3. 영수증 검증
      const receiptData = purchase.transactionReceipt;
      await this.processPurchaseSuccess(
        purchase.productId,
        purchase.transactionId,
        receiptData
      );
    }
  }

  // 4. 성공/실패 반환
  return purchases.length > 0;
}
```

### **4. 프리미엄 상태 저장**
```typescript
// utils/iapManager.ts:325-370
private static async processPurchaseSuccess(...) {
  // 1. 영수증 검증 (Apple 서버 확인)
  const validationResult = await ReceiptValidator.validateReceipt(...);

  // 2. AsyncStorage에 프리미엄 상태 저장
  await LocalStorageManager.setPremiumStatus({
    is_premium: true,
    subscription_type: productId,
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: expirationDate,
    transaction_id: transactionId,
    ad_free: true,
    unlimited_spreads: true
  });
}
```

### **5. 알림 표시**
```typescript
// components/subscription/SubscriptionPlans.tsx:139-158
if (success) {
  Alert.alert(
    '복원 완료',  // 제목
    '이전 구매가 성공적으로 복원되었습니다!',  // 내용
    [{
      text: '확인',
      onPress: () => {
        onSubscriptionSuccess?.();  // 프리미엄 상태 새로고침
        onClose?.();  // 구독 화면 닫기
      }
    }]
  );
} else {
  Alert.alert(
    '구매 내역 없음',
    '복원할 구매 내역을 찾을 수 없습니다.'
  );
}
```

---

## 📊 **구매 복원 vs 구독 시작 비교**

| 항목 | 구매 복원 | 구독 시작 |
|------|----------|----------|
| **용도** | 기존 구독 다시 활성화 | 새로운 구독 시작 |
| **Apple ID** | 같은 Apple ID 필요 | 아무 Apple ID |
| **비용** | 무료 (이미 결제함) | 결제 필요 |
| **작동 방식** | App Store 조회 | App Store 결제 |
| **결과** | 기존 구독 복원 | 새 구독 생성 |
| **실패 시** | 구매 내역 없음 알림 | 결제 실패 알림 |

---

## 🧪 **테스트 방법**

### **TestFlight 환경에서 테스트:**

#### **준비사항:**
1. Sandbox Tester 계정 생성 (App Store Connect)
2. iPhone 설정 → App Store → Sandbox Account 로그인
3. App Store Connect에 Product ID 생성

#### **테스트 시나리오 1: 구독 → 복원**
```
1. "구독 시작" 버튼으로 월간 구독
2. 결제 완료 (Sandbox 환경이므로 실제 결제 안 됨)
3. ✅ 프리미엄 활성화 확인
4. 앱 삭제 → 재설치
5. "구매 복원" 버튼 클릭
6. ✅ "복원 완료" 알림 확인
7. ✅ 프리미엄 다시 활성화 확인
```

#### **테스트 시나리오 2: 구독 없이 복원 시도**
```
1. 구독하지 않은 상태
2. "구매 복원" 버튼 클릭
3. ⚠️ "구매 내역 없음" 알림 확인
4. 화면 그대로 유지
```

#### **테스트 시나리오 3: 네트워크 오류**
```
1. iPhone Wi-Fi 끄기
2. "구매 복원" 버튼 클릭
3. ❌ "복원 실패" 알림 확인
```

---

## 🐞 **현재 Build 102의 문제**

### **문제:**
```
❌ 구매 오류: react-native-iap API 사용 불가
```

**"구매 복원" 버튼도 작동하지 않습니다!**

### **원인:**
- Build 102에 `react-native-iap` 네이티브 모듈이 포함되지 않음
- `RNIap.getAvailablePurchases()` 함수 사용 불가

### **해결:**
- Build 103 생성 필요
- Build 103에서 "구매 복원" 정상 작동 예상

---

## 📱 **사용자 경험 (UX)**

### **정상 작동 시:**

#### **성공 케이스:**
```
[사용자 클릭] → [로딩 스피너 1-2초] → [✅ 복원 완료 알림] → [자동 화면 닫힘] → [프리미엄 활성화]
```

**시간**: 약 2-3초

#### **실패 케이스:**
```
[사용자 클릭] → [로딩 스피너 1-2초] → [⚠️ 구매 내역 없음 알림] → [화면 그대로]
```

**시간**: 약 2-3초

---

## 💡 **사용자 FAQ**

### **Q: "구매 복원"을 눌렀는데 "구매 내역 없음"이 나와요**
**A:** 다음을 확인해주세요:
1. 이 Apple ID로 구독했는지 확인
2. 구독이 만료되지 않았는지 확인
3. 다른 Apple ID로 구매했다면 해당 계정으로 로그인 필요

### **Q: "구매 복원"을 눌렀는데 아무 일도 안 일어나요**
**A:** Build 102의 알려진 버그입니다. Build 103 업데이트를 기다려주세요.

### **Q: "구매 복원"으로 만료된 구독을 연장할 수 있나요?**
**A:** 아니요. 구매 복원은 활성화된 구독만 복원합니다. 만료된 경우 새로 구독해야 합니다.

### **Q: 다른 사람의 구독을 복원할 수 있나요?**
**A:** 아니요. 같은 Apple ID에서 구매한 구독만 복원 가능합니다.

### **Q: 가족 공유로 복원할 수 있나요?**
**A:** 현재는 불가능합니다. 구독은 Apple ID별로 관리됩니다.

---

## 🔐 **보안 및 검증**

### **영수증 검증 프로세스:**

```
1. 사용자 구매 복원 요청
2. Apple App Store에서 영수증 받기
3. 앱이 영수증을 검증 서버에 전송
4. 검증 서버가 Apple 서버에 영수증 확인
5. Apple 서버가 유효성 확인 응답
6. 검증 통과 시 프리미엄 활성화
```

**보안 기능:**
- ✅ Apple 서버 직접 검증
- ✅ 영수증 위조 방지
- ✅ 만료 날짜 자동 확인
- ✅ Transaction ID 중복 방지

---

## 📝 **요약**

### **"구매 복원" 버튼의 역할:**
재설치, 기기 변경 등으로 사라진 구독을 **Apple ID 기반**으로 다시 활성화

### **나와야 하는 화면:**
1. **성공**: "복원 완료" → 화면 자동 닫힘 → 프리미엄 활성화
2. **실패**: "구매 내역 없음" → 화면 유지

### **현재 상황 (Build 102):**
- ❌ react-native-iap API 사용 불가
- ❌ 구매 복원 작동 안 함
- ✅ Build 103에서 해결 예정

---

**마지막 업데이트**: 2025-10-27
**작성자**: Claude Code AI Assistant
