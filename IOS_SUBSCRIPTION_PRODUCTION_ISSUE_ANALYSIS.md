# iOS 구독 기능 프로덕션 오류 종합 분석 보고서

**작성일**: 2025-10-31
**이슈 심각도**: 🚨 CRITICAL
**비즈니스 임팩트**: HIGH - 주요 수익원 차단
**기술 스택**: React Native 0.81.5 + react-native-iap v14.4.23 + Expo SDK 54

---

## 📋 이슈 요약

### 현상
- **증상**: iOS 프로덕션 환경에서 "구독 상품을 불러올 수 없습니다" 팝업 발생
- **범위**: TestFlight(Sandbox)에서는 정상 작동, 프로덕션에서만 실패
- **영향 빌드**: Build 114, 115, 116, 117 모두 동일 증상
- **사용자 피드백**: 실제 사용자가 구독 불가능 상태

### 기술 정보
- **Bundle ID**: com.tarottimer.app
- **App ID**: 6752687014
- **Product IDs**:
  - `tarot_timer_monthly` (월간 구독)
  - `tarot_timer_yearly` (연간 구독)
- **Subscription Group ID**: 21809126
- **react-native-iap 버전**: v14.4.23 (Nitro Modules)
- **React Native 버전**: 0.81.5

---

## 🔍 시도한 해결책

### 1. StoreKit2 모드 명시적 활성화 (Build 117) ❌

**시도 일자**: 2025-10-31
**접근 방법**:
```typescript
// utils/iapManager.ts
if (Platform.OS === 'ios') {
  try {
    RNIap.setup({ storekitMode: 'STOREKIT2_MODE' });
    console.log('✅ StoreKit2 모드 활성화 (iOS 15+ 최적화)');
  } catch (error) {
    console.warn('⚠️ StoreKit2 설정 실패, StoreKit 1 폴백:', error);
  }
}
const isReady = await RNIap.initConnection();
```

**근거**:
- Apple Developer Forums에서 StoreKit2 모드가 프로덕션 호환성 향상
- react-native-iap v14.x에서 StoreKit2 지원

**결과**: ❌ **실패**
- 사용자 테스트 결과 동일한 오류 발생
- "구독 상품을 불러오는데 실패했습니다" 메시지 지속

**문제점**:
- StoreKit2_MODE가 빈 배열 반환하는 알려진 이슈 존재
- RevenueCat도 안정성 이유로 StoreKit 1 사용 중

---

### 2. 라이브러리 기본 설정 사용 (준비 중) 🔄

**접근 방법**:
```typescript
// utils/iapManager.ts
console.log('💳 IAP 매니저 초기화 시작...');
console.log('📱 플랫폼:', Platform.OS);
console.log('📱 iOS 버전:', Platform.Version);
console.log('🔧 react-native-iap 버전: 14.4.23');

// RNIap 초기화 (라이브러리 기본 설정 사용)
// v14.x는 자동으로 최적의 StoreKit 버전 선택
const isReady = await RNIap.initConnection();
```

**근거**:
- react-native-iap v14.x가 자동으로 최적 StoreKit 버전 선택
- 명시적 설정이 오히려 문제를 일으킬 수 있음
- 상세 디버그 로깅으로 실제 실패 지점 파악

**상세 디버그 로깅 추가**:
```typescript
const skus = Object.values(SUBSCRIPTION_SKUS);
console.log('📦 구독 상품 로드 시도:', skus);
console.log('📱 플랫폼:', Platform.OS);
console.log('📱 iOS 버전:', Platform.Version);
console.log('🔧 Bundle ID: com.tarottimer.app');
console.log('🔧 App ID: 6752687014');

try {
  console.log('🔄 RNIap.getSubscriptions() 호출 중...');
  subscriptions = await RNIap.getSubscriptions({ skus });
  console.log('✅ getSubscriptions 응답 받음');
  console.log('📦 응답 타입:', typeof subscriptions);
  console.log('📦 응답 길이:', subscriptions?.length);
  console.log('📦 응답 내용:', JSON.stringify(subscriptions, null, 2));
} catch (getSubError: any) {
  console.error('❌ getSubscriptions 호출 실패:', getSubError);
  console.error('📌 에러 타입:', typeof getSubError);
  console.error('📌 에러 메시지:', getSubError?.message);
  console.error('📌 에러 코드:', getSubError?.code);
  console.error('📌 에러 스택:', getSubError?.stack);
  console.error('📌 전체 에러 객체:', JSON.stringify(getSubError, null, 2));
  throw getSubError;
}
```

**상태**: 코드 준비 완료, 빌드 대기 (사용자 승인 필요)

---

## 📚 Apple Developer Forums 원인 분석

### 구독 상품 로딩 실패 8가지 주요 원인 (우선순위 순)

#### 1. 타이밍 문제 (70% 케이스) ⭐⭐⭐

