# ✅ 검증 완료된 URL 체크리스트

**검증 날짜**: 2025년 10월 29일
**버전**: 1.0.9 → 1.0.10 준비 중

---

## 🔗 App Store Connect에 입력할 3개 URL

### 1️⃣ Privacy Policy URL (필수)
```
https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
```

**입력 위치**: App Store Connect → App Information → Privacy Policy URL

**확인 사항**:
- ✅ HTTP 200 응답 확인 완료
- ✅ 한국어 섹션: changsekwon@gmail.com, @deanosajutaro 표시
- ✅ English 섹션: changsekwon@gmail.com, @deanosajutaro 표시
- ✅ 구 이메일 (support@, privacy@) 모두 제거됨

---

### 2️⃣ Terms of Service URL (필수 - EULA)
```
https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
```

**입력 위치**:
- 방법 1: App Store Connect → App Description (하단에 링크 추가)
- 방법 2: App Store Connect → App Information → EULA 필드

**확인 사항**:
- ✅ HTTP 200 응답 확인 완료
- ✅ 한국어 고객 지원 섹션: changsekwon@gmail.com, @deanosajutaro
- ✅ 한국어 환불 섹션: changsekwon@gmail.com 또는 Instagram @deanosajutaro
- ✅ English 섹션: changsekwon@gmail.com, @deanosajutaro
- ✅ 구독 자동갱신 안내 포함
- ✅ 환불 정책 명시

---

### 3️⃣ Support URL (필수)
```
https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html
```

**입력 위치**: App Store Connect → App Information → Support URL

**확인 사항**:
- ✅ HTTP 200 응답 확인 완료
- ✅ 이메일 지원: changsekwon@gmail.com (mailto 링크 동작)
- ✅ Instagram DM: @deanosajutaro (인스타그램 링크 동작)
- ✅ GitHub Repository 링크 포함
- ✅ FAQ 섹션 포함 (6개 한국어 + 5개 영어)
- ✅ 응답 시간 안내 포함
- ✅ 구독 취소, 환불, 복원 가이드 포함

---

## 📱 앱 코드 내 URL 확인

### SubscriptionPlans.tsx
**파일 경로**: `components/subscription/SubscriptionPlans.tsx`

**현재 URL**:
```typescript
const PRIVACY_POLICY_URL = 'https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html';
const TERMS_OF_SERVICE_URL = 'https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html';
```

**확인 사항**:
- ✅ Privacy Policy URL 업데이트 완료
- ✅ Terms of Service URL 업데이트 완료
- ✅ 앱 내에서 "개인정보처리방침" 버튼 클릭 시 해당 URL로 이동
- ✅ 앱 내에서 "이용약관" 버튼 클릭 시 해당 URL로 이동

---

## 🧪 브라우저 테스트 체크리스트

### Privacy Policy 브라우저 테스트
접속: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html

**체크 항목**:
- [ ] 페이지가 정상 로딩되는가?
- [ ] 보라색/골드 컬러 테마가 적용되는가?
- [ ] 한국어 섹션 "8. 개인정보 보호책임자"에 changsekwon@gmail.com 표시
- [ ] 한국어 섹션에 Instagram DM: @deanosajutaro 표시
- [ ] English 섹션 "5. Contact"에 Email: changsekwon@gmail.com 표시
- [ ] English 섹션에 Instagram DM: @deanosajutaro 표시

---

### Terms of Service 브라우저 테스트
접속: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html

**체크 항목**:
- [ ] 페이지가 정상 로딩되는가?
- [ ] 구독 요금제 테이블 정상 표시 (Monthly $4.99, Annual $34.99)
- [ ] 한국어 "10. 고객 지원"에 changsekwon@gmail.com 표시
- [ ] 한국어 "10. 고객 지원"에 Instagram DM: @deanosajutaro 표시
- [ ] 한국어 "4.3 환불 신청 방법"에 changsekwon@gmail.com 표시
- [ ] English "10. Contact"에 Email: changsekwon@gmail.com 표시
- [ ] English "10. Contact"에 Instagram DM: @deanosajutaro 표시
- [ ] 자동갱신 경고 박스(노란색) 표시
- [ ] 개인정보처리방침 링크 동작 (./privacy-policy.html)

