# App Store 심사 회신 대응 가이드

**심사 회신 날짜**: 2025년 10월 29일
**Submission ID**: e8fb3eeb-ecf2-41d5-9d09-0e097f652daf
**버전**: 1.0.9

---

## 📋 문제 요약

Apple App Store 심사에서 **2가지 주요 이슈**가 발견되었습니다:

### 1. Guideline 3.1.2 - 구독 필수 정보 누락 ⚠️
- 앱 바이너리에 이용약관(EULA) 링크 누락
- 앱 바이너리에 개인정보처리방침 링크 누락
- App Store Connect 메타데이터에 이용약관 링크 누락
- App Store Connect 메타데이터에 개인정보처리방침 링크 누락

### 2. Guideline 1.5 - Support URL 문제 ⚠️
- 현재 Support URL이 실제 고객 지원 정보를 제공하지 않음
- 현재 URL: `https://therearenorules.github.io/`
- 문제: 사용자가 질문하고 지원을 요청할 수 있는 기능 정보가 없음

---

## ✅ 완료된 작업

### 1. 법률 문서 HTML 파일 생성 ✅
다음 3개의 HTML 파일이 `public/` 폴더에 생성되었습니다:

```
✅ public/privacy-policy.html  (이미 존재)
✅ public/terms.html           (새로 생성)
✅ public/support.html         (새로 생성)
```

### 2. 앱 코드 업데이트 ✅
`components/subscription/SubscriptionPlans.tsx` 파일의 URL이 업데이트되었습니다:

**변경 전:**
```typescript
const PRIVACY_POLICY_URL = 'https://therearenorules.github.io/tarot-timer-landing/privacy.html';
const TERMS_OF_SERVICE_URL = 'https://therearenorules.github.io/tarot-timer-landing/terms.html';
```

**변경 후:**
```typescript
const PRIVACY_POLICY_URL = 'https://therearenorules.github.io/tarot-timer-web/privacy-policy.html';
const TERMS_OF_SERVICE_URL = 'https://therearenorules.github.io/tarot-timer-web/terms.html';
```

### 3. GitHub Pages 배포 설정 ✅
- GitHub Actions workflow 생성: `.github/workflows/github-pages.yml`
- 자동 배포 설정 완료
- `public/` 폴더의 파일들이 GitHub Pages에 배포됨

### 4. Git 커밋 및 푸시 ✅
```bash
✅ Commit: feat: Add legal documents for App Store compliance
✅ Commit: feat: Add GitHub Pages deployment workflow
✅ Push: origin/main
```

---

## 🔧 추가 조치 필요 사항

### Step 1: GitHub Pages 활성화 확인 (필수)

**GitHub 리포지토리 설정에서 확인:**

1. GitHub에서 리포지토리 방문:
   ```
   https://github.com/therearenorules/tarot-timer-web
   ```

2. **Settings** → **Pages** 이동

3. 다음 설정 확인:
   - **Source**: GitHub Actions
   - **Custom domain**: (비워두기)

4. **GitHub Actions** 탭에서 배포 상태 확인:
   ```
   https://github.com/therearenorules/tarot-timer-web/actions
   ```
   - "📄 GitHub Pages 배포 (Legal Documents)" workflow가 성공적으로 실행되었는지 확인

5. 배포 완료 후 다음 URL이 접근 가능한지 테스트:
   ```
   ✅ https://therearenorules.github.io/tarot-timer-web/privacy-policy.html
   ✅ https://therearenorules.github.io/tarot-timer-web/terms.html
   ✅ https://therearenorules.github.io/tarot-timer-web/support.html
   ```

---

### Step 2: App Store Connect 메타데이터 업데이트 (필수)

**App Store Connect 접속:**
```
https://appstoreconnect.apple.com
```

#### 2.1 Privacy Policy URL 추가

1. **My Apps** → **Tarot Timer** 선택
2. **App Information** 클릭
3. **Privacy Policy URL** 필드 찾기
4. 다음 URL 입력:
   ```
   https://therearenorules.github.io/tarot-timer-web/privacy-policy.html
   ```
5. **Save** 클릭

#### 2.2 Terms of Service (EULA) 추가

**방법 1 - App Description에 링크 추가 (권장):**

1. **App Store** → **1.0.9 버전** 선택
2. **App Description** 편집
3. 설명 하단에 다음 추가:
   ```
   📄 Terms of Service: https://therearenorules.github.io/tarot-timer-web/terms.html
   📄 Privacy Policy: https://therearenorules.github.io/tarot-timer-web/privacy-policy.html
   ```

**방법 2 - EULA 필드 사용:**

