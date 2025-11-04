# App Store Review Response - Guideline 3.1.2

## 📧 Apple 심사팀 회신 메시지

---

### English Version

**Subject**: Re: Guideline 3.1.2 - Business - Payments - Subscriptions

Dear App Store Review Team,

Thank you for your feedback regarding Guideline 3.1.2. We have updated our app to address the issues you identified.

**Changes Made:**

1. **Terms of Use (EULA) Link Added**
   - We have added a functional link to our Terms of Use on the subscription purchase screen
   - URL: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
   - The link is clearly visible and accessible to users before making a purchase

2. **Privacy Policy Link Verified**
   - Our Privacy Policy link is fully functional and accessible
   - URL: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
   - Users can review our privacy practices before subscribing

3. **Support URL Updated**
   - Support URL has been updated in App Store Connect metadata
   - URL: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html

**New Build Information:**
- Version: 1.1.1
- Build Number: 107
- Submission Date: October 30, 2025

**Testing Instructions:**
1. Open the app and navigate to Settings tab
2. Tap the "Upgrade" button
3. On the subscription selection screen, you will see both "Terms of Service" and "Privacy Policy" links at the bottom
4. Both links are fully functional and display the complete legal documents

We believe these changes fully address the concerns raised in Guideline 3.1.2. All required legal information is now easily accessible to users before they make any purchase decisions.

Please let us know if you need any additional information or clarification.

Thank you for your time and consideration.

Best regards,
Tarot Timer Development Team

---

### Korean Version (한국어 버전)

**제목**: Re: 가이드라인 3.1.2 - 비즈니스 - 결제 - 구독

App Store 심사팀님께,

가이드라인 3.1.2에 대한 피드백 감사드립니다. 지적하신 사항을 해결하기 위해 앱을 업데이트했습니다.

**변경 사항:**

1. **이용약관(EULA) 링크 추가**
   - 구독 구매 화면에 이용약관 링크를 추가했습니다
   - URL: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
   - 사용자가 구매 전 명확하게 확인할 수 있습니다

2. **개인정보처리방침 링크 확인**
   - 개인정보처리방침 링크가 정상적으로 작동합니다
   - URL: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
   - 사용자가 구독 전 개인정보 정책을 확인할 수 있습니다

3. **지원 URL 업데이트**
   - App Store Connect 메타데이터의 지원 URL을 업데이트했습니다
   - URL: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html

**새 빌드 정보:**
- 버전: 1.1.1
- 빌드 번호: 107
- 제출일: 2025년 10월 30일

**테스트 방법:**
1. 앱을 열고 설정 탭으로 이동
2. "업그레이드" 버튼 클릭
3. 구독 선택 화면 하단에 "이용약관" 및 "개인정보처리방침" 링크 확인
4. 두 링크 모두 정상 작동하며 완전한 법적 문서를 표시합니다

이번 변경사항으로 가이드라인 3.1.2의 모든 요구사항을 충족했다고 생각합니다. 사용자가 구매 결정을 내리기 전에 모든 필수 법적 정보에 쉽게 접근할 수 있습니다.

추가 정보나 설명이 필요하시면 언제든 알려주시기 바랍니다.

시간 내주셔서 감사합니다.

감사합니다,
Tarot Timer 개발팀

---

## 📋 App Store Connect에서 할 작업

### 1. 빌드가 처리되면 (5-10분 후):

1. **App Store Connect 접속**
   - https://appstoreconnect.apple.com/apps/6752687014/appstore

2. **새 버전 제출 준비**
   - 좌측 메뉴: **App Store** 탭
   - **+ 버전 또는 플랫폼** 클릭
   - **iOS** 선택
   - 버전 번호: **1.1.1** 입력

3. **빌드 선택**
   - 빌드 섹션에서 **+ 빌드 추가** 클릭
   - **Build 107** 선택

4. **심사팀에 메모 추가**
   - "App Review Information" 섹션으로 스크롤
   - "Notes" 필드에 위의 **English Version** 메시지 복사/붙여넣기

5. **변경 사항 설명** (선택사항)
   - "What's New in This Version" 섹션:
   ```
   - Fixed subscription legal links (Terms of Service and Privacy Policy)
   - Improved subscription purchase flow
   - Bug fixes and performance improvements
   ```

6. **심사 제출**
   - 우측 상단 **저장** 클릭
   - **심사를 위해 제출** 버튼 클릭

---

## 🔍 심사팀 확인 포인트

심사자가 확인할 내용:

✅ **구독 화면 접근**:
```
설정 탭 → 업그레이드 버튼 → 구독 선택 화면
```

✅ **법적 문서 링크**:
- 이용약관 링크 (화면 하단)
- 개인정보처리방침 링크 (화면 하단)

✅ **링크 작동 여부**:
- 두 링크 모두 브라우저에서 정상 열림
- 완전한 법적 문서 표시

---

## 💡 추가 팁

1. **빠른 심사 요청** (선택사항):
   - 심사 제출 후 "Expedited Review Request" 가능
   - 긴급한 버그 수정인 경우 사용
   - https://developer.apple.com/contact/app-store/?topic=expedite

2. **예상 심사 시간**:
   - 일반적으로 24-48시간
   - 평균 36시간

3. **심사 상태 확인**:
   - App Store Connect에서 실시간 확인 가능
   - 상태: In Review → Processing for App Store → Ready for Sale

---

**작성일**: 2025-10-30
**버전**: 1.1.1 (Build 107)
**목적**: Guideline 3.1.2 준수 확인 및 재심사 요청