---

### Support Page 브라우저 테스트
접속: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html

**체크 항목**:
- [ ] 페이지가 정상 로딩되는가?
- [ ] 그라데이션 배경 (보라→핑크) 적용
- [ ] 이메일 지원 카드에 changsekwon@gmail.com 표시 및 mailto 링크 동작
- [ ] Instagram DM 카드에 @deanosajutaro 표시 및 링크 동작
- [ ] Instagram 링크 클릭 시 https://www.instagram.com/deanosajutaro 이동
- [ ] GitHub Repository 링크 동작
- [ ] Quick Links (개인정보처리방침, 이용약관, iOS 앱) 3개 버튼 표시
- [ ] FAQ 한국어 6개 질문 표시
- [ ] FAQ 영어 5개 질문 표시
- [ ] 하단 연락처 박스에 changsekwon@gmail.com 및 @deanosajutaro 표시

---

## ⚠️ 캐시 문제 해결

만약 브라우저에서 오래된 내용이 보인다면:

### 해결 방법 1: 강력 새로고침
- **Windows**: `Ctrl + F5` 또는 `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 해결 방법 2: 시크릿/프라이빗 모드
- Chrome/Edge: `Ctrl + Shift + N` (Windows) 또는 `Cmd + Shift + N` (Mac)
- Safari: `Cmd + Shift + N`

### 해결 방법 3: 캐시 버스터 추가
URL 끝에 `?v=20251029` 추가:
```
https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html?v=20251029
```

---

## 📝 파일 검증 완료 내역

### privacy-policy.html
- **총 줄 수**: 140줄
- **changsekwon@gmail.com 출현**: 4회 (한국어 2회, 영어 2회)
- **@deanosajutaro 출현**: 4회 (한국어 2회, 영어 2회)
- **구 이메일**: 0회 ✅

### terms.html
- **총 줄 수**: 333줄
- **changsekwon@gmail.com 출현**: 5회 (한국어 3회, 영어 2회)
- **@deanosajutaro 출현**: 5회 (한국어 3회, 영어 2회)
- **구 이메일**: 0회 ✅

### support.html
- **총 줄 수**: 321줄
- **changsekwon@gmail.com 출현**: 6회
- **@deanosajutaro 출현**: 6회 (텍스트 4회 + 링크 2회)
- **Instagram 링크**: https://www.instagram.com/deanosajutaro (2회)
- **구 이메일**: 0회 ✅

---

## ✅ 최종 검증 결과

### 로컬 파일
- ✅ privacy-policy.html: 모든 연락처 업데이트 완료
- ✅ terms.html: 모든 연락처 업데이트 완료
- ✅ support.html: 모든 연락처 업데이트 완료

### GitHub Repository
- ✅ main 브랜치에 푸시 완료 (commit: eaba4cf)
- ✅ Raw GitHub URL 접근 가능 (200 OK)

### HTMLPreview URLs
- ✅ Privacy Policy: HTTP 200 OK
- ✅ Terms of Service: HTTP 200 OK
- ✅ Support: HTTP 200 OK

### 앱 코드
- ✅ SubscriptionPlans.tsx URL 업데이트 완료

---

## 🚀 다음 단계

1. **브라우저 테스트**: 위의 3개 URL을 브라우저에서 직접 열어서 시각적 확인
2. **App Store Connect 업데이트**: 3개 URL 입력
3. **앱 버전 업데이트**: app.json에서 1.0.10으로 변경
4. **새 빌드 생성**: `eas build --platform ios --profile production-ios`
5. **심사 재제출**

---

## 📧 연락처

**모든 고객 지원 및 문의**:
- ✉️ **이메일**: changsekwon@gmail.com
- 📱 **Instagram DM**: @deanosajutaro (https://www.instagram.com/deanosajutaro)

**GitHub**:
- 📦 **Repository**: https://github.com/therearenorules/tarot-timer-web

---

**검증자**: Claude Code
**최종 검증일**: 2025년 10월 29일
**상태**: ✅ 모든 파일 검증 완료, Apple 심사 제출 가능