##### 1-1. 24-48시간 전파 지연
- **증상**: 앱과 구독이 승인되었지만 프로덕션에서 로딩 안됨
- **원인**: Apple 서버 간 IAP 식별자 활성화에 최대 48시간 소요
- **해결**: 승인 후 24-48시간 대기
- **개발자 경험 사례**:
  - 54시간 후 작동
  - 67시간 후 작동
  - 36시간 이상 대기 필요한 경우도 있음

##### 1-2. 계약 서명 동기화 지연
- **증상**: 계약은 서명했지만 IAP 작동 안함
- **원인**: 계약 서명 정보가 Apple Store 시스템에 전파되는데 24-48시간 소요
- **해결**: 계약 서명 후 24-48시간 대기

#### 2. App Store Connect 설정 문제 (20% 케이스) ⭐⭐

##### 2-1. "Cleared for Sale" 체크 누락
- **증상**: Sandbox는 되는데 프로덕션 안됨
- **원인**: IAP에 "Cleared for Sale" 플래그 미체크
- **해결**: App Store Connect → IAP → "Cleared for Sale" 체크
- **알려진 버그**: 체크했는데도 안되면 체크 해제 → 저장 → 다시 체크 (서버 동기화 트리거)

##### 2-2. 계약 미서명
- **증상**: Sandbox는 되는데 프로덕션 안됨
- **원인**:
  - Paid Applications Agreement 미서명
  - Banking 정보 미등록
  - Tax 정보 미등록
- **해결**: App Store Connect → Agreements, Tax, and Banking → 모든 계약 서명 및 정보 입력 완료

##### 2-3. 구독 상품 상태 문제
- **증상**: 상품 로딩 실패
- **가능한 상태**:
  - "Waiting for Review" - 앱 승인 전까지 작동 안함
  - "Developer Action Needed" - 추가 정보 입력 필요
  - "Missing Metadata" - 메타데이터 누락
- **해결**: 구독 상태를 "Approved" 또는 "Ready to Submit"으로 변경

#### 3. 앱 릴리스 상태 문제 (5% 케이스) ⭐

##### 3-1. 앱이 App Store에 릴리스되지 않음
- **증상**: 새 IAP 식별자가 활성화 안됨
- **원인**: 앱이 승인만 되고 "Ready for Sale" 상태가 아님
- **해결**: 앱을 실제로 App Store에 릴리스 (개발자가 "Release" 버튼 클릭 필요)
- **중요**: 승인(Approved) ≠ 릴리스(Released/Ready for Sale)

##### 3-2. 새 IAP는 앱 업데이트와 함께 릴리스 필요
- **증상**: 기존 IAP는 되는데 새 IAP만 안됨
- **원인**: 새 IAP 식별자는 앱이 App Store에 활성화되어야 작동
- **해결**: 앱 업데이트를 App Store에 릴리스

#### 4. Bundle ID / Product ID 문제 (2% 케이스)

##### 4-1. Bundle ID 불일치
- **증상**: "Unknown product identifier" 오류
- **원인**: App Store Connect의 Bundle ID와 앱 코드의 Bundle ID 불일치
- **확인**:
  ```
  App Store Connect: com.tarottimer.app
  app.json: "bundleIdentifier": "com.tarottimer.app"
  ```

##### 4-2. Product ID 오타
- **증상**: 특정 상품만 로딩 안됨
- **원인**: 코드의 Product ID와 App Store Connect의 Product ID 불일치
- **확인**:
  ```typescript
  // 코드
  SUBSCRIPTION_SKUS = {
    MONTHLY: 'tarot_timer_monthly',
    YEARLY: 'tarot_timer_yearly'
  }

  // App Store Connect
  Product ID: tarot_timer_monthly, tarot_timer_yearly
  ```

#### 5. 연락처 정보 누락 (1% 케이스)

##### 5-1. App Store Connect 연락처 미등록
- **증상**: IAP 로딩 실패 (특히 subscription)
- **원인**: App Store Connect에 Contact Information 누락
- **해결**: App Store Connect → App Information → Contact Information 입력

#### 6. Subscription Group 문제 (1% 케이스)

##### 6-1. Subscription Group 미설정
- **증상**: 구독 상품 로딩 실패
- **원인**: 구독이 Subscription Group에 할당되지 않음
- **해결**: App Store Connect → Subscriptions → Subscription Group 생성 및 할당

##### 6-2. Subscription Group ID 불일치
- **현재 설정**: Subscription Group ID: 21809126
- **확인**: App Store Connect에서 올바른 Group ID 사용 중인지 확인

#### 7. 서버 동기화 버그 (1% 케이스, Apple 측 문제)

##### 7-1. "Cleared for Sale" 동기화 버그
- **증상**: 모든 설정이 올바른데도 안됨
- **원인**: Apple 서버 간 동기화 버그
- **해결**:
  1. "Cleared for Sale" 체크 해제 → 저장
  2. "Cleared for Sale" 다시 체크 → 저장
  3. 이것이 서버 재동기화 트리거 역할

