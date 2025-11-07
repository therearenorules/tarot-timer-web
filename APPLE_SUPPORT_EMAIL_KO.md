# Apple 개발자 지원팀 - IAP 구독 문제 보고서

---

## 📧 문의 메일 (한국어)

**제목:** TestFlight 인앱 결제 구독 상품 로드 실패 - 앱 ID 6752687014

---

안녕하세요, Apple 개발자 지원팀

저는 **Tarot Timer** 앱의 TestFlight 빌드에서 발생한 인앱 결제(IAP) 구독 기능 문제에 대해 지원을 요청드리고자 합니다.

모든 설정 절차를 완료하고 구독 상품도 App Store Connect에서 승인 받았으나, TestFlight 테스트 시 구독 상품을 불러올 수 없는 문제가 발생하고 있습니다.

---

## 1. 앱 기본 정보

| 항목 | 내용 |
|------|------|
| **앱 이름** | Tarot Timer - Learn Card Meanings |
| **Bundle ID** | com.tarottimer.app |
| **Apple ID** | 6752687014 |
| **현재 빌드** | 114 (버전 1.1.2) |
| **플랫폼** | iOS |
| **TestFlight 상태** | 승인 완료, 테스트 가능 |
| **개발 프레임워크** | React Native (Expo) |
| **IAP 라이브러리** | react-native-iap v14.4.23 |

---

## 2. 구독 상품 설정 정보

### 구독 그룹
- **이름:** Tarot Timer Premium
- **그룹 ID:** 21809126
- **App Store Connect 상태:** 승인됨

### 구독 상품

#### 1) Monthly Premium (월간 구독)
- **Product ID:** `tarot_timer_monthly`
- **Internal ID:** 6738248438
- **가격:** $4.99 USD (₩6,600 KRW)
- **구독 기간:** 1개월
- **App Store Connect 상태:** 승인됨

#### 2) Yearly Premium (연간 구독)
- **Product ID:** `tarot_timer_yearly`
- **Internal ID:** 6738248622
- **가격:** $34.99 USD (₩45,000 KRW)
- **구독 기간:** 1년
- **App Store Connect 상태:** 승인됨

---

## 3. 발생한 문제 상세 설명

### 문제 현상
TestFlight 빌드 114를 설치한 사용자가 프리미엄 구독 화면에 진입할 때, **"구독 상품을 불러올 수 없습니다"** 라는 오류 메시지가 표시되고 구독 상품이 전혀 표시되지 않습니다.

### 사용자 경험 흐름
1. ✅ TestFlight에서 빌드 114 설치 완료
2. ✅ 앱 실행 정상 작동
3. ✅ 프리미엄 구독 화면으로 이동
4. ❌ 앱이 App Store에서 구독 상품 로드 시도
5. ❌ 오류 팝업 표시: "구독 상품을 불러올 수 없습니다"
6. ❌ 구독 옵션이 전혀 표시되지 않아 구매 불가능

### 문제 발생 타임라인
- **2025년 10월 30일**: 구독 상품 생성 및 App Store Connect에 등록
- **2025년 10월 31일**: 구독 상품 Apple 승인 완료
- **2025년 11월 6일**: 빌드 114 TestFlight 업로드
- **2025년 11월 6일**: 빌드 114 TestFlight 승인 완료
- **2025년 11월 7일 (현재)**: 승인 후 24시간 이상 경과했으나 문제 지속됨

---

## 4. 기술적 구현 세부사항

### 코드 구현 방식

#### 구독 상품 ID 정의
```typescript
// 앱에서 사용하는 Product ID 정의
const SUBSCRIPTION_SKUS = {
  monthly: 'tarot_timer_monthly',
  yearly: 'tarot_timer_yearly'
};
```

#### App Store에서 구독 상품 로드
```typescript
// react-native-iap 라이브러리 사용
const subscriptions = await RNIap.getSubscriptions({
  skus: ['tarot_timer_monthly', 'tarot_timer_yearly']
});

console.log('로드된 구독 상품:', subscriptions);
// 예상: [{ productId: 'tarot_timer_monthly', ... }, { productId: 'tarot_timer_yearly', ... }]
// 실제: [] (빈 배열)
```

### 예상 동작
`RNIap.getSubscriptions()` 함수가 App Store Connect에 등록된 2개의 구독 상품 정보를 포함한 배열을 반환해야 합니다.

### 실제 동작
`RNIap.getSubscriptions()` 함수가 **빈 배열 `[]`을 반환**하여, 앱에서 "구독 상품을 찾을 수 없습니다" 오류 메시지를 표시합니다.

### 빌드 설정
- **EAS Build 시스템 사용**
- **expo-build-properties 플러그인 포함**
- **IAP 네이티브 모듈 정상 링크 확인**
- **useFrameworks: "static" 설정 적용**

---

## 5. 이미 수행한 문제 해결 시도

저희가 이미 확인하고 시도한 내용은 다음과 같습니다:

### ✅ 확인 완료 항목