1. **App Information** 섹션
2. **License Agreement** 또는 **EULA** 필드
3. 다음 URL 입력:
   ```
   https://therearenorules.github.io/tarot-timer-web/terms.html
   ```

#### 2.3 Support URL 수정

1. **App Information** 섹션
2. **Support URL** 필드 찾기
3. 현재 값 확인:
   ```
   ❌ https://therearenorules.github.io/
   ```
4. 다음 URL로 변경:
   ```
   ✅ https://therearenorules.github.io/tarot-timer-web/support.html
   ```
5. **Save** 클릭

---

### Step 3: 앱 바이너리 재빌드 (필수)

코드가 업데이트되었으므로 새로운 빌드가 필요합니다.

#### 3.1 버전 번호 업데이트

`app.json` 파일에서 버전 번호를 올립니다:

```json
{
  "expo": {
    "version": "1.0.10",
    "ios": {
      "buildNumber": "11"
    }
  }
}
```

#### 3.2 빌드 실행

**로컬에서 빌드:**
```bash
# iOS 프로덕션 빌드
eas build --platform ios --profile production-ios

# 또는 npm script 사용
npm run build:prod:ios
```

**또는 GitHub Actions 사용:**
1. GitHub → Actions 탭
2. "🚀 타로 타이머 모바일 앱 배포 파이프라인" workflow 선택
3. "Run workflow" 클릭
4. Platform: `ios` 선택
5. "Run workflow" 실행

#### 3.3 새 빌드 제출

빌드가 완료되면:
1. EAS에서 빌드 완료 확인
2. App Store Connect에서 새 빌드 선택
3. 심사 재제출

---

## 📊 체크리스트

### GitHub 설정
- [x] `public/privacy-policy.html` 생성/확인
- [x] `public/terms.html` 생성
- [x] `public/support.html` 생성
- [x] GitHub Pages workflow 생성
- [x] Git push 완료
- [ ] GitHub Actions 실행 성공 확인
- [ ] GitHub Pages URL 접근 가능 확인

### 앱 코드
- [x] `SubscriptionPlans.tsx` URL 업데이트
- [ ] 로컬에서 앱 테스트 (링크 동작 확인)
- [ ] `app.json` 버전 업데이트
- [ ] 새 빌드 생성
- [ ] 빌드 완료 확인

### App Store Connect
- [ ] Privacy Policy URL 추가
- [ ] EULA/Terms of Service 링크 추가
- [ ] Support URL 수정
- [ ] 새 빌드 업로드
- [ ] 심사 재제출

---

## 🔗 중요 URL 모음

### 배포된 문서 (GitHub Pages)
```
Privacy Policy:   https://therearenorules.github.io/tarot-timer-web/privacy-policy.html
Terms of Service: https://therearenorules.github.io/tarot-timer-web/terms.html
Support:          https://therearenorules.github.io/tarot-timer-web/support.html
```

### 관리 대시보드
```
App Store Connect:    https://appstoreconnect.apple.com
GitHub Actions:       https://github.com/therearenorules/tarot-timer-web/actions
GitHub Pages:         https://github.com/therearenorules/tarot-timer-web/settings/pages
EAS Dashboard:        https://expo.dev/accounts/[your-account]/projects/tarot-timer-web
```

---

## 💡 심사 재제출 시 메시지 (선택사항)

Apple에 다음과 같은 메시지를 보낼 수 있습니다:

```
Hi Apple Review Team,

Thank you for your feedback. We have addressed all the issues mentioned in your review:

1. **Guideline 3.1.2 - Subscriptions**:
   - ✅ Added functional Privacy Policy link in the app
   - ✅ Added functional Terms of Use (EULA) link in the app
   - ✅ Updated App Store Connect metadata with both links
   - URLs are now accessible at:
     - Privacy Policy: https://therearenorules.github.io/tarot-timer-web/privacy-policy.html
     - Terms of Service: https://therearenorules.github.io/tarot-timer-web/terms.html

2. **Guideline 1.5 - Support URL**:
   - ✅ Updated Support URL to: https://therearenorules.github.io/tarot-timer-web/support.html
   - This page now provides comprehensive customer support information including:
     - Contact email addresses
     - FAQ section
     - Links to legal documents
     - Response time information

We have submitted a new build (version 1.0.10) with these changes. Please let us know if you need any additional information.

Thank you!
```

---

## 📞 문의

이슈가 발생하면 다음 이메일로 문의:
- **개발자 지원**: support@tarottimer.app
- **개인정보 문의**: privacy@tarottimer.app

---

**마지막 업데이트**: 2025년 10월 29일
**작성자**: Claude Code
**상태**: ✅ 문서 준비 완료, 추가 조치 필요
