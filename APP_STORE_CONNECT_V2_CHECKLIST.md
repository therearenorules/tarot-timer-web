# App Store Connect V2 구독 설정 체크리스트

**마지막 업데이트**: 2025-11-10
**목적**: Build 119 구독 상품 로딩 실패 문제 해결을 위한 설정 확인

---

## 🚨 긴급 확인 사항

### 1. V2 Subscription Group 상태 확인

**위치**: App Store Connect → 앱 → 구독

#### 확인할 항목:
- [ ] **Subscription Group 이름**: "Tarot Timer Premium V2"
- [ ] **Group ID**: 21820675
- [ ] **상태**: "Ready to Submit" 또는 "Approved"
- [ ] **Product 개수**: 2개 (월간 + 연간)

**스크린샷 참고**: [App Store Connect → 구독 → Tarot Timer Premium V2]

---

### 2. V2 Product IDs "Cleared for Sale" 확인

**위치**: App Store Connect → 구독 → Tarot Timer Premium V2 → Products

#### 월간 구독 (tarot_timer_monthly_v2)
- [ ] **Product ID**: `tarot_timer_monthly_v2`
- [ ] **Apple ID**: 6754749911
- [ ] **✅ Cleared for Sale**: 체크되어 있어야 함
- [ ] **가격**: ₩4,900 (KRW)
- [ ] **기간**: 1개월 (P1M)
- [ ] **상태**: "Ready to Submit" 또는 "Approved"

#### 연간 구독 (tarot_timer_yearly_v2)
- [ ] **Product ID**: `tarot_timer_yearly_v2`
- [ ] **Apple ID**: 6755033513
- [ ] **✅ Cleared for Sale**: 체크되어 있어야 함
- [ ] **가격**: ₩35,000 (KRW)
- [ ] **기간**: 1년 (P1Y)
- [ ] **상태**: "Ready to Submit" 또는 "Approved"

**중요**: "Cleared for Sale" 체크박스가 **반드시** 체크되어 있어야 합니다!

---

### 3. 메타데이터 완성도 확인

**위치**: 각 Product ID → 편집

#### 필수 메타데이터:
- [ ] **Display Name**: 설정됨 (예: "Monthly Premium", "Yearly Premium")
- [ ] **Description**: 구독 설명 작성됨 (한국어)
- [ ] **Subscription Display Name**: 설정됨
- [ ] **Description for Review**: 심사자용 설명 작성됨

**예시**:
```
Display Name: Monthly Premium
Description: 월간 프리미엄 구독으로 모든 프리미엄 기능을 이용하세요.
- 무제한 타로 세션 저장
- 무제한 저널 엔트리
- 광고 완전 제거
- 프리미엄 스프레드 접근
```

---

### 4. 계약 서명 상태 확인

**위치**: App Store Connect → 계약, 세금 및 금융 거래

#### 필수 계약:
- [ ] **Paid Applications Agreement**: 서명됨 (Status: Active)
- [ ] **Banking Information**: 완료
- [ ] **Tax Information**: 완료
- [ ] **Contact Information**: 완료

**주의**: 계약이 서명되지 않으면 구독 상품이 로드되지 않습니다!

---

### 5. 앱 릴리스 상태 확인

**위치**: App Store Connect → 앱 정보 → 버전

#### 확인 사항:
- [ ] **앱 상태**: "Approved" 또는 "Ready for Sale"
- [ ] **버전**: 1.1.3
- [ ] **Build 번호**: 119
- [ ] **Release 버튼**: 클릭됨 (승인 ≠ 릴리스)

**중요**: Approved 상태여도 "Release" 버튼을 눌러야 실제로 출시됩니다!

---

## 🕐 타이밍 이슈 확인

### 6. 전파 시간 대기 (24-48시간)

#### Build 119 배포 일정:
- **빌드 시작**: 2025-11-07 18:09 KST
- **빌드 완료**: 2025-11-07 18:19 KST (10분 소요)
- **TestFlight 업로드**: 2025-11-07 18:25 KST
- **Apple 심사**: 2025-11-09 (약 48시간 후)

#### 전파 대기 시간:
- [ ] **24시간 경과**: 2025-11-08 18:25 이후
- [ ] **48시간 경과**: 2025-11-09 18:25 이후
- [ ] **현재 시간**: __________

**Apple Developer Forums 권장 사항**:
- 새로운 IAP는 승인 후 최대 **48시간** 전파 시간 필요
- 계약 서명 후 동기화에 **24시간** 추가 소요 가능
- 서버 동기화 버그로 인해 **72시간**까지 걸릴 수 있음

---

## 🔧 StoreKit Configuration 확인

### 7. TarotTimer.storekit 파일 검증

**위치**: 프로젝트 루트/TarotTimer.storekit

#### 확인 사항:
- [ ] **Subscription Group ID**: 21820675
- [ ] **Subscription Group Name**: "Tarot Timer Premium V2"
- [ ] **Product 1 ID**: tarot_timer_monthly_v2
- [ ] **Product 1 Internal ID**: 6754749911
- [ ] **Product 2 ID**: tarot_timer_yearly_v2
- [ ] **Product 2 Internal ID**: 6755033513
- [ ] **Application Internal ID**: 6752687014

**검증 방법**:
```bash
# TarotTimer.storekit 내용 확인
cat TarotTimer.storekit | grep -E "productID|internalID|subscriptionGroupID"
```

**예상 출력**:
```json
"subscriptionGroupID" : "21820675",
"internalID" : "6754749911",
"productID" : "tarot_timer_monthly_v2",
"internalID" : "6755033513",
"productID" : "tarot_timer_yearly_v2",
```

---

## 🧪 TestFlight 테스트 확인