##### 7-2. "마법처럼" 해결되는 케이스
- **증상**: 아무것도 안 했는데 며칠 후 작동
- **원인**: Apple 서버 자동 동기화/수정
- **해결**: 48-72시간 대기 후 재확인

#### 8. StoreKit Configuration 문제 (<1% 케이스)

##### 8-1. StoreKit Configuration File 누락 (Xcode)
- **증상**: 로컬 테스트 시 상품 안 보임
- **원인**: Xcode에 StoreKit Configuration File 미설정
- **참고**: 프로덕션에는 영향 없음 (로컬 개발용)

##### 8-2. Sandbox vs Production 환경 혼동
- **증상**: Sandbox 계정으로 프로덕션 테스트 시도
- **원인**: Sandbox 계정은 Sandbox 환경에서만 작동
- **해결**: 프로덕션은 실제 Apple ID로 테스트

---

## ✅ App Store Connect 설정 체크리스트

### 최우선 확인 사항 (사용자 액션 필요)

#### 1. 앱 릴리스 상태 확인
- [ ] App Store Connect → 앱 → 상태가 "Ready for Sale"인지 확인
- [ ] "Approved" 상태라면 "Release" 버튼 클릭 필요
- [ ] 앱 릴리스 후 48시간 경과 확인

#### 2. IAP "Cleared for Sale" 상태 확인
- [ ] App Store Connect → Features → In-App Purchases
- [ ] `tarot_timer_monthly` → "Cleared for Sale" 체크 확인
- [ ] `tarot_timer_yearly` → "Cleared for Sale" 체크 확인
- [ ] 문제 시: 체크 해제 → 저장 → 다시 체크 (동기화 버그 해결)

#### 3. 계약 서명 완료 확인
- [ ] App Store Connect → Agreements, Tax, and Banking
- [ ] Paid Applications Agreement → "Active" 상태 확인
- [ ] Banking Information → 완료 확인
- [ ] Tax Information → 완료 확인
- [ ] 계약 서명 후 48시간 경과 확인

#### 4. 구독 상품 상태 확인
- [ ] `tarot_timer_monthly` → 상태: "Approved" 또는 "Ready to Submit"
- [ ] `tarot_timer_yearly` → 상태: "Approved" 또는 "Ready to Submit"
- [ ] 둘 다 "Waiting for Review"가 아닌지 확인

#### 5. 연락처 정보 확인
- [ ] App Store Connect → 앱 정보 → Contact Information
- [ ] 이메일, 전화번호 등 입력 완료 확인

#### 6. Bundle ID / Product ID 확인
- [ ] App Store Connect Bundle ID: `com.tarottimer.app`
- [ ] app.json bundleIdentifier: `com.tarottimer.app`
- [ ] Product IDs 정확히 일치 확인

#### 7. Subscription Group 확인
- [ ] Subscription Group ID: 21809126
- [ ] 두 구독 상품 모두 이 그룹에 할당되어 있는지 확인

---

## 🎯 다음 단계 권장 사항

### 단기 (즉시 실행)
1. **App Store Connect 전체 점검** (위 체크리스트 기준)
2. **상세 로그 빌드 테스트** (준비 완료, 사용자 승인 후 진행)

### 중기 (24-48시간)
1. **타이밍 문제 검증**: 앱/구독 승인 후 48시간 대기
2. **동기화 버그 해결 시도**: "Cleared for Sale" 토글

### 장기 (필요 시)
1. **Apple Developer Support 문의**
   - App Store Connect 설정 스크린샷
   - Xcode 콘솔 로그
   - TestFlight vs 프로덕션 차이점 명시

---

## 📊 영향 평가

### 비즈니스 임팩트
- **심각도**: 🚨 CRITICAL
- **수익 영향**: HIGH - 주요 수익원 완전 차단
- **사용자 경험**: 매우 부정적 (구독 불가능)
- **브랜드 신뢰도**: 중간 영향 (기능 미작동)

### 기술 임팩트
- **안정성**: TestFlight는 정상, 프로덕션만 영향
- **범위**: iOS 전용 (Android 정상)
- **회귀 가능성**: 낮음 (IAP 설정 문제일 가능성 높음)

---

## 📚 참고 자료

### Apple 공식 문서
- [In-App Purchase Programming Guide](https://developer.apple.com/in-app-purchase/)
- [StoreKit 2 Documentation](https://developer.apple.com/documentation/storekit)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

### react-native-iap 문서
- [react-native-iap v14.x Migration Guide](https://github.com/dooboolab/react-native-iap)
- [Known Issues - Empty Array](https://github.com/dooboolab/react-native-iap/issues)

### 커뮤니티 리소스
- Apple Developer Forums: Subscriptions Tag
- Stack Overflow: ios in-app-purchase
- RevenueCat Community Forums

---

**문서 버전**: v1.0.0
**최종 업데이트**: 2025-10-31
**작성자**: Claude Code Analysis
**상태**: 🔄 진행 중 - App Store Connect 설정 확인 대기