1. **Product ID 일치 확인**
   - 코드의 Product ID: `tarot_timer_monthly`, `tarot_timer_yearly`
   - App Store Connect의 Product ID: `tarot_timer_monthly`, `tarot_timer_yearly`
   - **결과:** 완벽히 일치 ✅

2. **구독 상품 승인 상태 확인**
   - App Store Connect에서 두 상품 모두 "승인됨" 상태 확인
   - **결과:** 정상 승인됨 ✅

3. **Bundle Identifier 일치 확인**
   - 코드: `com.tarottimer.app`
   - App Store Connect: `com.tarottimer.app`
   - **결과:** 일치 ✅

4. **빌드 설정 확인**
   - expo-build-properties 플러그인 포함 확인
   - app.json에 IAP 관련 설정 정상 확인
   - **결과:** 정상 설정됨 ✅

5. **네이티브 모듈 링크 확인**
   - react-native-iap 네이티브 모듈이 빌드에 포함되었는지 확인
   - `RNIap.initConnection()` 정상 호출 확인
   - **결과:** 정상 작동 ✅

6. **Sandbox Tester 계정 생성 및 테스트**
   - 여러 개의 Sandbox Tester 계정 생성
   - 각 계정으로 로그인 시도
   - **결과:** 계정은 정상이나 구독 상품 로드 실패 ❌

7. **동기화 대기 시간**
   - App Store Connect 승인 후 24시간 이상 대기
   - 여러 차례 앱 재시작 및 재테스트
   - **결과:** 여전히 문제 지속 ❌

8. **가격 및 지역 설정 확인**
   - 한국(KOR) 지역: ₩6,600 / ₩45,000 설정 확인
   - 미국(USA) 지역: $4.99 / $34.99 설정 확인
   - **결과:** 정상 설정됨 ✅

---

## 6. Apple 지원팀에 확인 요청 사항

다음 사항들에 대해 확인 및 안내를 부탁드립니다:

### 1) 구독 그룹 상태 확인
**질문:** 구독 그룹 "Tarot Timer Premium" (ID: 21809126)에 대해 보류 중인 요구사항이나 누락된 메타데이터가 있나요?

- 구독 그룹이 "준비됨(Ready)" 상태인지 확인 필요
- "승인됨(Approved)"과 "준비됨(Ready)"의 차이가 있는지 확인 필요

### 2) TestFlight 상품 가용성 확인
**질문:** 구독 상품 (`tarot_timer_monthly`, `tarot_timer_yearly`)이 TestFlight에서 실제로 조회 가능한 상태로 동기화되었나요?

- App Store Connect에서는 "승인됨"으로 표시되나, TestFlight에서는 아직 사용 불가능한 상태인지 확인 필요

### 3) 동기화 지연 여부
**질문:** App Store Connect 승인과 TestFlight 실제 사용 가능 사이에 동기화 지연이 있나요?

- 현재 승인 후 24시간 이상 경과
- 추가 대기 시간이 필요한지, 아니면 다른 문제가 있는지 확인 필요

### 4) 필수 메타데이터 확인
**질문:** TestFlight에서 구독 상품이 표시되기 위해 누락된 필수 메타데이터가 있나요?

확인이 필요한 항목:
- [ ] 구독 상품 스크린샷
- [ ] 검토 노트(Review Notes)
- [ ] 현지화 정보(한국어, 영어)
- [ ] 구독 설명(Description)
- [ ] 기타 필수 필드

### 5) Paid Applications Agreement 상태
**질문:** "유료 앱 계약(Paid Applications Agreement)"이 IAP 및 TestFlight 테스트를 위해 정상적으로 활성화되어 있나요?

- Agreements, Tax, and Banking 섹션 확인 필요
- 계약 상태가 "Active"인지 확인 필요

### 6) 서버 측 진단 로그
**질문:** Apple 서버에서 `getSubscriptions()` API 호출 시 빈 배열이 반환되는 이유를 파악할 수 있는 진단 로그나 정보가 있나요?

- 클라이언트 측에서는 API 호출이 성공하나 결과가 비어있음
- 서버 측 로그에서 원인을 파악 가능한지 확인 필요

---

## 7. 추가 참고 정보

### 테스트 환경
- **테스트 기기:** iPhone (iOS 17 이상)
- **테스트 방법:** TestFlight 앱을 통한 설치
- **네트워크 상태:** 안정적인 WiFi 연결 확인
- **Sandbox 계정:** 여러 계정 생성하여 테스트 완료

### 예상 원인 (저희 측 추정)
1. App Store Connect와 TestFlight 간 동기화 지연
2. 구독 그룹 또는 상품에 누락된 필수 메타데이터 존재
3. Paid Applications Agreement 설정 문제
4. 지역별 가격 설정 문제 (한국/미국)
5. 기타 알 수 없는 서버 측 동기화 문제

---

## 8. 요청 사항

다음 사항에 대해 확인 및 안내를 부탁드립니다:

1. **구독 상품 설정 검증**
   - 구독 그룹 및 상품이 TestFlight에서 사용 가능한 상태인지 확인
   - 누락된 설정이나 메타데이터가 있다면 구체적으로 안내