### 8. TestFlight에서 V2 구독 상품 로딩 테스트

**위치**: TestFlight → Build 119 → 설치 → 설정 → 프리미엄 구독

#### 테스트 단계:
1. [ ] TestFlight 앱에서 Build 119 설치
2. [ ] 앱 실행 → 설정 탭
3. [ ] "프리미엄 구독" 또는 "Premium" 버튼 클릭
4. [ ] 로딩 시간 측정: ___초
5. [ ] 구독 상품 표시 여부:
   - [ ] Monthly Premium: ₩4,900 표시됨
   - [ ] Yearly Premium: ₩35,000 표시됨

#### 예상 결과:
- ✅ **성공**: 2-3초 내 구독 상품 로드됨
- ❌ **실패**: "구독 상품을 불러올 수 없습니다" 에러

**실패 시 대응**:
1. "다시 시도" 버튼 클릭 (새로운 기능)
2. 앱 재시작
3. 24시간 후 다시 테스트 (전파 대기)
4. App Store Connect 설정 재확인 (위 1-7단계)

---

## 📊 디버그 로깅 확인

### 9. Xcode 콘솔에서 IAP 로그 확인

**Xcode 연결 방법**:
1. Xcode → Window → Devices and Simulators
2. 기기 선택 → Connect via network
3. 기기에서 앱 실행
4. Xcode → Debug → Attach to Process → Tarot Timer

#### 확인할 로그:
```
✅ react-native-iap 모듈 로드 성공
💳 IAP 매니저 초기화 시작...
📱 플랫폼: ios
📱 iOS 버전: 18.1
🔧 react-native-iap 버전: 14.4.23
✅ IAP 연결 초기화 완료
📦 구독 상품 로드 시도: ["tarot_timer_monthly_v2", "tarot_timer_yearly_v2"]
🔄 RNIap.getSubscriptions() 호출 중...
✅ getSubscriptions 응답 받음
📦 응답 길이: 2
✅ 구독 상품 로드 완료: 2개
```

#### 에러 로그 예시:
```
❌ getSubscriptions 호출 실패: Error: E_IAP_NOT_AVAILABLE
📌 에러 메시지: Unable to get products from the App Store
📌 가능한 원인:
   1. Sandbox 계정으로 로그인되지 않음
   2. App Store Connect 동기화 대기 중 (최대 24시간)
   3. 구독 그룹이 활성화되지 않음
```

---

## ✅ 최종 체크리스트 (모두 체크되어야 함)

### App Store Connect 설정:
- [ ] V2 Subscription Group 생성됨 (21820675)
- [ ] V2 Product IDs 생성됨 (monthly_v2, yearly_v2)
- [ ] "Cleared for Sale" 체크됨 (양쪽 모두)
- [ ] 메타데이터 완성 (설명, 가격)
- [ ] 계약 서명 완료 (Paid Apps, Banking, Tax)

### 타이밍:
- [ ] 승인 후 24시간 경과
- [ ] 최소 48시간 경과 (권장)

### 코드:
- [ ] TarotTimer.storekit 파일 V2 IDs 설정
- [ ] iapManager.ts V2 Product IDs 사용
- [ ] 에러 메시지 개선 (Build 120+)

### 테스트:
- [ ] TestFlight 테스트 통과
- [ ] iPhone 테스트 통과
- [ ] iPad 테스트 통과
- [ ] 디버그 로그 확인

---

## 🚨 문제 해결 가이드

### 상황 1: "Cleared for Sale" 체크박스가 없음
**원인**: 메타데이터 미완성
**해결**: Product 편집 → 모든 필수 필드 작성 → 저장

### 상황 2: 계약이 "Action Required" 상태
**원인**: Banking 또는 Tax 정보 누락
**해결**: 계약 → Banking/Tax 정보 입력 → 계약 재서명

### 상황 3: 48시간 경과했지만 여전히 로드 실패
**원인**: Apple 서버 동기화 버그
**해결**:
1. Apple Developer Support 문의
2. V1 Product IDs로 롤백 (긴급 시)
3. App Store Connect 설정 재확인

### 상황 4: TestFlight에서는 성공, 프로덕션에서 실패
**원인**: 프로덕션 환경 전파 지연
**해결**:
1. 72시간 추가 대기
2. Apple Developer Forums 케이스 참고
3. Apple Developer Support 케이스 오픈

---

## 📧 Apple Developer Support 문의 템플릿

```
Subject: V2 Subscription Products Not Loading - App ID 6752687014

Dear Apple Developer Support,

I am experiencing an issue with V2 subscription products not loading in production.

App Information:
- App Name: Tarot Timer
- App ID: 6752687014
- Bundle ID: com.tarottimer.app
- Version: 1.1.3
- Build: 119

Subscription Group:
- Name: Tarot Timer Premium V2
- Group ID: 21820675

Product IDs:
- tarot_timer_monthly_v2 (Apple ID: 6754749911)
- tarot_timer_yearly_v2 (Apple ID: 6755033513)

Issue:
- Products load successfully in TestFlight (Sandbox)
- Products fail to load in Production
- Error: "Unable to get products from the App Store"
- Time elapsed since approval: 48+ hours

Verified:
✅ "Cleared for Sale" checked for both products
✅ All contracts signed (Paid Apps, Banking, Tax)
✅ Metadata completed
✅ 48-hour propagation period elapsed
✅ TarotTimer.storekit configuration correct

Could you please check if there is a server synchronization issue?

Thank you for your assistance.

Best regards,
[Your Name]
```

---

**마지막 업데이트**: 2025-11-10
**문서 버전**: 1.0.0
**작성자**: Claude Code AI Assistant
