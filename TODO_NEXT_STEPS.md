# 🎯 다음 단계 - 당신이 해야 할 작업들

**현재 상태**: ✅ 모든 법률 문서 준비 완료, URL 검증 완료
**다음 목표**: App Store 심사 재제출
**예상 소요 시간**: 30-60분

---

## 📋 체크리스트 (순서대로 진행)

### ✅ Step 1: URL 브라우저 테스트 (5분) - **지금 바로 시작!**

다음 3개 URL을 브라우저에서 직접 열어보세요:

#### 1️⃣ Privacy Policy
```
https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
```

**확인 사항**:
- [ ] 페이지가 정상적으로 보이는가?
- [ ] 한국어 섹션에 **changsekwon@gmail.com** 표시되는가?
- [ ] 한국어 섹션에 **Instagram DM: @deanosajutaro** 표시되는가?
- [ ] English 섹션도 같은 연락처가 있는가?

**문제 발생 시**: `Cmd + Shift + R` (강력 새로고침) 또는 시크릿 모드로 열기

---

#### 2️⃣ Terms of Service
```
https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
```

**확인 사항**:
- [ ] 페이지가 정상적으로 보이는가?
- [ ] "10. 고객 지원" 섹션에 **changsekwon@gmail.com** 표시되는가?
- [ ] **Instagram DM: @deanosajutaro** 표시되는가?
- [ ] 구독 요금제 테이블 정상 표시 (Monthly $4.99, Annual $34.99)?

---

#### 3️⃣ Support Page
```
https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html
```

**확인 사항**:
- [ ] 페이지가 정상적으로 보이는가?
- [ ] 이메일 지원 카드에 **changsekwon@gmail.com** 표시 및 클릭 시 이메일 앱 열리는가?
- [ ] Instagram DM 카드에 **@deanosajutaro** 표시 및 클릭 시 인스타그램 이동하는가?
- [ ] FAQ 섹션이 보이는가?

---

### ⭐ Step 2: App Store Connect 업데이트 (15분)

**접속**: https://appstoreconnect.apple.com

#### 2-1. Privacy Policy URL 추가

1. **My Apps** → **Tarot Timer** 선택
2. 왼쪽 메뉴에서 **App Information** 클릭
3. **Privacy Policy URL** 필드 찾기
4. 다음 URL 입력:
   ```
   https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
   ```
5. **Save** 버튼 클릭

**체크**: [ ] Privacy Policy URL 저장 완료

---

#### 2-2. Terms of Service (EULA) 추가

**방법 1 - App Description에 추가 (권장)**:

1. 왼쪽 메뉴에서 **App Store** 클릭
2. 현재 버전 (1.0.9) 선택
3. **App Description** 필드 편집
4. 설명 **맨 하단**에 다음 추가:
   ```

   📄 Legal Documents:
   • Terms of Service: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
   • Privacy Policy: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
   ```
5. **Save** 버튼 클릭

**OR**

**방법 2 - EULA 필드 사용**:

1. **App Information** 섹션
2. **License Agreement** 필드 찾기
3. 다음 URL 입력:
   ```
   https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
   ```
4. **Save** 버튼 클릭

**체크**: [ ] Terms of Service 링크 추가 완료

---

#### 2-3. Support URL 수정

1. **App Information** 섹션
2. **Support URL** 필드 찾기
3. 현재 값 확인 (아마 `https://therearenorules.github.io/`)
4. 다음 URL로 **교체**:
   ```
   https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html
   ```
5. **Save** 버튼 클릭

**체크**: [ ] Support URL 저장 완료

---

### 🔨 Step 3: 앱 버전 업데이트 (2분)

`app.json` 파일을 열어서 버전 번호를 올려야 합니다.

**현재 버전**:
```json
"version": "1.0.9",
"ios": {
  "buildNumber": "104"
}
```

**변경할 버전**:
```json
"version": "1.0.10",
"ios": {
  "buildNumber": "105"
}
```

**작업**:
- [ ] `app.json` 파일 열기
- [ ] `version`을 `"1.0.10"`으로 변경
- [ ] `ios.buildNumber`를 `"105"`로 변경
- [ ] 파일 저장
- [ ] Git 커밋: `git add app.json && git commit -m "chore: Bump version to 1.0.10 for App Store resubmission"`

**❓ 도움이 필요하면**: "버전 업데이트 도와줘"라고 말씀하세요!

---

### 🚀 Step 4: 새 iOS 빌드 생성 (20-30분)

터미널에서 다음 명령어 실행:

```bash
eas build --platform ios --profile production-ios
```

**예상 소요 시간**: 15-20분 (EAS 서버에서 빌드)