2. **동기화 상태 확인**
   - App Store Connect와 TestFlight 간 동기화가 완료되었는지 확인
   - 동기화 지연이 있다면 예상 완료 시간 안내

3. **문제 원인 파악**
   - 서버 측 로그를 통해 `getSubscriptions()` 빈 배열 반환 원인 파악
   - 근본 원인 및 해결 방법 안내

4. **해결 방법 제공**
   - TestFlight 사용자가 구독 기능을 정상적으로 테스트할 수 있도록 구체적인 해결 방법 제공

---

## 9. 첨부 가능한 자료

요청하시면 다음 자료를 추가로 제공할 수 있습니다:

### 📸 스크린샷
- App Store Connect 구독 그룹 상태 화면
- 각 구독 상품의 상세 설정 화면
- 가격 및 가용성 설정 화면
- Agreements, Tax, and Banking 상태 화면
- TestFlight 앱에서 발생한 오류 화면

### 📄 로그 파일
- Xcode Console에서 수집한 기기 로그
- 앱 실행 및 구독 화면 진입 시 발생한 로그
- `RNIap.getSubscriptions()` 호출 시 상세 로그

### 💻 프로젝트 설정 파일
- app.json (Bundle ID, 버전 정보)
- TarotTimer.storekit (구독 설정 파일)
- eas.json (빌드 설정)

---

## 10. 연락처 정보

**개발자 정보:**
- 이름: [귀하의 이름]
- 이메일: [귀하의 이메일]
- Apple Developer 계정: [계정 ID]
- 앱 이름: Tarot Timer - Learn Card Meanings
- Apple ID: 6752687014

**선호 연락 방법:** 이메일

---

## 맺음말

저희는 모든 설정을 정확히 완료했다고 판단되나, TestFlight에서 구독 상품이 로드되지 않는 문제가 계속되고 있습니다.

사용자들이 구독 기능을 테스트할 수 있도록 이 문제를 빠르게 해결하고자 합니다.

Apple 지원팀의 도움을 받아 근본 원인을 파악하고 해결 방법을 찾고 싶습니다.

추가로 필요한 정보나 스크린샷이 있으시면 언제든지 알려주시기 바랍니다.

빠른 답변 부탁드리며, 감사합니다.

---

**작성일:** 2025년 11월 7일
**빌드 버전:** 114 (v1.1.2)
**문서 버전:** 1.0

---

## 📋 제출 전 체크리스트

메일을 보내기 전에 다음 사항을 확인하세요:

### 필수 확인 사항
- [ ] 개인 정보 입력 완료 (이름, 이메일, 계정 ID)
- [ ] App Store Connect 스크린샷 준비 (구독 그룹, 상품 상태)
- [ ] 기기 콘솔 로그 수집 (선택사항이지만 권장)
- [ ] 메일 내용 재확인 (오타, 정보 정확성)

### 첨부 파일 준비
- [ ] 구독 그룹 상태 스크린샷 (필수)
- [ ] 각 구독 상품 상태 스크린샷 (필수)
- [ ] 가격 설정 스크린샷 (권장)
- [ ] 기기 콘솔 로그 파일 (권장)
- [ ] Agreements 상태 스크린샷 (권장)

---

## 📮 제출 방법

### 방법 1: Apple Developer Support 웹사이트 (권장)
1. https://developer.apple.com/contact/ 접속
2. "App Store Connect" 선택
3. "In-App Purchase" 선택
4. 위 메일 내용 복사하여 붙여넣기
5. 스크린샷 첨부
6. 제출

**예상 응답 시간:** 2-3 영업일

### 방법 2: App Store Connect 내에서 문의
1. App Store Connect 로그인
2. 우측 상단 "?" (도움말) 아이콘 클릭
3. "Contact Us" 선택
4. 메일 내용 붙여넣기 및 제출

**예상 응답 시간:** 2-3 영업일

### 방법 3: Apple 개발자 포럼 (빠른 커뮤니티 응답)
1. https://developer.apple.com/forums/ 접속
2. "App Store Connect" 카테고리 선택
3. "New Question" 클릭
4. 제목: "TestFlight에서 IAP 구독 상품 로드 실패"
5. 내용 붙여넣기 및 게시

**예상 응답 시간:** 1-2일 (커뮤니티 답변)

---

## 💡 추가 팁

### 메일 작성 시 주의사항
- **구체적으로 작성**: 추상적인 표현보다 구체적인 수치와 상태 표시
- **스크린샷 필수**: 말로 설명하기 어려운 부분은 스크린샷으로 보완
- **예의 바르게**: 공손한 어조로 작성 (빠른 답변 확률 증가)
- **티켓 번호 보관**: 답변 받으면 티켓 번호(Case Number) 기록

### 후속 조치
- 3일 후에도 답변이 없으면 후속 메일 발송
- 해결 시 결과를 커뮤니티에 공유 (다른 개발자 도움)
- 비슷한 문제 방지를 위해 해결 과정 문서화

---

**문서 생성:** Claude Code
**최종 수정:** 2025-11-07