**진행 상황 확인**:
- 터미널에서 빌드 진행 상황 표시됨
- 또는 https://expo.dev 에서 확인

**체크**: [ ] 빌드가 성공적으로 완료됨

**빌드 완료 후**:
- 빌드 URL이 터미널에 표시됨
- EAS에서 자동으로 App Store Connect에 업로드됨 (5-10분 소요)

---

### 📱 Step 5: App Store Connect에서 새 빌드 선택 (5분)

빌드가 완료되고 App Store Connect에 업로드되면:

1. App Store Connect → **Tarot Timer** 선택
2. 왼쪽 메뉴에서 **App Store** 클릭
3. **+ Version or Platform** → **iOS** 선택
4. 버전 번호 입력: `1.0.10`
5. **Build** 섹션에서 새 빌드 선택 (105)
   - 빌드가 안 보이면 5-10분 기다린 후 새로고침
6. **What's New in This Version** 작성:
   ```
   Bug fixes and improvements:
   • Added privacy policy and terms of service links
   • Updated support contact information
   • Improved subscription information display
   ```

**체크**: [ ] 새 빌드 (1.0.10 - 105) 선택 완료

---

### 🎯 Step 6: 심사 재제출 (5분)

1. 모든 정보가 올바른지 최종 확인
2. **Submit for Review** 버튼 클릭
3. 제출 확인 팝업에서 **Submit** 클릭

**선택사항 - Apple에 메시지 남기기**:

Review Notes 섹션에 다음과 같이 작성할 수 있습니다:

```
Hi Apple Review Team,

Thank you for your feedback. We have addressed all the issues:

1. Guideline 3.1.2 - Subscriptions:
   ✅ Added functional Privacy Policy link in the app
   ✅ Added functional Terms of Use (EULA) link in the app
   ✅ Updated App Store Connect metadata with both links

2. Guideline 1.5 - Support URL:
   ✅ Updated Support URL with comprehensive customer support information
   ✅ Contact: changsekwon@gmail.com and Instagram @deanosajutaro

All legal documents are now accessible and include required subscription information.

Thank you for your review!
```

**체크**: [ ] 심사 재제출 완료

---

## 🎉 완료!

심사 재제출이 완료되면:
- **심사 대기 시간**: 보통 1-3일
- **상태 확인**: App Store Connect에서 실시간 확인 가능
- **알림**: Apple이 결과를 이메일로 전송함

---

## ⚠️ 자주 하는 실수

### 실수 1: 빌드 번호를 올리지 않음
❌ **잘못된 예**: version만 1.0.10으로 올리고 buildNumber는 그대로 104
✅ **올바른 예**: version 1.0.10 + buildNumber 105

### 실수 2: URL에 오타
❌ 복사-붙여넣기할 때 공백이나 줄바꿈이 포함됨
✅ URL 전체를 복사해서 한 줄로 붙여넣기

### 실수 3: App Store Connect 변경사항 저장 안 함
❌ URL을 입력하고 Save를 누르지 않음
✅ 각 섹션마다 반드시 Save 버튼 클릭

### 실수 4: 캐시된 페이지 확인
❌ 브라우저 캐시 때문에 오래된 내용이 보임
✅ 강력 새로고침(Cmd+Shift+R) 또는 시크릿 모드 사용

---

## 🆘 문제 발생 시

### Q1: URL이 404 오류를 보여요
**해결**:
- GitHub에 제대로 푸시되었는지 확인: `git push origin main`
- URL 복사 시 오타가 없는지 확인
- 시크릿 모드로 다시 시도

### Q2: 빌드가 실패했어요
**해결**:
- `npm install` 실행 후 다시 빌드
- 오류 메시지를 복사해서 Claude에게 공유
- EAS 로그 확인: https://expo.dev

### Q3: App Store Connect에 새 빌드가 안 보여요
**해결**:
- 빌드 완료 후 5-10분 기다리기
- 페이지 새로고침
- 빌드가 Processing 상태인지 확인 (TestFlight 탭)

---

## 📞 도움이 필요하면

각 단계에서 막히는 부분이 있으면 언제든지 말씀해주세요:

- "Step 2 도와줘" - App Store Connect 설정 도움
- "빌드 실패했어" - 빌드 오류 해결
- "URL이 이상해" - URL 문제 해결

---

**📱 연락처**:
- 이메일: changsekwon@gmail.com
- Instagram: @deanosajutaro

**🚀 파이팅! 곧 심사를 통과할 거예요!**

---

**마지막 업데이트**: 2025년 10월 29일
**작성자**: Claude Code
**다음 예상 단계**: 심사 통과 → App Store 출시 🎉
